'use client'
import { Suspense } from "react"

export default function ResetPasswordPageWrapper() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <ResetPasswordPage />
    </Suspense>
  )
}

function ResetPasswordPage() {
  const searchParams = useSearchParams()
  // Твой код здесь...
}
