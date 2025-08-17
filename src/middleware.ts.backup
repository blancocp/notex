import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Si el usuario no está autenticado y trata de acceder a rutas protegidas
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  // Permitir acceso a la página de confirmación y debug sin autenticación
  if (req.nextUrl.pathname.startsWith('/auth/confirm') || req.nextUrl.pathname.startsWith('/debug')) {
    return res
  }

  // Permitir acceso a /auth incluso si está autenticado (el AuthRedirect del cliente manejará la redirección)
  if (req.nextUrl.pathname.startsWith('/auth')) {
    return res
  }

  // Si el usuario está autenticado y está en la raíz, redirigir al dashboard
  if (session && req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Si el usuario no está autenticado y está en la raíz, redirigir a auth
  if (!session && req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  return res
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/auth', '/auth/confirm', '/debug']
}