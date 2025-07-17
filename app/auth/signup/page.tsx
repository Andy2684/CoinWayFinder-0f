
import SignupForm from "@/components/auth/signup-form"
import { ProtectedRoute } from "@/components/auth/protected-route"

'use client'

import { useAuth } from '@/components/auth/auth-provider'
import { useEffect } from 'react'

export default function SignUpPage() {
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      console.log('Already signed in')
    }
  }, [isAuthenticated])


  return (

    <ProtectedRoute requireAuth={false}>
      <SignupForm />
    </ProtectedRoute>

    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      {/* TODO: добавить форму регистрации */}
    </div>

  )
}
