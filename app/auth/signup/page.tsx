import type { Metadata } from "next"
import { SignupClient } from "./signup-client"

export const metadata: Metadata = {
  title: "Sign Up - CoinWayFinder",
  description:
    "Create your CoinWayFinder account and start your crypto trading journey with advanced AI-powered trading bots and real-time market analysis.",
  keywords: ["signup", "register", "crypto trading", "trading bots", "CoinWayFinder"],
  openGraph: {
    title: "Join CoinWayFinder - Advanced Crypto Trading Platform",
    description:
      "Create your account and access AI-powered trading bots, real-time market data, and professional trading tools.",
    type: "website",
  },
}

export default function SignupPage() {
  return <SignupClient />
}
