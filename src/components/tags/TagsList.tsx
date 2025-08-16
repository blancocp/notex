import { Tag } from '@/types/database'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'

interface TagsListProps {
  tags: Tag[]
  onEdit?: (tag: Tag) => void
  onDelete?: (tagId: string) => void
  isLoading?: boolean
}

export function TagsList({
  tags,
  onEdit,
  onDelete,
  isLoading = false
}: TagsListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Cargando tags...</span>
      </div>
    )
  }

  if (tags.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay tags
        </h3>
        <p className="text-gray-500">
          Comienza creando tu primer tag para etiquetar tus notas
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tags.map((tag) => (
          <Card key={tag.id} className="hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span
                    className="inline-block px-2 py-1 text-xs font-medium rounded-full flex-shrink-0"
                    style={{ 
                      backgroundColor: tag.color + '20', // 20% opacity
                      color: tag.color,
                      border: `1px solid ${tag.color}40` // 40% opacity border
                    }}
                  >
                    #{tag.name}
                  </span>
                </div>
                <div className="flex space-x-1 flex-shrink-0">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(tag)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Editar
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(tag.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            {tag.description && (
              <CardContent>
                <p className="text-gray-600 text-sm">
                  {tag.description}
                </p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
      
      <div className="text-sm text-gray-500 text-center">
        {tags.length} tag{tags.length !== 1 ? 's' : ''} en total
      </div>
    </div>
  )
}