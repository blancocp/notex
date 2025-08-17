-- Script temporal para deshabilitar RLS y permitir operaciones sin auth

-- Deshabilitar RLS temporalmente
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE tags DISABLE ROW LEVEL SECURITY; 
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE note_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE note_urls DISABLE ROW LEVEL SECURITY;

-- Insertar usuario por defecto si no existe
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000', 
  'authenticated',
  'authenticated',
  'default@notex.local',
  crypt('defaultpass', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Script para re-habilitar RLS después de solucionar auth (NO EJECUTAR AÚN):
/*
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY; 
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_urls ENABLE ROW LEVEL SECURITY;
*/
