'use client'

import React from 'react'

export function SignupForm() {
  return (
    <form className="p-4 border rounded">
      <h2 className="text-lg font-bold mb-2">Signup Form</h2>
      <input type="email" placeholder="Email" className="border p-2 mb-2 block w-full" />
      <input type="password" placeholder="Password" className="border p-2 mb-2 block w-full" />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Sign Up</button>
    </form>
  )
}
