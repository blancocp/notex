import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Tag, CreateTagData, UpdateTagData } from '@/types/database'

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000'

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTags = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', DEFAULT_USER_ID)
        .order('name')

      if (error) throw error

      setTags(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los tags')
    } finally {
      setLoading(false)
    }
  }

  const createTag = async (tagData: CreateTagData) => {
    try {
      setError(null)

      // Verificar si el tag ya existe
      const { data: existingTag } = await supabase
        .from('tags')
        .select('id')
        .eq('name', tagData.name)
        .eq('user_id', DEFAULT_USER_ID)
        .single()

      if (existingTag) {
        throw new Error('El tag ya existe')
      }

      const { data, error } = await supabase
        .from('tags')
        .insert({
          name: tagData.name,
          user_id: DEFAULT_USER_ID
        })
        .select()
        .single()

      if (error) throw error

      await fetchTags()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el tag'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updateTag = async (id: string, tagData: UpdateTagData) => {
    try {
      setError(null)

      // Verificar si el nuevo nombre ya existe (excluyendo el tag actual)
      const { data: existingTag } = await supabase
        .from('tags')
        .select('id')
        .eq('name', tagData.name)
        .eq('user_id', DEFAULT_USER_ID)
        .neq('id', id)
        .single()

      if (existingTag) {
        throw new Error('Ya existe un tag con ese nombre')
      }

      const { error } = await supabase
        .from('tags')
        .update({
          name: tagData.name
        })
        .eq('id', id)
        .eq('user_id', DEFAULT_USER_ID)

      if (error) throw error

      await fetchTags()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar el tag'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const deleteTag = async (id: string) => {
    try {
      setError(null)

      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id)
        .eq('user_id', DEFAULT_USER_ID)

      if (error) throw error

      await fetchTags()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar el tag'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const searchTags = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', DEFAULT_USER_ID)
        .ilike('name', `%${query}%`)
        .order('name')
        .limit(10)

      if (error) throw error

      return data || []
    } catch (err) {
      console.error('Error al buscar tags:', err)
      return []
    }
  }

  useEffect(() => {
    fetchTags()
  }, [])

  return {
    tags,
    loading,
    error,
    createTag,
    updateTag,
    deleteTag,
    searchTags,
    refetch: fetchTags
  }
}
