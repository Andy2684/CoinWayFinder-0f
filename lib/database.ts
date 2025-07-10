import { simpleHash, generateRandomString } from "./security"

// Database interaction logic will go here.
// This is a placeholder for the actual database implementation.

interface User {
  id: string
  username: string
  passwordHash: string
  salt: string
}

const users: User[] = []

export async function createUser(username: string, password: string): Promise<User> {
  const salt = generateRandomString(16)
  const passwordHash = await simpleHash(password + salt)
  const id = generateRandomString(20) // Generate a random ID

  const newUser: User = {
    id,
    username,
    passwordHash,
    salt,
  }

  users.push(newUser)
  return newUser
}

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  const user = users.find((u) => u.username === username)

  if (!user) {
    return null
  }

  const passwordHash = await simpleHash(password + user.salt)

  if (passwordHash === user.passwordHash) {
    return user
  }

  return null
}

export async function getUserById(id: string): Promise<User | null> {
  return users.find((u) => u.id === id) || null
}
