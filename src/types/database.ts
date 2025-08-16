export interface Note {
  id: string
  title: string
  description?: string
  content?: string
  category_id?: string
  user_id: string
  created_at: string
  updated_at: string
  category?: Category
  tags?: Tag[]
  urls?: NoteUrl[]
}

export interface Category {
  id: string
  name: string
  description?: string
  color?: string
  user_id: string
  created_at: string
}

export interface Tag {
  id: string
  name: string
  description?: string
  color?: string
  user_id: string
  created_at: string
}

export interface NoteTag {
  note_id: string
  tag_id: string
  created_at: string
}

export interface NoteUrl {
  id: string
  note_id: string
  url: string
  title?: string
  description?: string
  created_at: string
}

// Tipos para formularios
export interface CreateNoteData {
  title: string
  description?: string
  content?: string
  category_id?: string
  tags?: string[]
  urls?: CreateNoteUrlData[]
}

export interface UpdateNoteData {
  title?: string
  description?: string
  content?: string
  category_id?: string
  tags?: string[]
  urls?: CreateNoteUrlData[]
}

export interface CreateCategoryData {
  name: string
  description?: string
  color?: string
}

export interface CreateTagData {
  name: string
  description?: string
  color?: string
}

export interface UpdateCategoryData {
  name?: string
  description?: string
  color?: string
}

export interface UpdateTagData {
  name?: string
  description?: string
  color?: string
}

export interface CreateNoteUrlData {
  url: string
  title?: string
  description?: string
}

// Tipos para filtros y búsqueda
export interface NotesFilter {
  category_id?: string
  tags?: string[]
  search?: string
  limit?: number
  offset?: number
}

export interface NotesResponse {
  notes: Note[]
  total: number
  hasMore: boolean
}