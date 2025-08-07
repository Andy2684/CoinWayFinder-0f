type SendResult = { ok: boolean; error?: string }

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3000"
  )
}

export function buildVerifyUrl(token: string) {
  const base = getBaseUrl().replace(/\/$/, "")
  return `${base}/auth/verify-email?token=${encodeURIComponent(token)}`
}

export async function sendVerificationEmail(to: string, token: string): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn("RESEND_API_KEY not configured; skipping email send.")
    return { ok: false, error: "Email provider not configured" }
  }

  const from = process.env.MAILGUN_FROM_EMAIL || process.env.EMAIL_FROM || "no-reply@coinwayfinder.com"
  const subject = "Verify your email - CoinWayFinder"
  const verifyUrl = buildVerifyUrl(token)

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
      <h2>Verify your email</h2>
      <p>Thanks for signing up for CoinWayFinder. Please verify your email address by clicking the button below:</p>
      <p>
        <a href="${verifyUrl}" style="display:inline-block;padding:12px 20px;background:#6d28d9;color:#fff;text-decoration:none;border-radius:8px;">
          Verify Email
        </a>
      </p>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break:break-all;color:#111">${verifyUrl}</p>
      <p>This link will expire in 24 hours.</p>
    </div>
  `

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error("Resend error:", res.status, text)
    return { ok: false, error: text || `Failed to send (${res.status})` }
  }

  return { ok: true }
}
