import { useState, useEffect } from 'react'
import { Note, Category, Tag, NotesFilter } from '@/types/database'
import { NoteCard } from './NoteCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useCategories } from '@/hooks/useCategories'
import { useTags } from '@/hooks/useTags'

interface NotesListProps {
  notes: (Note & {
    category?: Category
    tags?: Tag[]
    urls?: string[]
  })[]
  onEdit?: (note: Note) => void
  onDelete?: (noteId: string) => void
  onView?: (note: Note) => void
  onFilterChange?: (filter: NotesFilter) => void
  isLoading?: boolean
}

export function NotesList({
  notes,
  onEdit,
  onDelete,
  onView,
  onFilterChange,
  isLoading = false
}: NotesListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'title'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const { categories, fetchCategories } = useCategories()
  const { tags, fetchTags } = useTags()

  useEffect(() => {
    fetchCategories()
    fetchTags()
  }, [])

  useEffect(() => {
    if (onFilterChange) {
      const filter: NotesFilter = {
        search: searchTerm || undefined,
        category_id: selectedCategory || undefined,
        tag: selectedTag || undefined,
        sort_by: sortBy,
        sort_order: sortOrder
      }
      onFilterChange(filter)
    }
  }, [searchTerm, selectedCategory, selectedTag, sortBy, sortOrder, onFilterChange])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedTag('')
    setSortBy('created_at')
    setSortOrder('desc')
  }

  const hasActiveFilters = searchTerm || selectedCategory || selectedTag

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Cargando notas...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Búsqueda */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <Input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en título o contenido..."
            />
          </div>

          {/* Filtro por categoría */}
          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por tag */}
          <div>
            <label htmlFor="tag-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Tag
            </label>
            <select
              id="tag-filter"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los tags</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.name}>
                  #{tag.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ordenamiento */}
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
              Ordenar por
            </label>
            <div className="flex space-x-2">
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'created_at' | 'updated_at' | 'title')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="created_at">Fecha de creación</option>
                <option value="updated_at">Última actualización</option>
                <option value="title">Título</option>
              </select>
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                title={sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Botón para limpiar filtros */}
        {hasActiveFilters && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
            >
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>

      {/* Contador de resultados */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {notes.length === 0 ? (
            hasActiveFilters ? 'No se encontraron notas con los filtros aplicados' : 'No hay notas disponibles'
          ) : (
            `${notes.length} nota${notes.length !== 1 ? 's' : ''} encontrada${notes.length !== 1 ? 's' : ''}`
          )}
        </p>
      </div>

      {/* Lista de notas */}
      {notes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {hasActiveFilters ? 'No se encontraron notas' : 'No hay notas'}
          </h3>
          <p className="text-gray-500">
            {hasActiveFilters
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza creando tu primera nota'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
            />
          ))}
        </div>
      )}
    </div>
  )
}