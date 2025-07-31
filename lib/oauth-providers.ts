export interface OAuthProvider {
  id: string
  name: string
  displayName: string
  icon: string
  color: string
  authUrl: string
  tokenUrl: string
  userInfoUrl: string
  scopes: string[]
  clientId: string
  clientSecret: string
}

export const oauthProviders: Record<string, OAuthProvider> = {
  google: {
    id: "google",
    name: "google",
    displayName: "Google",
    icon: "google",
    color: "bg-red-500 hover:bg-red-600",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
    scopes: ["openid", "profile", "email"],
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  },
  github: {
    id: "github",
    name: "github",
    displayName: "GitHub",
    icon: "github",
    color: "bg-gray-800 hover:bg-gray-900",
    authUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    userInfoUrl: "https://api.github.com/user",
    scopes: ["user:email"],
    clientId: process.env.GITHUB_CLIENT_ID || "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
  },
}

export function getOAuthProvider(providerId: string): OAuthProvider | null {
  return oauthProviders[providerId] || null
}

export function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function buildAuthUrl(provider: OAuthProvider, state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: provider.clientId,
    redirect_uri: redirectUri,
    scope: provider.scopes.join(" "),
    response_type: "code",
    state: state,
  })

  return `${provider.authUrl}?${params.toString()}`
}
