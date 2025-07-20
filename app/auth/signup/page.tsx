"use client"

import dynamic from "next/dynamic"

const SignupPageClient = dynamic(() => import("./signup-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  ),
})

export default function SignupPage() {
  return <SignupPageClient />
}
