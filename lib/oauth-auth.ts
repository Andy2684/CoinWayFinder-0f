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
    const response = await fetch(oauthProvider.tokenUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: oauthProvider.clientId,
        client_secret: oauthProvider.clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
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
    const response = await fetch(oauthProvider.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
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

    return null
  } catch (error) {
    console.error(`Error fetching user info (${provider}):`, error)
    return null
  }
}
