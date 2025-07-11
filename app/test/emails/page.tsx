import { EmailTester } from "@/components/admin/email-tester"

export default function TestEmailsPage() {
  return (
    <div className="min-h-screen bg-[#191A1E] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Email System Testing</h1>
          <p className="text-gray-400">Test all email functionality with project.command.center@gmail.com</p>
        </div>

        <EmailTester />

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Configure your SMTP settings in environment variables:
            <br />
            SMTP_HOST, SMTP_USER, SMTP_PASS
          </p>
        </div>
      </div>
    </div>
  )
}
