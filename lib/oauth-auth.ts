import { connectToDatabase } from "./mongodb"

export interface OAuthUser {
  id: string
  email: string
  name: string
  avatar_url?: string
  provider: string
  provider_id: string
}

export async function findOrCreateOAuthUser(oauthUser: OAuthUser) {
  try {
    const { db } = await connectToDatabase()

    // First, try to find user by email
    const user = await db.collection("users").findOne({ email: oauthUser.email })

    if (user) {
      // User exists, update OAuth info if needed
      const oauthAccount = user.oauth_accounts?.find((account: any) => account.provider === oauthUser.provider)

      if (!oauthAccount) {
        // Add new OAuth account to existing user
        await db.collection("users").updateOne(
          { _id: user._id },
          {
            $push: {
              oauth_accounts: {
                provider: oauthUser.provider,
                provider_id: oauthUser.provider_id,
                connected_at: new Date(),
              },
            },
            $set: {
              updated_at: new Date(),
              last_login: new Date(),
            },
          },
        )
      } else {
        // Update last login
        await db.collection("users").updateOne(
          { _id: user._id },
          {
            $set: {
              last_login: new Date(),
              updated_at: new Date(),
            },
          },
        )
      }

      return {
        id: user._id.toString(),
        email: user.email,
        firstName: user.first_name || extractFirstName(oauthUser.name),
        lastName: user.last_name || extractLastName(oauthUser.name),
        username: user.username,
        role: user.role || "user",
        subscriptionStatus: user.subscription_status || "free",
        isEmailVerified: true, // OAuth emails are considered verified
        lastLogin: new Date().toISOString(),
        createdAt: user.created_at?.toISOString() || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    } else {
      // Create new user
      const [firstName, lastName] = splitName(oauthUser.name)

      const newUser = {
        email: oauthUser.email,
        first_name: firstName,
        last_name: lastName,
        username: generateUsernameFromEmail(oauthUser.email),
        role: "user",
        subscription_status: "free",
        is_email_verified: true,
        avatar_url: oauthUser.avatar_url,
        oauth_accounts: [
          {
            provider: oauthUser.provider,
            provider_id: oauthUser.provider_id,
            connected_at: new Date(),
          },
        ],
        created_at: new Date(),
        updated_at: new Date(),
        last_login: new Date(),
        profile: {
          bio: "",
          timezone: "UTC",
          language: "en",
        },
        settings: {
          notifications: {
            email: true,
            push: true,
            trading_alerts: true,
            news_alerts: false,
          },
          trading: {
            default_risk_level: "medium",
            auto_trading: false,
            max_daily_trades: 10,
          },
          privacy: {
            profile_public: false,
            show_portfolio: false,
          },
        },
      }

      const result = await db.collection("users").insertOne(newUser)

      return {
        id: result.insertedId.toString(),
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        username: newUser.username,
        role: newUser.role,
        subscriptionStatus: newUser.subscription_status,
        isEmailVerified: true,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }
  } catch (error) {
    console.error("Error finding or creating OAuth user:", error)
    throw error
  }
}

function splitName(fullName: string): [string, string] {
  const parts = fullName.trim().split(" ")
  const firstName = parts[0] || ""
  const lastName = parts.slice(1).join(" ") || ""
  return [firstName, lastName]
}

function extractFirstName(fullName: string): string {
  return fullName.trim().split(" ")[0] || ""
}

function extractLastName(fullName: string): string {
  const parts = fullName.trim().split(" ")
  return parts.slice(1).join(" ") || ""
}

function generateUsernameFromEmail(email: string): string {
  const baseUsername = email.split("@")[0].toLowerCase()
  // Add random suffix to avoid conflicts
  const suffix = Math.random().toString(36).substring(2, 6)
  return `${baseUsername}_${suffix}`
}
