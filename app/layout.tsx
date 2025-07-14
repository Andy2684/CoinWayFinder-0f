// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import { AuthProvider } from "@/components/auth/auth-provider";

export const metadata = {
  title: "CoinWayfinder",
  description: "Crypto analytics and tools",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
