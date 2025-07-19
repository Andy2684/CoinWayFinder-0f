<<<<<<< HEAD
import SignupForm from "@/components/auth/signup-form"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function SignupPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <SignupForm />
    </ProtectedRoute>
=======
'use client'

import React from 'react'

export default function SignupPage() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Регистрация</h1>
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded"
          />
          <input
            type="password"
            placeholder="Пароль"
            className="w-full px-4 py-2 border rounded"
          />
          <input
            type="password"
            placeholder="Повторите пароль"
            className="w-full px-4 py-2 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Зарегистрироваться
          </button>
        </form>
      </div>
    </div>
>>>>>>> b2cd8b3 (fix: restore working state after local fixes)
  )
}
