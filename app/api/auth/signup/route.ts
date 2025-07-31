import { createDefaultPreferences } from "@/lib/notification-preferences"

export async function POST(request: Request) {
  // Parse the request body
  const body = await request.json()
  const { email, password } = body

  // Validate the input
  if (!email || !password) {
    return new Response("Invalid input", { status: 400 })
  }

  // Create the user
  const user = await createUser(email, password)

  // Create default notification preferences
  try {
    await createDefaultPreferences(user.id)
  } catch (error) {
    console.error("Failed to create default notification preferences:", error)
    // Don't fail the signup if preferences creation fails
  }

  // Return a success response
  return new Response("User created successfully", { status: 201 })
}

async function createUser(email: string, password: string) {
  // Logic to create a user
  return { id: 1, email, password }
}
