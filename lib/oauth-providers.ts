export interface OAuthProvider {
  name: string
  clientId: string
  clientSecret: string
  authUrl: string
  tokenUrl: string
  userInfoUrl: string
  scope: string
  redirectUri: string
}

export function getOAuthProvider(provider: string): OAuthProvider | null {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

  switch (provider) {
    case "google":
      return {
        name: "Google",
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
        scope: "openid email profile",
        redirectUri: `${baseUrl}/api/auth/callback/google`,
      }
    case "github":
      return {
        name: "GitHub",
        clientId: process.env.GITHUB_CLIENT_ID || "",
        clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        authUrl: "https://github.com/login/oauth/authorize",
        tokenUrl: "https://github.com/login/oauth/access_token",
        userInfoUrl: "https://api.github.com/user",
        scope: "user:email",
        redirectUri: `${baseUrl}/api/auth/callback/github`,
      }
    default:
      return null
  }
}

export function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function buildAuthUrl(provider: OAuthProvider, state: string): string {
  const params = new URLSearchParams({
    client_id: provider.clientId,
    redirect_uri: provider.redirectUri,
    scope: provider.scope,
    response_type: "code",
    state: state,
    ...(provider.name === "Google" && { access_type: "offline" }),
  })

  return `${provider.authUrl}?${params.toString()}`
}
