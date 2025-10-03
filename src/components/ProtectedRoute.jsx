import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from './Spinner'

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return (
    <div className="p-12 flex items-center justify-center animate-fade-in">
      <Spinner size={32} />
      <span className="ml-3 text-gray-600">Loading...</span>
    </div>
  )

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />

  return children
}
