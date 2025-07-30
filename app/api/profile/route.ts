import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser, updateUserProfile, getUserById } from "@/lib/auth"

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
        message: "Failed to fetch profile data",
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
    const updates: any = {}

    if (firstName !== undefined) {
      if (typeof firstName !== "string" || firstName.trim().length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid first name",
            message: "First name is required and must be a valid string",
          },
          { status: 400 },
        )
      }
      updates.firstName = firstName.trim()
    }

    if (lastName !== undefined) {
      if (typeof lastName !== "string" || lastName.trim().length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid last name",
            message: "Last name is required and must be a valid string",
          },
          { status: 400 },
        )
      }
      updates.lastName = lastName.trim()
    }

    if (username !== undefined) {
      if (username && typeof username === "string") {
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
        if (!usernameRegex.test(username.trim())) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid username",
              message: "Username must be 3-20 characters, alphanumeric and underscore only",
            },
            { status: 400 },
          )
        }
        updates.username = username.trim()
      } else if (username === "") {
        updates.username = null
      }
    }

    if (email !== undefined) {
      if (typeof email !== "string" || email.trim().length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid email",
            message: "Email is required and must be a valid string",
          },
          { status: 400 },
        )
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid email format",
            message: "Please enter a valid email address",
          },
          { status: 400 },
        )
      }
      updates.email = email.trim()
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No updates provided",
          message: "No valid updates were provided",
        },
        { status: 400 },
      )
    }

    try {
      const updatedUser = await updateUserProfile(tokenPayload.userId, updates)

      return NextResponse.json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      })
    } catch (updateError: any) {
      console.error("Profile update error:", updateError)

      if (updateError.message === "Email already in use") {
        return NextResponse.json(
          {
            success: false,
            error: "Email conflict",
            message: "This email address is already in use by another account",
          },
          { status: 409 },
        )
      }

      if (updateError.message === "Username already taken") {
        return NextResponse.json(
          {
            success: false,
            error: "Username conflict",
            message: "This username is already taken",
          },
          { status: 409 },
        )
      }

      throw updateError
    }
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to update profile",
      },
      { status: 500 },
    )
  }
}
