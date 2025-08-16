# NoteX - Sistema de Gestión de Notas

Un sistema completo para registrar, organizar y gestionar notas, comandos y procedimientos con categorización por tags y enlaces asociados.

## Características

- ✅ Registro de notas con título, descripción y contenido
- ✅ Sistema de categorías para organización
- ✅ Tags para clasificación flexible
- ✅ URLs asociadas a las notas
- ✅ CRUD completo (Crear, Leer, Actualizar, Eliminar)
- ✅ Búsqueda y filtrado por categoría/tag
- ✅ Autenticación de usuarios
- ✅ Interfaz responsive

## Stack Tecnológico

- **Frontend**: Next.js 15 con TypeScript
- **Backend**: Supabase (PostgreSQL)
- **Estilos**: Tailwind CSS
- **Autenticación**: Supabase Auth
- **Deployment**: Vercel (recomendado)

## Configuración del Proyecto

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

1. Crear un proyecto en [Supabase](https://supabase.com)
2. Copiar las credenciales del proyecto
3. Completar las variables de entorno en `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio
```

### 3. Configurar la base de datos

Ejecutar las migraciones SQL en Supabase para crear las tablas necesarias.

### 4. Ejecutar el proyecto

```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
src/
├── app/                 # App Router de Next.js
├── components/          # Componentes reutilizables
├── lib/                # Configuraciones y utilidades
├── types/              # Definiciones de tipos TypeScript
└── hooks/              # Custom hooks
```

## Esquema de Base de Datos

### Tablas principales:

- **notes**: Almacena las notas principales
- **categories**: Categorías para organizar notas
- **tags**: Tags para clasificación flexible
- **note_tags**: Relación muchos a muchos entre notas y tags
- **note_urls**: URLs asociadas a las notas

## Desarrollo

### Scripts disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linter
```

## Roadmap

- [ ] Implementación básica de CRUD
- [ ] Sistema de autenticación
- [ ] Interfaz de usuario
- [ ] Búsqueda y filtros
- [ ] Exportación de notas
- [ ] Modo oscuro
- [ ] PWA (Progressive Web App)
