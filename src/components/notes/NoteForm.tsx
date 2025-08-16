import { useState, useEffect } from 'react'
import { Note, Category, Tag, CreateNoteData, UpdateNoteData } from '@/types/database'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useCategories } from '@/hooks/useCategories'
import { useTags } from '@/hooks/useTags'
import { isValidUrl } from '@/lib/utils'

interface NoteFormProps {
  note?: Note & { tags?: Tag[]; urls?: string[] }
  onSubmit: (data: CreateNoteData | UpdateNoteData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function NoteForm({ note, onSubmit, onCancel, isLoading = false }: NoteFormProps) {
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [categoryId, setCategoryId] = useState(note?.category_id || '')
  const [tagInput, setTagInput] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>(
    note?.tags?.map(tag => tag.name) || []
  )
  const [urlInput, setUrlInput] = useState('')
  const [urls, setUrls] = useState<string[]>(note?.urls || [])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { categories, fetchCategories } = useCategories()
  const { tags, searchTags } = useTags()
  const [tagSuggestions, setTagSuggestions] = useState<Tag[]>([])

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (tagInput.trim()) {
      searchTags(tagInput).then(setTagSuggestions)
    } else {
      setTagSuggestions([])
    }
  }, [tagInput, searchTags])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = 'El título es requerido'
    }

    if (!content.trim()) {
      newErrors.content = 'El contenido es requerido'
    }

    if (urlInput.trim() && !isValidUrl(urlInput)) {
      newErrors.urlInput = 'URL no válida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddTag = (tagName: string) => {
    const trimmedTag = tagName.trim().toLowerCase()
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags([...selectedTags, trimmedTag])
    }
    setTagInput('')
    setTagSuggestions([])
  }

  const handleRemoveTag = (tagName: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagName))
  }

  const handleAddUrl = () => {
    const trimmedUrl = urlInput.trim()
    if (trimmedUrl && isValidUrl(trimmedUrl) && !urls.includes(trimmedUrl)) {
      setUrls([...urls, trimmedUrl])
      setUrlInput('')
      setErrors({ ...errors, urlInput: '' })
    }
  }

  const handleRemoveUrl = (urlToRemove: string) => {
    setUrls(urls.filter(url => url !== urlToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const formData = {
      title: title.trim(),
      content: content.trim(),
      category_id: categoryId || null,
      tags: selectedTags,
      urls
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error al guardar la nota:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Título */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Título *
        </label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ingresa el título de la nota"
          className={errors.title ? 'border-red-500' : ''}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Categoría */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Categoría
        </label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Sin categoría</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Contenido */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Contenido *
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe el contenido de tu nota aquí..."
          rows={6}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical ${
            errors.content ? 'border-red-500' : ''
          }`}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content}</p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <div className="relative">
          <Input
            id="tags"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddTag(tagInput)
              }
            }}
            placeholder="Escribe un tag y presiona Enter"
          />
          
          {/* Sugerencias de tags */}
          {tagSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
              {tagSuggestions.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleAddTag(tag.name)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Tags seleccionados */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* URLs */}
      <div>
        <label htmlFor="urls" className="block text-sm font-medium text-gray-700 mb-1">
          Enlaces
        </label>
        <div className="flex space-x-2">
          <Input
            id="urls"
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddUrl()
              }
            }}
            placeholder="https://ejemplo.com"
            className={errors.urlInput ? 'border-red-500' : ''}
          />
          <Button
            type="button"
            onClick={handleAddUrl}
            variant="outline"
            disabled={!urlInput.trim()}
          >
            Agregar
          </Button>
        </div>
        {errors.urlInput && (
          <p className="mt-1 text-sm text-red-600">{errors.urlInput}</p>
        )}
        
        {/* URLs agregadas */}
        {urls.length > 0 && (
          <div className="space-y-2 mt-2">
            {urls.map((url, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 hover:underline truncate flex-1"
                >
                  {url}
                </a>
                <button
                  type="button"
                  onClick={() => handleRemoveUrl(url)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Guardando...' : note ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  )
}