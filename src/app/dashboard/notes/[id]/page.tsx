'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useNotes } from '@/hooks/useNotes'
import { Layout } from '@/components/layout/Layout'
import { NoteForm } from '@/components/notes/NoteForm'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Note, Category, Tag, UpdateNoteData } from '@/types/database'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default function NoteDetailPage() {
  const { user } = useAuth()
  const { id } = useParams()
  const router = useRouter()
  const { updateNote, deleteNote } = useNotes()
  
  const [note, setNote] = useState<Note & { category?: Category; tags?: Tag[]; urls?: string[] } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user && id) {
      fetchNoteDetail()
    }
  }, [user, id])

  const fetchNoteDetail = async () => {
    setIsLoading(true)
    try {
      // Aquí deberías implementar una función para obtener una nota específica
      // Por ahora, simularemos la carga
      // En una implementación real, necesitarías un método en useNotes para obtener una nota por ID
      
      // Simulación temporal - en producción esto vendría de Supabase
      setTimeout(() => {
        setNote({
          id: id as string,
          title: 'Nota de ejemplo',
          content: 'Este es el contenido de la nota...',
          category_id: null,
          user_id: user?.id || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          category: undefined,
          tags: [],
          urls: []
        })
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error al cargar la nota:', error)
      setIsLoading(false)
    }
  }

  const handleUpdateNote = async (data: UpdateNoteData) => {
    if (!note) return
    
    setIsSubmitting(true)
    try {
      await updateNote(note.id, data)
      setIsEditMode(false)
      fetchNoteDetail() // Refrescar los datos
    } catch (error) {
      console.error('Error al actualizar la nota:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteNote = async () => {
    if (!note) return
    
    setIsSubmitting(true)
    try {
      await deleteNote(note.id)
      router.push('/dashboard/notes')
    } catch (error) {
      console.error('Error al eliminar la nota:', error)
      setIsSubmitting(false)
    }
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

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Cargando nota...</span>
        </div>
      </Layout>
    )
  }

  if (!note) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nota no encontrada
            </h3>
            <p className="text-gray-500 mb-4">
              La nota que buscas no existe o no tienes permisos para verla.
            </p>
            <Link href="/dashboard/notes">
              <Button>
                Volver a notas
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isEditMode ? 'Editar nota' : note.title}
            </h1>
            {!isEditMode && (
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Creado: {formatDate(note.created_at)}</span>
                {note.updated_at !== note.created_at && (
                  <span>Actualizado: {formatDate(note.updated_at)}</span>
                )}
              </div>
            )}
          </div>
          <div className="flex space-x-3">
            <Link href="/dashboard/notes">
              <Button variant="outline">
                Volver a notas
              </Button>
            </Link>
            {!isEditMode && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditMode(true)}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  Eliminar
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Contenido */}
        <div className="bg-white rounded-lg shadow-sm border">
          {isEditMode ? (
            <div className="p-6">
              <NoteForm
                note={note}
                onSubmit={handleUpdateNote}
                onCancel={() => setIsEditMode(false)}
                isLoading={isSubmitting}
              />
            </div>
          ) : (
            <div className="p-6">
              {/* Categoría */}
              {note.category && (
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                    {note.category.name}
                  </span>
                </div>
              )}

              {/* Contenido */}
              <div className="prose max-w-none mb-6">
                <div className="whitespace-pre-wrap text-gray-700">
                  {note.content}
                </div>
              </div>

              {/* Tags */}
              {note.tags && note.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* URLs */}
              {note.urls && note.urls.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Enlaces:</h3>
                  <div className="space-y-2">
                    {note.urls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-500 hover:text-blue-700 hover:underline break-all"
                      >
                        {url}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal para confirmar eliminación */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirmar eliminación"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              ¿Estás seguro de que quieres eliminar la nota "{note.title}"? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteNote}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}