'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function AuthDebug() {
  const [email, setEmail] = useState('blancocp@gmail.com')
  const [password, setPassword] = useState('MicroBiota_143')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      // Probar conexión básica
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      console.log('Conexión a Supabase:', {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        session,
        sessionError
      })
      
      setResult({
        type: 'connection',
        success: true,
        data: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasSession: !!session,
          sessionError: sessionError?.message
        }
      })
    } catch (error) {
      setResult({
        type: 'connection',
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      console.log('Resultado del login:', { data, error })
      
      setResult({
        type: 'login',
        success: !error,
        data: {
          user: data.user,
          session: data.session,
          error: error?.message
        }
      })
    } catch (error) {
      setResult({
        type: 'login',
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    } finally {
      setLoading(false)
    }
  }

  const testSignUp = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      
      console.log('Resultado del registro:', { data, error })
      
      setResult({
        type: 'signup',
        success: !error,
        data: {
          user: data.user,
          session: data.session,
          error: error?.message
        }
      })
    } catch (error) {
      setResult({
        type: 'signup',
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Debug de Autenticación</h2>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Email
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Contraseña
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
          />
        </div>
      </div>
      
      <div className="flex gap-4 mb-6">
        <Button onClick={testConnection} disabled={loading}>
          Probar Conexión
        </Button>
        <Button onClick={testLogin} disabled={loading}>
          Probar Login
        </Button>
        <Button onClick={testSignUp} disabled={loading}>
          Probar Registro
        </Button>
      </div>
      
      {loading && (
        <div className="text-center py-4">
          <div className="text-blue-700 font-medium">Probando...</div>
        </div>
      )}
      
      {result && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-900">
            Resultado - {result.type}
          </h3>
          <div className={`p-4 rounded-lg ${
            result.success ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'
          }`}>
            <div className={`font-medium ${
              result.success ? 'text-green-900' : 'text-red-900'
            }`}>
              {result.success ? '✅ Éxito' : '❌ Error'}
            </div>
            <pre className="mt-2 text-sm overflow-auto text-gray-800">
              {JSON.stringify(result.data || result.error, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}