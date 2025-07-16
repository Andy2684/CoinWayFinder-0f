// context/auth-context.tsx
'use client'

import { createContext, useContext, useState, useEffect } from 'react'

// Define the shape of the user object (adjust as needed)
interface User {
  id: string
  role: 'user' | 'admin' | string
}

// Define the AuthContextType interface
export interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (userData: User) => void
  logout: () => void
  signup: (userData: { id: string; password: string; role?: string }) => Promise<void> // Add signup
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// AuthProvider component to wrap the app
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const isAuthenticated = !!user

  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const signup = async (userData: { id: string; password: string; role?: string }) => {
    try {
      // Simulate API call for signup (replace with your actual API)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userData.id,
          password: userData.password,
          role: userData.role || 'user', // Default to 'user' role
        }),
      })

      if (!response.ok) {
        throw new Error('Signup failed')
      }

      const newUser: User = {
        id: userData.id,
        role: userData.role || 'user',
      }
      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
    } catch (error) {
      console.error('Signup error:', error)
      throw error // Let the component handle the error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to access auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
