import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser, getUserById, updateUserProfile } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const tokenPayload = await getCurrentUser()

    if (!tokenPayload) {
      return NextResponse.json(
        {
          success: false,
          error: "Not authenticated",
          message: "Please log in to access your profile",
        },
        { status: 401 },
      )
    }

    const user = await getUserById(tokenPayload.userId)

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
          message: "User profile not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      user: user,
    })
  } catch (error) {
    console.error("Error fetching profile:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An error occurred while fetching your profile",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const tokenPayload = await getCurrentUser()

    if (!tokenPayload) {
      return NextResponse.json(
        {
          success: false,
          error: "Not authenticated",
          message: "Please log in to update your profile",
        },
        { status: 401 },
      )
    }

    const body = await request.json()
    const { firstName, lastName, username, email } = body

    // Validate input
    const errors: string[] = []

    if (firstName !== undefined && (typeof firstName !== "string" || firstName.trim().length === 0)) {
      errors.push("First name cannot be empty")
    }

    if (lastName !== undefined && (typeof lastName !== "string" || lastName.trim().length === 0)) {
      errors.push("Last name cannot be empty")
    }

    if (username !== undefined && typeof username === "string") {
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
      if (!usernameRegex.test(username)) {
        errors.push("Username must be 3-20 characters, alphanumeric and underscore only")
      }
    }

    if (email !== undefined && typeof email === "string") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        errors.push("Please enter a valid email address")
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          message: errors.join(". "),
          errors: errors,
        },
        { status: 400 },
      )
    }

    // Update user profile
    const updatedUser = await updateUserProfile(tokenPayload.userId, {
      firstName,
      lastName,
      username,
      email,
    })

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Update failed",
          message: "Failed to update profile",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error updating profile:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: "Update failed",
          message: error.message,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An error occurred while updating your profile",
      },
      { status: 500 },
    )
  }
}
