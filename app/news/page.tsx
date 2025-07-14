// app/news/page.tsx
"use client";
export const dynamic = "force-dynamic";

import { AuthProvider } from "@/components/auth/auth-provider";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { NewsFeed } from "@/components/news/news-feed";

export default function NewsPage() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <NewsFeed />
      </ProtectedRoute>
    </AuthProvider>
  );
}
