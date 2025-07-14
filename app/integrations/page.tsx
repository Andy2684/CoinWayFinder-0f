// app/integrations/page.tsx
"use client";
export const dynamic = "force-dynamic";

import { AuthProvider } from "@/components/auth/auth-provider";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { IntegrationsList } from "@/components/integrations/integrations-list";

export default function IntegrationsPage() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <IntegrationsList />
      </ProtectedRoute>
    </AuthProvider>
  );
}
