'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Session, User } from '@supabase/supabase-js'

export function SessionDebug() {
  const { user, session, loading } = useAuth()
  const [directSession, setDirectSession] = useState<Session | null>(null)
  const [directUser, setDirectUser] = useState<User | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [currentUrl, setCurrentUrl] = useState<string>('N/A')
  const [timestamp, setTimestamp] = useState<string>('N/A')

  useEffect(() => {
    // Establecer URL y timestamp solo en el cliente
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href)
      setTimestamp(new Date().toLocaleString())
    }

    const checkDirectSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Direct session check:', { session, error })
        setDirectSession(session)
        setDirectUser(session?.user ?? null)
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        setSessionLoading(false)
      }
    }

    checkDirectSession()

    // Escuchar cambios en tiempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', { event, session })
        setDirectSession(session)
        setDirectUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      console.log('Refresh session result:', { data, error })
    } catch (error) {
      console.error('Error refreshing session:', error)
    }
  }

  const clearSession = async () => {
    try {
      await supabase.auth.signOut()
      console.log('Session cleared')
    } catch (error) {
      console.error('Error clearing session:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Debug de Sesión</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Estado del AuthContext */}
        <div className="bg-blue-100 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">AuthContext</h3>
          <div className="space-y-2 text-sm text-gray-800">
            <div><strong className="text-gray-900">Loading:</strong> {loading ? 'Sí' : 'No'}</div>
            <div><strong className="text-gray-900">User:</strong> {user ? user.email : 'null'}</div>
            <div><strong className="text-gray-900">Session:</strong> {session ? 'Existe' : 'null'}</div>
            {session && (
              <div className="mt-2">
                <div><strong className="text-gray-900">Access Token:</strong> {session.access_token.substring(0, 20)}...</div>
                <div><strong className="text-gray-900">Expires At:</strong> {new Date(session.expires_at! * 1000).toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>

        {/* Estado directo de Supabase */}
        <div className="bg-green-100 p-4 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-3">Supabase Directo</h3>
          <div className="space-y-2 text-sm text-gray-800">
            <div><strong className="text-gray-900">Loading:</strong> {sessionLoading ? 'Sí' : 'No'}</div>
            <div><strong className="text-gray-900">User:</strong> {directUser ? directUser.email : 'null'}</div>
            <div><strong className="text-gray-900">Session:</strong> {directSession ? 'Existe' : 'null'}</div>
            {directSession && (
              <div className="mt-2">
                <div><strong className="text-gray-900">Access Token:</strong> {directSession.access_token.substring(0, 20)}...</div>
                <div><strong className="text-gray-900">Expires At:</strong> {new Date(directSession.expires_at! * 1000).toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comparación */}
      <div className="mt-6 bg-yellow-100 p-4 rounded-lg border border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-900 mb-3">Comparación</h3>
        <div className="space-y-2 text-sm text-gray-800">
          <div><strong className="text-gray-900">Usuarios coinciden:</strong> {user?.email === directUser?.email ? 'Sí' : 'No'}</div>
          <div><strong className="text-gray-900">Sesiones coinciden:</strong> {(session?.access_token === directSession?.access_token) ? 'Sí' : 'No'}</div>
          <div><strong className="text-gray-900">Estado consistente:</strong> {(!!user === !!directUser && !!session === !!directSession) ? 'Sí' : 'No'}</div>
        </div>
      </div>

      {/* Acciones */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={refreshSession}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refrescar Sesión
        </button>
        <button
          onClick={clearSession}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Limpiar Sesión
        </button>
      </div>

      {/* Información adicional */}
      <div className="mt-6 bg-gray-100 p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Información Adicional</h3>
        <div className="space-y-2 text-sm text-gray-800">
          <div><strong className="text-gray-900">URL actual:</strong> {currentUrl}</div>
          <div><strong className="text-gray-900">Timestamp:</strong> {timestamp}</div>
        </div>
      </div>
    </div>
  )
}