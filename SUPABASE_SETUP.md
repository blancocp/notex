# Configuración de Supabase para NoteX

## Problema: "Me registré pero no ingresa a la aplicación"

Este problema generalmente ocurre porque Supabase está configurado para requerir confirmación por email. Aquí te explico cómo solucionarlo:

## Solución 1: Deshabilitar confirmación por email (Recomendado para desarrollo)

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **Authentication** > **Settings**
3. En la sección **User Signups**, encuentra la opción **"Enable email confirmations"**
4. **Desactiva** esta opción
5. Guarda los cambios

Con esta configuración:
- Los usuarios pueden registrarse e iniciar sesión inmediatamente
- No necesitan confirmar su email
- Ideal para desarrollo y testing

## Solución 2: Configurar email confirmations correctamente (Para producción)

Si prefieres mantener la confirmación por email:

### 1. Configurar Email Templates
1. Ve a **Authentication** > **Email Templates**
2. Selecciona **"Confirm signup"**
3. Asegúrate de que la URL de redirección sea: `{{ .SiteURL }}/auth/confirm`

### 2. Configurar Site URL
1. Ve a **Authentication** > **Settings**
2. En **Site URL**, asegúrate de que esté configurado como:
   - Para desarrollo: `http://localhost:3000`
   - Para producción: tu dominio real

### 3. Configurar Redirect URLs
1. En la misma sección, añade a **Redirect URLs**:
   - `http://localhost:3000/auth/confirm`
   - `http://localhost:3000/dashboard`

## Verificar configuración

Para verificar que todo funciona:

1. **Con confirmación deshabilitada:**
   - Registra un nuevo usuario
   - Deberías ser redirigido automáticamente al dashboard

2. **Con confirmación habilitada:**
   - Registra un nuevo usuario
   - Revisa tu email para el enlace de confirmación
   - Haz clic en el enlace
   - Deberías ser redirigido al dashboard

## Variables de entorno

Asegúrate de tener estas variables en tu archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

## Troubleshooting

### Error: "Invalid login credentials"
- Verifica que el email y contraseña sean correctos
- Si tienes confirmación por email habilitada, asegúrate de haber confirmado tu cuenta

### Error: "Email not confirmed"
- Revisa tu bandeja de entrada y spam
- Verifica que las URLs de redirección estén configuradas correctamente
- Considera deshabilitar la confirmación por email para desarrollo

### La aplicación no redirige después del login
- Verifica que el middleware esté funcionando correctamente
- Revisa la consola del navegador para errores
- Asegúrate de que las variables de entorno estén configuradas

## Recomendación

Para desarrollo local, recomendamos **deshabilitar la confirmación por email** para una experiencia más fluida. Para producción, puedes habilitarla nuevamente y configurar un proveedor de email adecuado.