import { Note, Category, Tag } from '@/types/database'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatDate, truncateText } from '@/lib/utils'
import { useState } from 'react'

interface NoteCardProps {
  note: Note & {
    category?: Category
    tags?: Tag[]
    urls?: string[]
  }
  onEdit?: (note: Note) => void
  onDelete?: (noteId: string) => void
  onView?: (note: Note) => void
}

export function NoteCard({ note, onEdit, onDelete, onView }: NoteCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const maxContentLength = 150
  const shouldTruncate = note.content.length > maxContentLength

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {note.title}
            </h3>
            {note.category && (
              <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {note.category.name}
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(note)}
                className="text-gray-500 hover:text-gray-700"
              >
                Ver
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(note)}
                className="text-blue-500 hover:text-blue-700"
              >
                Editar
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(note.id)}
                className="text-red-500 hover:text-red-700"
              >
                Eliminar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-gray-700 mb-4">
          {shouldTruncate && !isExpanded ? (
            <>
              {truncateText(note.content, maxContentLength)}
              <button
                onClick={handleToggleExpand}
                className="text-blue-500 hover:text-blue-700 ml-1 font-medium"
              >
                Ver más
              </button>
            </>
          ) : (
            <>
              <div className="whitespace-pre-wrap">{note.content}</div>
              {shouldTruncate && (
                <button
                  onClick={handleToggleExpand}
                  className="text-blue-500 hover:text-blue-700 mt-2 font-medium"
                >
                  Ver menos
                </button>
              )}
            </>
          )}
        </div>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {note.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* URLs */}
        {note.urls && note.urls.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-gray-600">Enlaces:</h4>
            {note.urls.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-blue-500 hover:text-blue-700 hover:underline truncate"
              >
                {url}
              </a>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <div className="flex justify-between items-center w-full text-sm text-gray-500">
          <span>Creado: {formatDate(note.created_at)}</span>
          {note.updated_at !== note.created_at && (
            <span>Actualizado: {formatDate(note.updated_at)}</span>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}