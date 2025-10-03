import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return
      if (session?.user) {
        // You can enrich with profile/role via another query if you add a profiles table
        setUser({
          id: session.user.id,
          email: session.user.email,
          role: session.user.user_metadata?.role || 'user',
          ...session.user,
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          role: session.user.user_metadata?.role || 'user',
          ...session.user,
        })
      } else {
        setUser(null)
      }
    })

    init()
    return () => { mounted = false; authListener.subscription.unsubscribe() }
  }, [])

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    const sessionUser = data.user
    const u = {
      id: sessionUser.id,
      email: sessionUser.email,
      role: sessionUser.user_metadata?.role || 'user',
      ...sessionUser,
    }
    setUser(u)
    return u
  }

  const register = async (payload) => {
    const { email, password, name, phone } = payload
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone, role: 'user' }
      }
    })
    if (error) throw error
    const sessionUser = data.user
    const u = sessionUser ? {
      id: sessionUser.id,
      email: sessionUser.email,
      role: sessionUser.user_metadata?.role || 'user',
      ...sessionUser,
    } : null
    setUser(u)
    return u
  }

  const logout = () => {
    supabase.auth.signOut()
    setUser(null)
  }

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
