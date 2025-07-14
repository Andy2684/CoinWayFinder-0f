// app/auth/layout.tsx

import { ReactNode } from "react";
import { AuthProvider } from "../../components/auth/auth-provider";

export const metadata = {
  title: "Authentication – CoinWayfinder",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
