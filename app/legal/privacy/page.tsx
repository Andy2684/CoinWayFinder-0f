import type { Metadata } from "next"
import { LegalLayout } from "@/components/legal/legal-layout"
import { PrivacyPolicy } from "@/components/legal/privacy-policy"

export const metadata: Metadata = {
  title: "Privacy Policy - CoinWayFinder",
  description: "Learn how CoinWayFinder collects, uses, and protects your personal information and trading data.",
}

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout>
      <PrivacyPolicy />
    </LegalLayout>
  )
}
