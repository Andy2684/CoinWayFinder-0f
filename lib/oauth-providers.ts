export interface OAuthProvider {
  id: string
  name: string
  clientId: string
  clientSecret: string
  authUrl: string
  tokenUrl: string
  userInfoUrl: string
  scope: string
  redirectUri: string
}

export const getGoogleProvider = (): OAuthProvider => ({
  id: "google",
  name: "Google",
  clientId: process.env.GOOGLE_CLIENT_ID || "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUrl: "https://oauth2.googleapis.com/token",
  userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
  scope: "openid email profile",
  redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/google`,
})

export const getGitHubProvider = (): OAuthProvider => ({
  id: "github",
  name: "GitHub",
  clientId: process.env.GITHUB_CLIENT_ID || "",
  clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
  authUrl: "https://github.com/login/oauth/authorize",
  tokenUrl: "https://github.com/login/oauth/access_token",
  userInfoUrl: "https://api.github.com/user",
  scope: "user:email",
  redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/github`,
})

export function generateOAuthUrl(provider: OAuthProvider, state: string): string {
  const params = new URLSearchParams({
    client_id: provider.clientId,
    redirect_uri: provider.redirectUri,
    scope: provider.scope,
    response_type: "code",
    state: state,
    ...(provider.id === "google" && { access_type: "offline", prompt: "consent" }),
  })

  return `${provider.authUrl}?${params.toString()}`
}

export async function exchangeCodeForToken(provider: OAuthProvider, code: string): Promise<any> {
  const response = await fetch(provider.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      client_id: provider.clientId,
      client_secret: provider.clientSecret,
      code: code,
      redirect_uri: provider.redirectUri,
      grant_type: "authorization_code",
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to exchange code for token: ${response.statusText}`)
  }

  return response.json()
}

export async function getUserInfo(provider: OAuthProvider, accessToken: string): Promise<any> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
  }

  // GitHub requires User-Agent header
  if (provider.id === "github") {
    headers["User-Agent"] = "CoinWayFinder-App"
  }

  const response = await fetch(provider.userInfoUrl, {
    headers,
  })

  if (!response.ok) {
    throw new Error(`Failed to get user info: ${response.statusText}`)
  }

  return response.json()
}
