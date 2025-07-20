"use client"

import dynamic from "next/dynamic"

const AuthTestPageClient = dynamic(() => import("./auth-test-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-[#191A1E]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#30D5C8]"></div>
    </div>
  ),
})

export default function AuthTestPage() {
  return <AuthTestPageClient />
}
