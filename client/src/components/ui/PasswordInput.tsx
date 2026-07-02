"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "./icons";

export function PasswordInput({
  name,
  placeholder,
  required,
  autoComplete,
  className,
  variant = "light",
}: {
  name: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  className?: string;
  variant?: "light" | "dark";
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        name={name}
        type={visible ? "text" : "password"}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={className ?? "w-full rounded-lg border border-stone-300 px-3 py-2 pr-9 text-sm"}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        className={`absolute right-2 top-1/2 -translate-y-1/2 ${
          variant === "dark" ? "text-stone-500 hover:text-stone-200" : "text-stone-400 hover:text-stone-700"
        }`}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOffIcon width={16} height={16} /> : <EyeIcon width={16} height={16} />}
      </button>
    </div>
  );
}
