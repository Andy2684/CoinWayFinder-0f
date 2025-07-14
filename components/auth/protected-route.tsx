// components/auth/protected-route.tsx

"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string; // опционально, если будете проверять роли
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Если нет пользователя — редиректим на страницу логина
    if (!user) {
      router.replace("/auth/login");
    }
    // Если нужна проверка роли:
    if (requiredRole && user && (user as any).role !== requiredRole) {
      router.replace("/auth/login");
    }
  }, [user, requiredRole, router]);

  // Пока user ещё не загружен, можно вернуть null или спиннер
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
