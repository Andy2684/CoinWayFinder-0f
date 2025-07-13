import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// In-memory storage for demo (use database in production)
const users: any[] = [];
const resetTokens: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 },
      );
    }

    // Find reset token
    const resetTokenData = resetTokens.find((t) => t.token === token);

    if (!resetTokenData) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 },
      );
    }

    // Check if token is expired
    if (new Date() > resetTokenData.expiry) {
      // Remove expired token
      const tokenIndex = resetTokens.findIndex((t) => t.token === token);
      if (tokenIndex > -1) resetTokens.splice(tokenIndex, 1);

      return NextResponse.json(
        { error: "Reset token has expired" },
        { status: 400 },
      );
    }

    // Find user
    const userIndex = users.findIndex((u) => u.id === resetTokenData.userId);

    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password
    users[userIndex].password = hashedPassword;
    users[userIndex].updatedAt = new Date();

    // Remove used reset token
    const tokenIndex = resetTokens.findIndex((t) => t.token === token);
    if (tokenIndex > -1) resetTokens.splice(tokenIndex, 1);

    return NextResponse.json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Find reset token
    const resetTokenData = resetTokens.find((t) => t.token === token);

    if (!resetTokenData) {
      return NextResponse.json(
        { error: "Invalid reset token" },
        { status: 400 },
      );
    }

    // Check if token is expired
    if (new Date() > resetTokenData.expiry) {
      // Remove expired token
      const tokenIndex = resetTokens.findIndex((t) => t.token === token);
      if (tokenIndex > -1) resetTokens.splice(tokenIndex, 1);

      return NextResponse.json(
        { error: "Reset token has expired" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      valid: true,
      email: resetTokenData.email,
    });
  } catch (error) {
    console.error("Validate reset token error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
