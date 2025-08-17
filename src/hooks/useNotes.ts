import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Note, CreateNoteData, UpdateNoteData, NotesFilter } from '@/types/database'

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000'

export function useNotes(filter?: NotesFilter) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotes = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('notes')
        .select(`
          *,
          category:categories(*),
          note_tags(tag:tags(*)),
          note_urls(*)
        `)
        .eq('user_id', DEFAULT_USER_ID)
        .order('created_at', { ascending: false })

      if (filter?.category_id) {
        query = query.eq('category_id', filter.category_id)
      }

      if (filter?.search) {
        query = query.or(`title.ilike.%${filter.search}%,description.ilike.%${filter.search}%,content.ilike.%${filter.search}%`)
      }

      if (filter?.limit) {
        query = query.limit(filter.limit)
      }

      if (filter?.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) throw error

      // Transform tags array for easier consumption
      const transformedNotes = (data || []).map(note => ({
        ...note,
        tags: note.note_tags?.map((nt: any) => nt.tag) || [],
        urls: note.note_urls || []
      }))

      setNotes(transformedNotes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las notas')
    } finally {
      setLoading(false)
    }
  }

  const createNote = async (noteData: CreateNoteData) => {
    try {
      setError(null)

      const { data, error } = await supabase
        .from('notes')
        .insert({
          title: noteData.title,
          description: noteData.description,
          content: noteData.content,
          category_id: noteData.category_id,
          user_id: DEFAULT_USER_ID
        })
        .select()
        .single()

      if (error) throw error

      // Handle tags if provided
      if (noteData.tags && noteData.tags.length > 0) {
        const tagInserts = noteData.tags.map(tagId => ({
          note_id: data.id,
          tag_id: tagId
        }))

        const { error: tagError } = await supabase
          .from('note_tags')
          .insert(tagInserts)

        if (tagError) throw tagError
      }

      // Handle URLs if provided  
      if (noteData.urls && noteData.urls.length > 0) {
        const urlInserts = noteData.urls.map(url => ({
          note_id: data.id,
          url: url.url,
          title: url.title,
          description: url.description
        }))

        const { error: urlError } = await supabase
          .from('note_urls')
          .insert(urlInserts)

        if (urlError) throw urlError
      }

      await fetchNotes()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la nota'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updateNote = async (id: string, noteData: UpdateNoteData) => {
    try {
      setError(null)

      const { error } = await supabase
        .from('notes')
        .update({
          title: noteData.title,
          description: noteData.description,
          content: noteData.content,
          category_id: noteData.category_id
        })
        .eq('id', id)
        .eq('user_id', DEFAULT_USER_ID)

      if (error) throw error

      await fetchNotes()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar la nota'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const deleteNote = async (id: string) => {
    try {
      setError(null)

      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', DEFAULT_USER_ID)

      if (error) throw error

      await fetchNotes()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar la nota'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [filter])

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    refetch: fetchNotes
  }
}
