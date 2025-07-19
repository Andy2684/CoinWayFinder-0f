import SignupForm from "@/components/auth/signup-form"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function SignupPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <SignupForm />
    </ProtectedRoute>
  )
}
