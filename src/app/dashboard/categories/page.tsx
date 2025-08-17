'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCategories } from '@/hooks/useCategories'
import { Layout } from '@/components/layout/Layout'
import { CategoriesList } from '@/components/categories/CategoriesList'
import { CategoryForm } from '@/components/categories/CategoryForm'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Category, CreateCategoryData, UpdateCategoryData } from '@/types/database'
import Link from 'next/link'

export default function CategoriesPage() {
  const { user } = useAuth()
  const { categories, createCategory, updateCategory, deleteCategory, loading } = useCategories()
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateCategory = async (data: CreateCategoryData) => {
    setIsSubmitting(true)
    try {
      await createCategory(data)
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error('Error al crear la categoría:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category)
    setIsEditModalOpen(true)
  }

  const handleUpdateCategory = async (data: UpdateCategoryData) => {
    if (!selectedCategory) return
    
    setIsSubmitting(true)
    try {
      await updateCategory(selectedCategory.id, data)
      setIsEditModalOpen(false)
      setSelectedCategory(null)
    } catch (error) {
      console.error('Error al actualizar la categoría:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCategory = (category: Category) => {
    setSelectedCategory(category)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteCategory = async () => {
    if (!selectedCategory) return
    
    setIsSubmitting(true)
    try {
      await deleteCategory(selectedCategory.id)
      setIsDeleteModalOpen(false)
      setSelectedCategory(null)
    } catch (error) {
      console.error('Error al eliminar la categoría:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeModals = () => {
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteModalOpen(false)
    setSelectedCategory(null)
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Categorías
            </h1>
            <p className="text-gray-600">
              Organiza tus notas con categorías personalizadas
            </p>
          </div>
          <div className="flex space-x-3">
            <Link href="/dashboard">
              <Button variant="outline">
                Volver al Dashboard
              </Button>
            </Link>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Nueva categoría
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de categorías</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Notas categorizadas</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Más usada</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de categorías */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Todas las categorías
            </h2>
          </div>
          <CategoriesList
            categories={categories}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
            isLoading={loading}
          />
        </div>

        {/* Modal para crear categoría */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={closeModals}
          title="Crear nueva categoría"
          size="md"
        >
          <CategoryForm
            onSubmit={handleCreateCategory}
            onCancel={closeModals}
            isLoading={isSubmitting}
          />
        </Modal>

        {/* Modal para editar categoría */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={closeModals}
          title="Editar categoría"
          size="md"
        >
          {selectedCategory && (
            <CategoryForm
              category={selectedCategory}
              onSubmit={handleUpdateCategory}
              onCancel={closeModals}
              isLoading={isSubmitting}
            />
          )}
        </Modal>

        {/* Modal para confirmar eliminación */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={closeModals}
          title="Confirmar eliminación"
          size="sm"
        >
          {selectedCategory && (
            <div className="space-y-4">
              <p className="text-gray-700">
                ¿Estás seguro de que quieres eliminar la categoría "{selectedCategory.name}"? 
                Esta acción no se puede deshacer y todas las notas asociadas perderán su categoría.
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={closeModals}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeleteCategory}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  )
}