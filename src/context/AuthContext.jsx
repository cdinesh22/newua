import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return
        
        if (session?.user) {
          // Get user profile from our users table
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: profile?.name || session.user.user_metadata?.name,
            phone: profile?.phone || session.user.user_metadata?.phone,
            role: profile?.role || session.user.user_metadata?.role || 'pilgrim',
            ...session.user,
          })
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      try {
        if (session?.user) {
          // Get user profile from our users table
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: profile?.name || session.user.user_metadata?.name,
            phone: profile?.phone || session.user.user_metadata?.phone,
            role: profile?.role || session.user.user_metadata?.role || 'pilgrim',
            ...session.user,
          })
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Auth state change error:', error)
        setUser(null)
      }
    })

    init()
    return () => { 
      mounted = false
      authListener.subscription.unsubscribe() 
    }
  }, [])

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    
    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()
    
    const userData = {
      id: data.user.id,
      email: data.user.email,
      name: profile?.name || data.user.user_metadata?.name,
      phone: profile?.phone || data.user.user_metadata?.phone,
      role: profile?.role || data.user.user_metadata?.role || 'pilgrim',
      ...data.user,
    }
    
    setUser(userData)
    return userData
  }

  const register = async (payload) => {
    const { email, password, name, phone, role = 'pilgrim' } = payload
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone, role }
      }
    })
    if (error) throw error
    
    const userData = data.user ? {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || name,
      phone: data.user.user_metadata?.phone || phone,
      role: data.user.user_metadata?.role || role,
      ...data.user,
    } : null
    
    setUser(userData)
    return userData
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
  }

  const updateProfile = async (updates) => {
    if (!user) throw new Error('No user logged in')
    
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    
    if (error) throw error
    
    setUser(prev => ({
      ...prev,
      ...data
    }))
    
    return data
  }

  const value = useMemo(() => ({ 
    user, 
    loading, 
    login, 
    register, 
    logout, 
    updateProfile 
  }), [user, loading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
