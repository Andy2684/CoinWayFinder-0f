import { type NextRequest, NextResponse } from "next/server"

// Mock users data
const mockUsers = [
  {
    id: "1",
    email: "demo@coinwayfinder.com",
    firstName: "Demo",
    lastName: "User",
    username: "demouser",
    role: "user",
    plan: "pro",
    isVerified: true,
    createdAt: "2024-01-15T10:30:00Z",
    lastLogin: "2024-01-20T14:22:00Z",
    status: "active",
  },
  {
    id: "2",
    email: "admin@coinwayfinder.com",
    firstName: "Admin",
    lastName: "User",
    username: "admin",
    role: "admin",
    plan: "enterprise",
    isVerified: true,
    createdAt: "2024-01-01T09:00:00Z",
    lastLogin: "2024-01-20T16:45:00Z",
    status: "active",
  },
  {
    id: "3",
    email: "john.doe@example.com",
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    role: "user",
    plan: "free",
    isVerified: false,
    createdAt: "2024-01-18T11:15:00Z",
    lastLogin: "2024-01-19T09:30:00Z",
    status: "pending",
  },
]

export async function GET(request: NextRequest) {
  try {
    // In a real app, you would verify admin permissions here
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const role = searchParams.get("role")
    const status = searchParams.get("status")

    let filteredUsers = [...mockUsers]

    // Apply filters
    if (search) {
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.email.toLowerCase().includes(search.toLowerCase()) ||
          user.firstName.toLowerCase().includes(search.toLowerCase()) ||
          user.lastName.toLowerCase().includes(search.toLowerCase()) ||
          user.username.toLowerCase().includes(search.toLowerCase()),
      )
    }

    if (role && role !== "all") {
      filteredUsers = filteredUsers.filter((user) => user.role === role)
    }

    if (status && status !== "all") {
      filteredUsers = filteredUsers.filter((user) => user.status === status)
    }

    return NextResponse.json({
      users: filteredUsers,
      total: filteredUsers.length,
    })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, updates } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // In a real app, you would update the user in the database
    console.log(`Updating user ${userId} with:`, updates)

    return NextResponse.json({
      message: "User updated successfully",
    })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // In a real app, you would delete the user from the database
    console.log(`Deleting user ${userId}`)

    return NextResponse.json({
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
