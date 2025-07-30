import type { Metadata } from "next"
import { LegalLayout } from "@/components/legal/legal-layout"
import { CookiePolicy } from "@/components/legal/cookie-policy"

export const metadata: Metadata = {
  title: "Cookie Policy - CoinWayFinder",
  description: "Learn about how CoinWayFinder uses cookies and similar technologies to enhance your experience.",
}

export default function CookiePolicyPage() {
  return (
    <LegalLayout>
      <CookiePolicy />
    </LegalLayout>
  )
}
