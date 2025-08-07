import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "./mongodb"
import { SignJWT, jwtVerify, type JWTPayload } from "jose"
import { ObjectId } from "mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface User {
  id: string
  email: string
  username?: string
  passwordHash?: string
  role: "user" | "admin"
  profile?: {
    firstName?: string
    lastName?: string
    avatar?: string
    dateOfBirth?: string
  }
  settings?: {
    notifications?: boolean
    theme?: "light" | "dark"
    language?: string
  }
  isEmailVerified: boolean
  oauthAccounts?: OAuthAccount[]
  created_at: Date
  updated_at: Date
}

export interface OAuthAccount {
  provider: string
  providerId: string
  email: string
  name: string
  avatar?: string
  linkedAt: Date
  lastUsed?: Date
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET env var is required")
  }
  return new TextEncoder().encode(secret)
}

export async function generateToken(
  payload: JWTPayload & { sub?: string },
  expiresIn: string | number = "7d"
): Promise<string> {
  const secret = getJwtSecret()
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .setSubject(payload.sub ?? "")
    .sign(secret)
  return jwt
}

export async function verifyToken<T extends JWTPayload = JWTPayload>(token: string): Promise<T> {
  const secret = getJwtSecret()
  const { payload } = await jwtVerify(token, secret)
  return payload as T
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createUser(userData: {
  email: string
  username: string
  password?: string
  profile?: {
    firstName?: string
    lastName?: string
    avatar?: string
    dateOfBirth?: string
  }
  isEmailVerified?: boolean
  oauthAccounts?: OAuthAccount[]
}): Promise<User> {
  const { db } = await connectToDatabase()

  const passwordHash = userData.password ? await hashPassword(userData.password) : undefined

  const user = {
    email: userData.email,
    username: userData.username,
    passwordHash,
    role: "user" as const,
    profile: userData.profile || {},
    settings: {
      notifications: true,
      theme: "dark" as const,
      language: "en",
    },
    isEmailVerified: userData.isEmailVerified || false,
    oauthAccounts: userData.oauthAccounts || [],
    created_at: new Date(),
    updated_at: new Date(),
  }

  const result = await db.collection("users").insertOne(user)

  return {
    id: result.insertedId.toString(),
    ...user,
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { db } = await connectToDatabase()

  const user = await db.collection("users").findOne({ email })

  if (!user) return null

  return {
    id: user._id.toString(),
    email: user.email,
    username: user.username,
    passwordHash: user.passwordHash,
    role: user.role,
    profile: user.profile,
    settings: user.settings,
    isEmailVerified: user.isEmailVerified,
    oauthAccounts: user.oauthAccounts || [],
    created_at: user.created_at,
    updated_at: user.updated_at,
  }
}

export async function getUserById(id: string): Promise<User | null> {
  const { db } = await connectToDatabase()

  const user = await db.collection("users").findOne({ _id: new ObjectId(id) })

  if (!user) return null

  return {
    id: user._id.toString(),
    email: user.email,
    username: user.username,
    passwordHash: user.passwordHash,
    role: user.role,
    profile: user.profile,
    settings: user.settings,
    isEmailVerified: user.isEmailVerified,
    oauthAccounts: user.oauthAccounts || [],
    created_at: user.created_at,
    updated_at: user.updated_at,
  }
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const { db } = await connectToDatabase()

  const result = await db.collection("users").findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...updates,
        updated_at: new Date(),
      },
    },
    { returnDocument: "after" },
  )

  if (!result.value) return null

  return {
    id: result.value._id.toString(),
    email: result.value.email,
    username: result.value.username,
    passwordHash: result.value.passwordHash,
    role: result.value.role,
    profile: result.value.profile,
    settings: result.value.settings,
    isEmailVerified: result.value.isEmailVerified,
    oauthAccounts: result.value.oauthAccounts || [],
    created_at: result.value.created_at,
    updated_at: result.value.updated_at,
  }
}

export async function linkOAuthAccount(params: {
  userId: string
  provider: string
  providerAccountId: string
}): Promise<boolean> {
  const { db } = await connectToDatabase()

  const oauthAccount: OAuthAccount = {
    provider: params.provider,
    providerId: params.providerAccountId,
    email: "", // TODO: Fetch email from OAuth provider
    name: "", // TODO: Fetch name from OAuth provider
    avatar: "", // TODO: Fetch avatar from OAuth provider
    linkedAt: new Date(),
    lastUsed: new Date(),
  }

  const result = await db.collection("users").updateOne(
    { _id: new ObjectId(params.userId) },
    {
      $addToSet: { oauthAccounts: oauthAccount },
      $set: { updated_at: new Date() },
    },
  )

  return result.modifiedCount > 0
}

export async function unlinkOAuthAccount(params: {
  userId: string
  provider: string
  providerAccountId: string
}): Promise<boolean> {
  const { db } = await connectToDatabase()

  const result = await db.collection("users").updateOne(
    { _id: new ObjectId(params.userId) },
    {
      $pull: { oauthAccounts: { providerId: params.providerAccountId } },
      $set: { updated_at: new Date() },
    },
  )

  return result.modifiedCount > 0
}

export async function getUserOAuthAccounts(userId: string): Promise<OAuthAccount[]> {
  const { db } = await connectToDatabase()

  const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })

  return user?.oauthAccounts || []
}

export async function updateOAuthAccountLastUsed(userId: string, provider: string): Promise<boolean> {
  const { db } = await connectToDatabase()

  const result = await db.collection("users").updateOne(
    {
      _id: new ObjectId(userId),
      "oauthAccounts.provider": provider,
    },
    {
      $set: {
        "oauthAccounts.$.lastUsed": new Date(),
        updated_at: new Date(),
      },
    },
  )

  return result.modifiedCount > 0
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email)

  if (!user || !user.passwordHash) return null

  const isValid = await comparePassword(password, user.passwordHash)

  if (!isValid) return null

  return user
}
