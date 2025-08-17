-- Extensión del schema para soportar notas públicas/privadas y usernames

-- 1. Agregar username a la tabla de usuarios (usando auth.users)
-- Nota: En Supabase auth.users ya tiene email, vamos a crear una tabla de perfiles

-- Tabla de perfiles de usuario 
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Agregar campo is_public a la tabla notes
ALTER TABLE notes ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- 3. Crear índices para mejorar rendimiento de consultas públicas
CREATE INDEX IF NOT EXISTS idx_notes_is_public ON notes(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_notes_public_created_at ON notes(created_at DESC) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- 4. Trigger para actualizar updated_at en user_profiles
CREATE TRIGGER IF NOT EXISTS update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. RLS para user_profiles (cuando lo reactivemos)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para user_profiles
CREATE POLICY "Public profiles are viewable by everyone" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- 6. Crear perfil por defecto para testing
INSERT INTO user_profiles (id, username, display_name)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'demo_user',
    'Demo User'
) ON CONFLICT (id) DO NOTHING;

-- 7. Vista para notas públicas con información del autor
CREATE OR REPLACE VIEW public_notes AS
SELECT 
    n.*,
    up.username,
    up.display_name,
    up.avatar_url
FROM notes n
LEFT JOIN user_profiles up ON n.user_id = up.id
WHERE n.is_public = TRUE
ORDER BY n.created_at DESC;

-- 8. Función para obtener notas (privadas del usuario + públicas de todos)
CREATE OR REPLACE FUNCTION get_user_notes(user_uuid UUID DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    description TEXT,
    content TEXT,
    category_id UUID,
    user_id UUID,
    is_public BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    username VARCHAR,
    display_name VARCHAR,
    is_own BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.title,
        n.description,
        n.content,
        n.category_id,
        n.user_id,
        n.is_public,
        n.created_at,
        n.updated_at,
        up.username,
        up.display_name,
        (n.user_id = user_uuid) as is_own
    FROM notes n
    LEFT JOIN user_profiles up ON n.user_id = up.id
    WHERE 
        n.is_public = TRUE  -- Todas las notas públicas
        OR 
        (user_uuid IS NOT NULL AND n.user_id = user_uuid)  -- O notas privadas del usuario
    ORDER BY n.created_at DESC;
END;
$$;
