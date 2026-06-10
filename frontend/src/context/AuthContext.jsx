import { createContext, useContext, useState, useCallback } from 'react'
import { saveToken, saveUser, clearToken, clearUser, getToken, getUser } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Restaure la session depuis localStorage au démarrage
    const tok  = getToken()
    const usr  = getUser()
    return tok && usr ? usr : null
  })

  const login = useCallback((authResponse) => {
    // authResponse = { token, role, userId, nom, prenom }
    saveToken(authResponse.token)
    const userData = {
      token:  authResponse.token,
      role:   authResponse.role,   // RH_MANAGER | DG | ADMIN
      userId: authResponse.userId,
      nom:    authResponse.nom,
      prenom: authResponse.prenom,
    }
    saveUser(userData)
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(() => {
    clearToken()
    clearUser()
    setUser(null)
  }, [])

  // Helpers rôle
  const isRH    = user?.role === 'RH_MANAGER'
  const isDG    = user?.role === 'DG'
  const isAdmin = user?.role === 'ADMIN'

  return (
    <AuthContext.Provider value={{ user, login, logout, isRH, isDG, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  return ctx
}
