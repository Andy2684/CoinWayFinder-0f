import dynamic from "next/dynamic"

const SignupForm = dynamic(() => import("@/components/auth/signup-form"), { ssr: false })

export const metadata = {
  title: "Sign up | CoinWayFinder",
  description: "Create an account to start your journey to smarter crypto trading.",
}

export default function SignupPage() {
  return (
    <main>
      <SignupForm />
    </main>
  )
}
