"use client"

import { TestEmailForm } from "@/components/test-email-form"

export default function TestEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Email Testing System</h1>
          <p className="text-gray-300">Test your email configuration and templates</p>
        </div>
        <TestEmailForm />
      </div>
    </div>
  )
}
