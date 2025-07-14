// app/profile/page.tsx
"use client";
export const dynamic = "force-dynamic";

import { AuthProvider } from "@/components/auth/auth-provider";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ProfilePageComponent } from "@/components/profile/profile-page";

export default function Profile() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <ProfilePageComponent />
      </ProtectedRoute>
    </AuthProvider>
  );
}
