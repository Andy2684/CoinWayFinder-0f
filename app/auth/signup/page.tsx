import { SignupForm } from "@/components/auth/signup-form"
import Navigation from "@/components/navigation"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#0F1015]">
      <Navigation />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <SignupForm />
      </div>
    </div>
  )
}
