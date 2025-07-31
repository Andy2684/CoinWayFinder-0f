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
  twitter: {
    id: "twitter",
    name: "twitter",
    displayName: "Twitter",
    icon: "twitter",
    color: "bg-blue-500 hover:bg-blue-600",
    authUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    userInfoUrl: "https://api.twitter.com/2/users/me",
    scopes: ["tweet.read", "users.read"],
    clientId: process.env.TWITTER_CLIENT_ID || "",
    clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
  },
  discord: {
    id: "discord",
    name: "discord",
    displayName: "Discord",
    icon: "discord",
    color: "bg-indigo-600 hover:bg-indigo-700",
    authUrl: "https://discord.com/api/oauth2/authorize",
    tokenUrl: "https://discord.com/api/oauth2/token",
    userInfoUrl: "https://discord.com/api/users/@me",
    scopes: ["identify", "email"],
    clientId: process.env.DISCORD_CLIENT_ID || "",
    clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
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

  // Twitter uses different parameter names
  if (provider.id === "twitter") {
    params.set("code_challenge", "challenge")
    params.set("code_challenge_method", "plain")
  }

  return `${provider.authUrl}?${params.toString()}`
}
