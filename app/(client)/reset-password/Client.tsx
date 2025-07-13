"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
        {token ? (
          <p className="text-gray-700">
            Token: <code>{token}</code>
          </p>
        ) : (
          <p className="text-red-600">Token not found in URL.</p>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
