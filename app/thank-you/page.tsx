import { cookies } from "next/headers"
import ResendClient from "./resend-client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

function maskEmail(email: string) {
  const [name, domain] = email.split("@")
  if (!name || !domain) return email
  const maskedName = name.length <= 2 ? name[0] + "*" : name[0] + "*".repeat(Math.max(1, name.length - 2)) + name[name.length - 1]
  return `${maskedName}@${domain}`
}

export const metadata = {
  title: "Thank you | CoinWayFinder",
  description: "Please verify your email to complete your account setup.",
}

export default function ThankYouPage() {
  const cookieStore = cookies()
  const pendingEmail = cookieStore.get("pending_verification_email")?.value

  return (
    <main className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-900 to-slate-950 p-4 text-white">
      <Card className="w-full max-w-lg bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-2xl">Almost there!</CardTitle>
          <CardDescription className="text-slate-200/80">
            We sent a verification link to your email{pendingEmail ? ` (${maskEmail(pendingEmail)})` : ""}. Please verify to finish creating your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ul className="list-disc pl-6 space-y-1 text-slate-200/90">
            <li>Click the verification link in your inbox</li>
            <li>Check your spam folder if you don’t see it</li>
            <li>The link expires in 24 hours</li>
          </ul>
          {pendingEmail ? (
            <ResendClient email={pendingEmail} />
          ) : (
            <p className="text-sm text-slate-300/80">If you didn’t receive an email, try signing up again.</p>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
