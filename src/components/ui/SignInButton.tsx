"use client";

import { signIn } from "next-auth/react";

interface SignInButtonProps {
  provider: "github" | "gitlab" | "credentials";
  children: React.ReactNode;
  className?: string;
  email?: string;
  password?: string;
}

export function SignInButton({
  provider,
  children,
  className = "",
  email,
  password,
}: SignInButtonProps) {
  const handleSignIn = () => {
    if (provider === "credentials" && email && password) {
      signIn("credentials", {
        email,
        password,
        callbackUrl: "/dashboard",
      });
    } else {
      signIn(provider, { callbackUrl: "/dashboard" });
    }
  };

  return (
    <button onClick={handleSignIn} className={className}>
      {children}
    </button>
  );
}
