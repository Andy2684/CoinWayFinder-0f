import { getOAuthProvider } from "./oauth-providers"

export interface OAuthUserInfo {
  id: string
  email: string
  name: string
  avatar?: string
  username?: string
}

export async function exchangeCodeForToken(
  provider: string,
  code: string,
  redirectUri: string,
): Promise<string | null> {
  const oauthProvider = getOAuthProvider(provider)
  if (!oauthProvider) return null

  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    }

    const body = new URLSearchParams({
      client_id: oauthProvider.clientId,
      client_secret: oauthProvider.clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    })

    // Twitter uses different authentication method
    if (provider === "twitter") {
      const credentials = Buffer.from(`${oauthProvider.clientId}:${oauthProvider.clientSecret}`).toString("base64")
      headers.Authorization = `Basic ${credentials}`
      body.set("code_verifier", "challenge")
    }

    const response = await fetch(oauthProvider.tokenUrl, {
      method: "POST",
      headers,
      body,
    })

    const data = await response.json()
    return data.access_token || null
  } catch (error) {
    console.error(`Error exchanging code for token (${provider}):`, error)
    return null
  }
}

export async function fetchUserInfo(provider: string, accessToken: string): Promise<OAuthUserInfo | null> {
  const oauthProvider = getOAuthProvider(provider)
  if (!oauthProvider) return null

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    }

    // Twitter uses different API version
    if (provider === "twitter") {
      headers["User-Agent"] = "CoinWayFinder/1.0"
    }

    const response = await fetch(oauthProvider.userInfoUrl, {
      headers,
    })

    const userData = await response.json()

    if (provider === "google") {
      return {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        avatar: userData.picture,
        username: userData.email?.split("@")[0],
      }
    }

    if (provider === "github") {
      // GitHub might not return email in the user endpoint, so fetch it separately
      let email = userData.email
      if (!email) {
        const emailResponse = await fetch("https://api.github.com/user/emails", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        })
        const emails = await emailResponse.json()
        const primaryEmail = emails.find((e: any) => e.primary)
        email = primaryEmail?.email || emails[0]?.email
      }

      return {
        id: userData.id.toString(),
        email,
        name: userData.name || userData.login,
        avatar: userData.avatar_url,
        username: userData.login,
      }
    }

    if (provider === "twitter") {
      // Twitter API v2 response format
      const user = userData.data || userData
      return {
        id: user.id,
        email: user.email || `${user.username}@twitter.placeholder`, // Twitter doesn't always provide email
        name: user.name,
        avatar: user.profile_image_url,
        username: user.username,
      }
    }

    if (provider === "discord") {
      return {
        id: userData.id,
        email: userData.email,
        name: userData.global_name || userData.username,
        avatar: userData.avatar
          ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
          : undefined,
        username: userData.username,
      }
    }

    return null
  } catch (error) {
    console.error(`Error fetching user info (${provider}):`, error)
    return null
  }
}
