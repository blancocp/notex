'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotes } from '@/hooks/useNotes'
import { useCategories } from '@/hooks/useCategories'
import { useTags } from '@/hooks/useTags'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { NoteCard } from '@/components/notes/NoteCard'
import Link from 'next/link'
import { Note, Category, Tag } from '@/types/database'

export default function DashboardPage() {
  const { user } = useAuth()
  const { notes, refetch, loading: notesLoading } = useNotes()
  const { categories, refetch: refetchCategories, loading: categoriesLoading } = useCategories()
  const { tags, refetch: refetchTags, loading: tagsLoading } = useTags()
  const [recentNotes, setRecentNotes] = useState<(Note & { category?: Category; tags?: Tag[] })[]>([])

  useEffect(() => {
    if (user) {
      refetch()
      refetchCategories()
      refetchTags()
    }
  }, [user, refetch, refetch, refetch])

  useEffect(() => {
    // Obtener las 6 notas más recientes
    setRecentNotes(notes.slice(0, 6))
  }, [notes])

  const isLoading = notesLoading || categoriesLoading || tagsLoading

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido de vuelta!
          </h1>
          <p className="text-gray-600">
            Aquí tienes un resumen de tus notas y actividad reciente.
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Notas</h3>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {isLoading ? '...' : notes.length}
              </div>
              <p className="text-sm text-gray-600">
                {notes.length === 1 ? 'nota total' : 'notas totales'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Categorías</h3>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {isLoading ? '...' : categories.length}
              </div>
              <p className="text-sm text-gray-600">
                {categories.length === 1 ? 'categoría' : 'categorías'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {isLoading ? '...' : tags.length}
              </div>
              <p className="text-sm text-gray-600">
                {tags.length === 1 ? 'tag' : 'tags'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Acciones rápidas */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/notes/new">
              <Button className="w-full h-16 flex flex-col items-center justify-center space-y-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Nueva nota</span>
              </Button>
            </Link>
            
            <Link href="/dashboard/categories">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span>Gestionar categorías</span>
              </Button>
            </Link>
            
            <Link href="/dashboard/tags">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span>Gestionar tags</span>
              </Button>
            </Link>
            
            <Link href="/dashboard/notes">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Buscar notas</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Notas recientes */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Notas recientes</h2>
            <Link href="/dashboard/notes">
              <Button variant="outline" size="sm">
                Ver todas
              </Button>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">Cargando notas...</span>
            </div>
          ) : recentNotes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay notas
              </h3>
              <p className="text-gray-500 mb-4">
                Comienza creando tu primera nota
              </p>
              <Link href="/dashboard/notes/new">
                <Button>
                  Crear primera nota
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note as any}
                  onView={() => window.location.href = `/dashboard/notes/${note.id}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}