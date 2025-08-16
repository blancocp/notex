import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Tag, CreateTagData, UpdateTagData } from '@/types/database'

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
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      // Verificar si el tag ya existe
      const { data: existingTag } = await supabase
        .from('tags')
        .select('id')
        .eq('name', tagData.name)
        .eq('user_id', user.id)
        .single()

      if (existingTag) {
        throw new Error('El tag ya existe')
      }

      const { data, error } = await supabase
        .from('tags')
        .insert({
          name: tagData.name,
          description: tagData.description,
          color: tagData.color,
          user_id: user.id
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

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      // Verificar si el nuevo nombre ya existe (excluyendo el tag actual)
      const { data: existingTag } = await supabase
        .from('tags')
        .select('id')
        .eq('name', tagData.name)
        .eq('user_id', user.id)
        .neq('id', id)
        .single()

      if (existingTag) {
        throw new Error('Ya existe un tag con ese nombre')
      }

      const { error } = await supabase
        .from('tags')
        .update({
          name: tagData.name,
          description: tagData.description,
          color: tagData.color
        })
        .eq('id', id)
        .eq('user_id', user.id)

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

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

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