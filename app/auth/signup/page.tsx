import type { Metadata } from "next"
import SignupClient from "./signup-client"

export const metadata: Metadata = {
  title: "Sign Up - CoinWayFinder",
  description: "Create your account and start your journey to smarter crypto trading with AI-powered bots",
  keywords: ["crypto", "trading", "AI", "bots", "signup", "register"],
}

export default function SignupPage() {
  return <SignupClient />
}
