import type { Metadata } from "next"
import { LegalLayout } from "@/components/legal/legal-layout"
import { SecurityGuidelines } from "@/components/legal/security-guidelines"

export const metadata: Metadata = {
  title: "Security Guidelines - CoinWayFinder",
  description: "Learn about our security measures and best practices for protecting your account and funds.",
}

export default function SecurityGuidelinesPage() {
  return (
    <LegalLayout>
      <SecurityGuidelines />
    </LegalLayout>
  )
}
