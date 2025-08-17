'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTags } from '@/hooks/useTags'
import { Layout } from '@/components/layout/Layout'
import { TagsList } from '@/components/tags/TagsList'
import { TagForm } from '@/components/tags/TagForm'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Tag, CreateTagData, UpdateTagData } from '@/types/database'
import Link from 'next/link'

export default function TagsPage() {
  const { user } = useAuth()
  const { tags, createTag, updateTag, deleteTag, loading } = useTags()
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateTag = async (data: CreateTagData) => {
    setIsSubmitting(true)
    try {
      await createTag(data)
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error('Error al crear el tag:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditTag = (tag: Tag) => {
    setSelectedTag(tag)
    setIsEditModalOpen(true)
  }

  const handleUpdateTag = async (data: UpdateTagData) => {
    if (!selectedTag) return
    
    setIsSubmitting(true)
    try {
      await updateTag(selectedTag.id, data)
      setIsEditModalOpen(false)
      setSelectedTag(null)
    } catch (error) {
      console.error('Error al actualizar el tag:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTag = (tagId: string) => {
    setSelectedTag(tags.find(t => t.id === tagId) || null)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteTag = async () => {
    if (!selectedTag) return
    
    setIsSubmitting(true)
    try {
      await deleteTag(selectedTag.id)
      setIsDeleteModalOpen(false)
      setSelectedTag(null)
    } catch (error) {
      console.error('Error al eliminar el tag:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeModals = () => {
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteModalOpen(false)
    setSelectedTag(null)
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
              Tags
            </h1>
            <p className="text-gray-600">
              Etiqueta y organiza tus notas con tags personalizados
            </p>
          </div>
          <div className="flex space-x-3">
            <Link href="/dashboard">
              <Button variant="outline">
                Volver al Dashboard
              </Button>
            </Link>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Nuevo tag
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de tags</p>
                <p className="text-2xl font-bold text-gray-900">{tags.length}</p>
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
                <p className="text-sm font-medium text-gray-600">Notas etiquetadas</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Más usado</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de tags */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Todos los tags
            </h2>
          </div>
          <TagsList
            tags={tags}
            onEdit={handleEditTag}
            onDelete={handleDeleteTag}
            isLoading={loading}
          />
        </div>

        {/* Modal para crear tag */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={closeModals}
          title="Crear nuevo tag"
          size="md"
        >
          <TagForm
            onSubmit={handleCreateTag}
            onCancel={closeModals}
            isLoading={isSubmitting}
          />
        </Modal>

        {/* Modal para editar tag */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={closeModals}
          title="Editar tag"
          size="md"
        >
          {selectedTag && (
            <TagForm
              tag={selectedTag}
              onSubmit={handleUpdateTag}
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
          {selectedTag && (
            <div className="space-y-4">
              <p className="text-gray-700">
                ¿Estás seguro de que quieres eliminar el tag "{selectedTag.name}"? 
                Esta acción no se puede deshacer y se eliminará de todas las notas asociadas.
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
                  onClick={confirmDeleteTag}
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