import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'

export function ProtectedRoute() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0e0b14]">
        <div className="w-6 h-6 rounded-full border-2 border-[#c084a8] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  return <Outlet />
}
