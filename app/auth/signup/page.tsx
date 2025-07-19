import { SignupForm } from "@/components/auth/signup-form"
import { Navigation } from "@/components/navigation"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
      <Navigation />
      <div className="flex items-center justify-center min-h-screen pt-16">
        <div className="w-full max-w-md px-4">
          <SignupForm />
        </div>
      </div>
    </div>
  )
}
