import type { Metadata } from "next"
import SignupClient from "./signup-client"

export const metadata: Metadata = {
  title: "Sign Up - CoinWayFinder",
  description: "Create your account to start trading with AI-powered bots",
}

export default function SignupPage() {
  return <SignupClient />
}
