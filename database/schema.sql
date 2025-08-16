-- Crear extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de categorías
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de tags
CREATE TABLE tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, user_id)
);

-- Tabla principal de notas
CREATE TABLE notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de relación muchos a muchos entre notas y tags
CREATE TABLE note_tags (
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (note_id, tag_id)
);

-- Tabla de URLs asociadas a las notas
CREATE TABLE note_urls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_category_id ON notes(category_id);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_note_tags_note_id ON note_tags(note_id);
CREATE INDEX idx_note_tags_tag_id ON note_tags(tag_id);
CREATE INDEX idx_note_urls_note_id ON note_urls(note_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en la tabla notes
CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Políticas de seguridad RLS (Row Level Security)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_urls ENABLE ROW LEVEL SECURITY;

-- Políticas para categories
CREATE POLICY "Users can view their own categories" ON categories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories" ON categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" ON categories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" ON categories
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para tags
CREATE POLICY "Users can view their own tags" ON tags
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tags" ON tags
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags" ON tags
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags" ON tags
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para notes
CREATE POLICY "Users can view their own notes" ON notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes" ON notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON notes
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para note_tags
CREATE POLICY "Users can view note_tags for their notes" ON note_tags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM notes 
            WHERE notes.id = note_tags.note_id 
            AND notes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert note_tags for their notes" ON note_tags
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM notes 
            WHERE notes.id = note_tags.note_id 
            AND notes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete note_tags for their notes" ON note_tags
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM notes 
            WHERE notes.id = note_tags.note_id 
            AND notes.user_id = auth.uid()
        )
    );

-- Políticas para note_urls
CREATE POLICY "Users can view note_urls for their notes" ON note_urls
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM notes 
            WHERE notes.id = note_urls.note_id 
            AND notes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert note_urls for their notes" ON note_urls
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM notes 
            WHERE notes.id = note_urls.note_id 
            AND notes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update note_urls for their notes" ON note_urls
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM notes 
            WHERE notes.id = note_urls.note_id 
            AND notes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete note_urls for their notes" ON note_urls
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM notes 
            WHERE notes.id = note_urls.note_id 
            AND notes.user_id = auth.uid()
        )
    );