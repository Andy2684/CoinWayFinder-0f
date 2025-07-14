// components/navigation.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";  // Обновлённый путь

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  return (
    <nav className="bg-gray-800 text-white p-4 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold">
        CoinWayfinder
      </Link>

      <div className="space-x-4">
        <Link href="/" className={pathname === "/" ? "underline" : ""}>
          Home
        </Link>
        <Link
          href="/signals"
          className={pathname === "/signals" ? "underline" : ""}
        >
          Signals
        </Link>
        {user ? (
          <button onClick={handleLogout} className="ml-4">
            Logout
          </button>
        ) : (
          <Link
            href="/auth/login"
            className={pathname === "/auth/login" ? "underline" : ""}
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
