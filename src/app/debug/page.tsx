import { AuthDebug } from '@/components/debug/AuthDebug'
import { SessionDebug } from '@/components/debug/SessionDebug'

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Página de Debug
        </h1>
        <div className="space-y-8">
          <SessionDebug />
          <AuthDebug />
        </div>
      </div>
    </div>
  )
}