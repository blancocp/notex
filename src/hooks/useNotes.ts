import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Note, CreateNoteData, UpdateNoteData, NotesFilter } from '@/types/database'

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

      // Transformar los datos para incluir tags como array
      const transformedNotes = data?.map(note => ({
        ...note,
        tags: note.note_tags?.map((nt: any) => nt.tag) || [],
        urls: note.note_urls || []
      })) || []

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
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      // Crear la nota
      const { data: note, error: noteError } = await supabase
        .from('notes')
        .insert({
          title: noteData.title,
          description: noteData.description,
          content: noteData.content,
          category_id: noteData.category_id,
          user_id: user.id
        })
        .select()
        .single()

      if (noteError) throw noteError

      // Agregar tags si existen
      if (noteData.tags && noteData.tags.length > 0) {
        const tagPromises = noteData.tags.map(async (tagName) => {
          // Buscar o crear el tag
          let { data: tag } = await supabase
            .from('tags')
            .select('id')
            .eq('name', tagName)
            .eq('user_id', user.id)
            .single()

          if (!tag) {
            const { data: newTag, error: tagError } = await supabase
              .from('tags')
              .insert({ name: tagName, user_id: user.id })
              .select('id')
              .single()
            
            if (tagError) throw tagError
            tag = newTag
          }

          // Crear la relación nota-tag
          return supabase
            .from('note_tags')
            .insert({ note_id: note.id, tag_id: tag.id })
        })

        await Promise.all(tagPromises)
      }

      // Agregar URLs si existen
      if (noteData.urls && noteData.urls.length > 0) {
        const urlPromises = noteData.urls.map(url => 
          supabase
            .from('note_urls')
            .insert({
              note_id: note.id,
              url: url.url,
              title: url.title,
              description: url.description
            })
        )

        await Promise.all(urlPromises)
      }

      await fetchNotes()
      return note
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la nota'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updateNote = async (id: string, noteData: UpdateNoteData) => {
    try {
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      // Actualizar la nota
      const { error: noteError } = await supabase
        .from('notes')
        .update({
          title: noteData.title,
          description: noteData.description,
          content: noteData.content,
          category_id: noteData.category_id
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (noteError) throw noteError

      // Actualizar tags si se proporcionan
      if (noteData.tags !== undefined) {
        // Eliminar tags existentes
        await supabase
          .from('note_tags')
          .delete()
          .eq('note_id', id)

        // Agregar nuevos tags
        if (noteData.tags.length > 0) {
          const tagPromises = noteData.tags.map(async (tagName) => {
            let { data: tag } = await supabase
              .from('tags')
              .select('id')
              .eq('name', tagName)
              .eq('user_id', user.id)
              .single()

            if (!tag) {
              const { data: newTag, error: tagError } = await supabase
                .from('tags')
                .insert({ name: tagName, user_id: user.id })
                .select('id')
                .single()
              
              if (tagError) throw tagError
              tag = newTag
            }

            return supabase
              .from('note_tags')
              .insert({ note_id: id, tag_id: tag.id })
          })

          await Promise.all(tagPromises)
        }
      }

      // Actualizar URLs si se proporcionan
      if (noteData.urls !== undefined) {
        // Eliminar URLs existentes
        await supabase
          .from('note_urls')
          .delete()
          .eq('note_id', id)

        // Agregar nuevas URLs
        if (noteData.urls.length > 0) {
          const urlPromises = noteData.urls.map(url => 
            supabase
              .from('note_urls')
              .insert({
                note_id: id,
                url: url.url,
                title: url.title,
                description: url.description
              })
          )

          await Promise.all(urlPromises)
        }
      }

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

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

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