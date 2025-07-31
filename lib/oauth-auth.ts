import { connectToDatabase } from "./mongodb"
import { generateToken } from "./auth"
import type { OAuthProvider } from "./oauth-providers"

export interface OAuthUser {
  id: string
  email: string
  name: string
  avatar?: string
  provider: string
}

export async function exchangeCodeForToken(provider: OAuthProvider, code: string): Promise<string> {
  const response = await fetch(provider.tokenUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
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
    throw new Error(`Token exchange failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data.access_token
}

export async function fetchOAuthUser(provider: OAuthProvider, accessToken: string): Promise<OAuthUser> {
  const response = await fetch(provider.userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch user info: ${response.statusText}`)
  }

  const userData = await response.json()

  if (provider.name === "Google") {
    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      avatar: userData.picture,
      provider: "google",
    }
  } else if (provider.name === "GitHub") {
    // GitHub might not return email in the user endpoint
    let email = userData.email

    if (!email) {
      const emailResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      })

      if (emailResponse.ok) {
        const emails = await emailResponse.json()
        const primaryEmail = emails.find((e: any) => e.primary)
        email = primaryEmail?.email || emails[0]?.email
      }
    }

    return {
      id: userData.id.toString(),
      email: email,
      name: userData.name || userData.login,
      avatar: userData.avatar_url,
      provider: "github",
    }
  }

  throw new Error(`Unsupported provider: ${provider.name}`)
}

export async function findOrCreateOAuthUser(oauthUser: OAuthUser) {
  try {
    const { db } = await connectToDatabase()
    const usersCollection = db.collection("users")

    // First, try to find user by OAuth provider ID
    let user = await usersCollection.findOne({
      [`oauth.${oauthUser.provider}.id`]: oauthUser.id,
    })

    if (user) {
      // Update last login
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            last_login: new Date(),
            [`oauth.${oauthUser.provider}.last_login`]: new Date(),
          },
        },
      )
      return user
    }

    // Try to find user by email
    user = await usersCollection.findOne({ email: oauthUser.email })

    if (user) {
      // Link OAuth account to existing user
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            [`oauth.${oauthUser.provider}`]: {
              id: oauthUser.id,
              email: oauthUser.email,
              name: oauthUser.name,
              avatar: oauthUser.avatar,
              linked_at: new Date(),
              last_login: new Date(),
            },
            last_login: new Date(),
          },
        },
      )
      return user
    }

    // Create new user
    const newUser = {
      email: oauthUser.email,
      username: oauthUser.email.split("@")[0],
      full_name: oauthUser.name,
      avatar_url: oauthUser.avatar,
      email_verified: true, // OAuth emails are considered verified
      oauth: {
        [oauthUser.provider]: {
          id: oauthUser.id,
          email: oauthUser.email,
          name: oauthUser.name,
          avatar: oauthUser.avatar,
          linked_at: new Date(),
          last_login: new Date(),
        },
      },
      created_at: new Date(),
      last_login: new Date(),
      is_active: true,
    }

    const result = await usersCollection.insertOne(newUser)
    return { ...newUser, _id: result.insertedId }
  } catch (error) {
    console.error("Error in findOrCreateOAuthUser:", error)
    throw new Error("Failed to process OAuth user")
  }
}

export async function createOAuthSession(user: any) {
  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
    username: user.username,
  })

  return {
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      email_verified: user.email_verified,
    },
  }
}
