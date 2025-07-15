// components/auth/protected-route.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push(redirectTo);
      } else if (requiredRole && user?.role !== requiredRole) {
        router.push(redirectTo);
      }
    }
  }, [loading, isAuthenticated, user, requiredRole, redirectTo, router]);

  if (loading) {
    return <div>Loading...</div>; // Replace with your loading component
  }

  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return null; // Prevent rendering until redirection
  }

  return <>{children}</>;
}