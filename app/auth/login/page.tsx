import LoginForm from "@/components/auth/login-form"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function LoginPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <LoginForm />
    </ProtectedRoute>
  )
}
