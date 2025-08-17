import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Category, CreateCategoryData, UpdateCategoryData } from '@/types/database'

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', DEFAULT_USER_ID)
        .order('name')

      if (error) throw error

      setCategories(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las categorías')
    } finally {
      setLoading(false)
    }
  }

  const createCategory = async (categoryData: CreateCategoryData) => {
    try {
      setError(null)

      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: categoryData.name,
          description: categoryData.description,
          user_id: DEFAULT_USER_ID
        })
        .select()
        .single()

      if (error) throw error

      await fetchCategories()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la categoría'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updateCategory = async (id: string, categoryData: UpdateCategoryData) => {
    try {
      setError(null)

      const { error } = await supabase
        .from('categories')
        .update({
          name: categoryData.name,
          description: categoryData.description
        })
        .eq('id', id)
        .eq('user_id', DEFAULT_USER_ID)

      if (error) throw error

      await fetchCategories()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar la categoría'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      setError(null)

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', DEFAULT_USER_ID)

      if (error) throw error

      await fetchCategories()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar la categoría'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories
  }
}
