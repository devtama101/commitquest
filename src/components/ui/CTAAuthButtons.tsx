"use client";

import { useState } from "react";
import { SignInButton } from "@/components/ui/SignInButton";
import { AuthModal } from "@/components/ui/AuthModal";

export function CTAAuthButtons() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <SignInButton
          provider="github"
          className="font-body font-bold px-8 py-4 border-3 border-dark rounded-full bg-[#333] text-white shadow-[4px_4px_0_var(--color-dark)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--color-dark)] transition-all text-lg"
        >
          🐙 Start with GitHub
        </SignInButton>
        <SignInButton
          provider="gitlab"
          className="font-body font-bold px-8 py-4 border-3 border-dark rounded-full bg-[#FC6D26] text-white shadow-[4px_4px_0_var(--color-dark)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--color-dark)] transition-all text-lg"
        >
          🦊 Start with GitLab
        </SignInButton>
      </div>

      <div className="flex items-center justify-center gap-4 mt-6">
        <div className="h-px bg-cream/30 w-24"></div>
        <span className="font-body font-bold text-cream/50 text-sm">or</span>
        <div className="h-px bg-cream/30 w-24"></div>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="font-body font-bold px-8 py-4 border-3 border-dark rounded-full bg-white text-purple shadow-[4px_4px_0_var(--color-dark)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--color-dark)] transition-all text-lg flex items-center justify-center gap-2 mx-auto mt-6"
      >
        <span>📧</span> Sign up with Email
      </button>

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
