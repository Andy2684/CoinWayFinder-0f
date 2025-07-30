import { TestEmailForm } from "@/components/test-email-form"

export default function TestEmailPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Email Testing Center</h1>
        <p className="text-muted-foreground">Test your email configuration and templates before going live</p>
      </div>

      <TestEmailForm />

      <div className="mt-8 max-w-2xl mx-auto">
        <div className="bg-muted/50 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Test Examples</h2>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Welcome Email:</strong> Test the user onboarding email template
            </div>
            <div>
              <strong>Verification:</strong> Test email verification flow
            </div>
            <div>
              <strong>Password Reset:</strong> Test password recovery emails
            </div>
            <div>
              <strong>Trading Alert:</strong> Test real-time trading notifications
            </div>
            <div>
              <strong>Custom:</strong> Test custom email templates and content
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
