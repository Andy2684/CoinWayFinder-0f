import { LoginForm } from "@/components/auth/login-form"
import { BackToDashboard, FloatingDashboardButton } from "@/components/back-to-dashboard"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      <div className="flex justify-between items-center p-6">
        <BackToDashboard variant="ghost" className="text-white" />
        <Link href="/" className="text-white hover:text-purple-300 transition-colors">
          Back to Home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-300">Sign in to your CoinWayFinder account</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 shadow-xl border border-white/20">
            <LoginForm />

            <div className="mt-6 text-center">
              <p className="text-gray-300">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <FloatingDashboardButton />
    </div>
  )
}
