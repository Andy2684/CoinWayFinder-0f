// app/auth/verify-email/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const router = useRouter();

  useEffect(() => {
    // Автоперенаправление через 3 секунды
    const timer = setTimeout(() => {
      router.push("/auth/login");
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="max-w-md mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Email Verified!</h1>
      <p className="mb-6">
        Thank you for verifying your email. You will be redirected to the login page shortly.
      </p>
      <Link href="/auth/login" passHref>
        <Button className="bg-[#30D5C8] hover:bg-[#2BC4B9] text-black">
          Continue to Login
        </Button>
      </Link>
    </div>
  );
}
