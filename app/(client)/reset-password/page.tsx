"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  return (
    <div>
      <h1>Reset Password</h1>
      <p>Token: {token}</p>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
