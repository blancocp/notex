'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotes } from '@/hooks/useNotes'
import { Layout } from '@/components/layout/Layout'
import { NotesList } from '@/components/notes/NotesList'
import { NoteForm } from '@/components/notes/NoteForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Note, NotesFilter, CreateNoteData, UpdateNoteData } from '@/types/database'
import Link from 'next/link'

export default function NotesPage() {
  const { user } = useAuth()
  const { 
    notes, 
    refetch, 
    createNote, 
    updateNote, 
    deleteNote, 
    loading 
  } = useNotes()
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      refetch()
    }
  }, [user, refetch])

  const handleFilterChange = (filter: NotesFilter) => {
    refetch()
  }

  const handleCreateNote = async (data: CreateNoteData | UpdateNoteData) => {
    setIsSubmitting(true)
    try {
      await createNote(data as CreateNoteData)
      setIsCreateModalOpen(false)
      refetch() // Refrescar la lista
    } catch (error) {
      console.error('Error al crear la nota:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditNote = (note: Note) => {
    setSelectedNote(note)
    setIsEditModalOpen(true)
  }

  const handleUpdateNote = async (data: UpdateNoteData) => {
    if (!selectedNote) return
    
    setIsSubmitting(true)
    try {
      await updateNote(selectedNote.id, data)
      setIsEditModalOpen(false)
      setSelectedNote(null)
      refetch() // Refrescar la lista
    } catch (error) {
      console.error('Error al actualizar la nota:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteNote = (noteId: string) => {
    setNoteToDelete(noteId)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteNote = async () => {
    if (!noteToDelete) return
    
    setIsSubmitting(true)
    try {
      await deleteNote(noteToDelete)
      setIsDeleteModalOpen(false)
      setNoteToDelete(null)
      refetch() // Refrescar la lista
    } catch (error) {
      console.error('Error al eliminar la nota:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewNote = (note: Note) => {
    window.location.href = `/dashboard/notes/${note.id}`
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mis Notas
            </h1>
            <p className="text-gray-600">
              Gestiona y organiza todas tus notas
            </p>
          </div>
          <div className="flex space-x-3">
            <Link href="/dashboard">
              <Button variant="outline">
                Volver al Dashboard
              </Button>
            </Link>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Nueva nota
            </Button>
          </div>
        </div>

        {/* Lista de notas */}
        <NotesList
          notes={notes as any}
          onEdit={handleEditNote}
          onDelete={handleDeleteNote}
          onView={handleViewNote}
          onFilterChange={handleFilterChange}
          isLoading={loading}
        />

        {/* Modal para crear nota */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Crear nueva nota"
          size="lg"
        >
          <NoteForm
            onSubmit={handleCreateNote}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={isSubmitting}
          />
        </Modal>

        {/* Modal para editar nota */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedNote(null)
          }}
          title="Editar nota"
          size="lg"
        >
          {selectedNote && (
            <NoteForm
              note={selectedNote as any}
              onSubmit={handleUpdateNote}
              onCancel={() => {
                setIsEditModalOpen(false)
                setSelectedNote(null)
              }}
              isLoading={isSubmitting}
            />
          )}
        </Modal>

        {/* Modal para confirmar eliminación */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setNoteToDelete(null)
          }}
          title="Confirmar eliminación"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              ¿Estás seguro de que quieres eliminar esta nota? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setNoteToDelete(null)
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteNote}
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