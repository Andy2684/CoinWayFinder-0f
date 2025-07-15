"use client";

import { InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = "", ...props }: InputProps) {
  return (
    <div className={`flex flex-col mb-4 ${className}`}>
      {label && (
        <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        {...props}
        className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
