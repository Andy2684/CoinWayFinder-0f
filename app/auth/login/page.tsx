import { LoginForm } from "@/components/auth/login-form"
import { Navigation } from "@/components/navigation"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Navigation />
      <div className="flex items-center justify-center min-h-screen pt-16">
        <LoginForm />
      </div>
    </div>
  )
}
