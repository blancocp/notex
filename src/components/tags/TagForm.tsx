import { useState } from 'react'
import { Tag, CreateTagData } from '@/types/database'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface TagFormProps {
  tag?: Tag
  onSubmit: (data: CreateTagData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function TagForm({ tag, onSubmit, onCancel, isLoading = false }: TagFormProps) {
  const [name, setName] = useState(tag?.name || '')
  const [description, setDescription] = useState(tag?.description || '')
  const [color, setColor] = useState(tag?.color || '#6B7280')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'El nombre es requerido'
    } else if (name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres'
    } else if (!/^[a-zA-Z0-9_-]+$/.test(name.trim())) {
      newErrors.name = 'El nombre solo puede contener letras, números, guiones y guiones bajos'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const formData: CreateTagData = {
      name: name.trim().toLowerCase(),
      description: description.trim() || undefined,
      color
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error al guardar el tag:', error)
    }
  }

  const predefinedColors = [
    '#6B7280', // Gray
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#EC4899'  // Pink
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nombre */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre *
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            #
          </span>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="nombre-del-tag"
            className={`pl-8 ${errors.name ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Solo letras, números, guiones (-) y guiones bajos (_)
        </p>
      </div>

      {/* Descripción */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción opcional del tag"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
        />
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Color
        </label>
        <div className="space-y-3">
          {/* Colores predefinidos */}
          <div className="grid grid-cols-5 gap-2">
            {predefinedColors.map((predefinedColor) => (
              <button
                key={predefinedColor}
                type="button"
                onClick={() => setColor(predefinedColor)}
                className={`w-10 h-10 rounded-full border-2 transition-all ${
                  color === predefinedColor
                    ? 'border-gray-800 scale-110'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: predefinedColor }}
                title={predefinedColor}
              />
            ))}
          </div>
          
          {/* Selector de color personalizado */}
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <Input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* Vista previa */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vista previa
        </label>
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
          <span
            className="inline-block px-2 py-1 text-xs font-medium rounded-full"
            style={{ 
              backgroundColor: color + '20', // 20% opacity
              color: color,
              border: `1px solid ${color}40` // 40% opacity border
            }}
          >
            #{name.trim() || 'nombre-del-tag'}
          </span>
        </div>
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
          {isLoading ? 'Guardando...' : tag ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  )
}