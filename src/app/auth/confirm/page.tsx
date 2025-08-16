'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'

export default function ConfirmPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const token_hash = searchParams.get('token_hash')
        const type = searchParams.get('type')

        if (token_hash && type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any
          })

          if (error) {
            setError('Error al confirmar el email: ' + error.message)
          } else {
            setConfirmed(true)
            // Redirigir al dashboard después de 2 segundos
            setTimeout(() => {
              router.push('/dashboard')
            }, 2000)
          }
        } else {
          setError('Token de confirmación no válido')
        }
      } catch (err) {
        setError('Error inesperado al confirmar el email')
      } finally {
        setLoading(false)
      }
    }

    handleEmailConfirmation()
  }, [searchParams, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Confirmando tu email...
              </h2>
              <p className="text-gray-600">
                Por favor espera mientras verificamos tu cuenta.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
            <div className="text-center">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                <h3 className="font-medium">Error de confirmación</h3>
                <p className="text-sm mt-1">{error}</p>
              </div>
              <Button onClick={() => router.push('/auth')} variant="outline">
                Volver al inicio de sesión
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
            <div className="text-center">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                <h3 className="font-medium">¡Email confirmado!</h3>
                <p className="text-sm mt-1">
                  Tu cuenta ha sido verificada exitosamente. Serás redirigido al dashboard.
                </p>
              </div>
              <Button onClick={() => router.push('/dashboard')}>
                Ir al Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}