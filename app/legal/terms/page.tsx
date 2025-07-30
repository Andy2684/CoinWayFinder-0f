import type { Metadata } from "next"
import { LegalLayout } from "@/components/legal/legal-layout"
import { TermsOfService } from "@/components/legal/terms-of-service"

export const metadata: Metadata = {
  title: "Terms of Service - CoinWayFinder",
  description: "Read our terms of service and user agreement for using the CoinWayFinder trading platform.",
}

export default function TermsOfServicePage() {
  return (
    <LegalLayout>
      <TermsOfService />
    </LegalLayout>
  )
}
