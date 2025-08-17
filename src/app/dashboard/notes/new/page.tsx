'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useNotes } from '@/hooks/useNotes'
import { Layout } from '@/components/layout/Layout'
import { NoteForm } from '@/components/notes/NoteForm'
import { Button } from '@/components/ui/Button'
import { CreateNoteData, UpdateNoteData } from '@/types/database'
import Link from 'next/link'

export default function NewNotePage() {
  const { user } = useAuth()
  const { createNote } = useNotes()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateNote = async (data: CreateNoteData | UpdateNoteData) => {
    setIsSubmitting(true)
    try {
      await createNote(data as CreateNoteData)
      router.push('/dashboard/notes')
    } catch (error) {
      console.error('Error al crear la nota:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/notes')
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Crear nueva nota
            </h1>
            <p className="text-gray-600">
              Escribe y organiza tu nueva nota
            </p>
          </div>
          <Link href="/dashboard/notes">
            <Button variant="outline">
              Volver a notas
            </Button>
          </Link>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <NoteForm
            onSubmit={handleCreateNote}
            onCancel={handleCancel}
            isLoading={isSubmitting}
          />
        </div>
      </div>
    </Layout>
  )
}