"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isSignup) {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }
      // Signup
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Signup failed");
        }

        // Auto sign in after signup
        await signIn("credentials", {
          email,
          password,
          callbackUrl: "/dashboard",
        });
      } catch (err: any) {
        setError(err.message);
      }
    } else {
      // Signin
      try {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError("Invalid email or password");
        } else if (result?.ok) {
          window.location.href = "/dashboard";
        }
      } catch (err: any) {
        setError("Sign in failed");
      }
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/50 backdrop-blur-sm">
      <div className="bg-cream border-4 border-dark rounded-2xl shadow-[8px_8px_0_var(--color-dark)] w-full max-w-md mx-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-dark hover:text-orange transition-colors"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="p-6 border-b-4 border-dark">
          <h2 className="font-display text-3xl text-center text-dark">
            {isSignup ? "JOIN QUEST" : "WELCOME BACK"}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-2 rounded-lg font-body font-bold text-sm">
              {error}
            </div>
          )}

          {isSignup && (
            <div>
              <label className="font-body font-bold text-dark mb-1 block">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border-3 border-dark rounded-xl font-body text-dark focus:outline-none focus:ring-2 focus:ring-orange"
                placeholder="Your name"
              />
            </div>
          )}

          <div>
            <label className="font-body font-bold text-dark mb-1 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-3 border-dark rounded-xl font-body text-dark focus:outline-none focus:ring-2 focus:ring-orange"
              placeholder="you@example.com"
            />
          </div>

          {isSignup && (
            <p className="text-xs text-center text-dark/60 font-body">
              We only use your email for account access. No spam, ever.
            </p>
          )}

          <div>
            <label className="font-body font-bold text-dark mb-1 block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 border-3 border-dark rounded-xl font-body text-dark focus:outline-none focus:ring-2 focus:ring-orange"
              placeholder="Min. 8 characters"
            />
          </div>

          {isSignup && (
            <div>
              <label className="font-body font-bold text-dark mb-1 block">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 border-3 border-dark rounded-xl font-body text-dark focus:outline-none focus:ring-2 focus:ring-orange"
                placeholder="Confirm your password"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full font-body font-bold px-6 py-4 border-3 border-dark rounded-full bg-orange text-white shadow-[4px_4px_0_var(--color-dark)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--color-dark)] transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : isSignup ? "Create Account" : "Sign In"}
          </button>
        </form>

        {/* Toggle */}
        <div className="px-6 pb-6 text-center">
          <p className="font-body text-dark">
            {isSignup ? "Already have an account?" : "No account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
              }}
              className="font-bold text-orange hover:underline"
            >
              {isSignup ? "Sign In" : "Create Account"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
