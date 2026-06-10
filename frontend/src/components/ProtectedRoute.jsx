import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Protège une route :
 * - Si non connecté → redirige vers /login
 * - Si rôle insuffisant → redirige vers /403
 *
 * Usage :
 *   <ProtectedRoute roles={['RH_MANAGER']}>
 *     <Dashboard />
 *   </ProtectedRoute>
 */
export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/403" replace />
  }

  return children
}
