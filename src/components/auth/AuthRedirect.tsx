'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export function AuthRedirect() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // No hacer nada si aún está cargando
    if (loading) return

    // Si el usuario está autenticado y está en la página de auth, redirigir al dashboard
    if (user && pathname.startsWith('/auth') && !pathname.startsWith('/auth/confirm')) {
      router.push('/dashboard')
    }

    // Si el usuario no está autenticado y está en una ruta protegida, redirigir a auth
    if (!user && pathname.startsWith('/dashboard')) {
      router.push('/auth')
    }

    // Si el usuario está autenticado y está en la raíz, redirigir al dashboard
    if (user && pathname === '/') {
      router.push('/dashboard')
    }

    // Si el usuario no está autenticado y está en la raíz, redirigir a auth
    if (!user && pathname === '/') {
      router.push('/auth')
    }
  }, [user, loading, pathname, router])

  return null
}