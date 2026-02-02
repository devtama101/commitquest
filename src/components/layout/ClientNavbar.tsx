"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { SignOutButton } from "./SignOutButton";

export function ClientNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLanding = pathname === "/";
  const navLinks = session
    ? [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Insights", href: "/insights" },
        { name: "Challenges", href: "/challenges" },
        { name: "Repos", href: "/repos" },
        { name: "Achievements", href: "/achievements" },
        { name: "Settings", href: "/settings" },
      ]
    : [
        { name: "Features", href: "#features" },
        { name: "Achievements", href: "#achievements" },
        { name: "Stats", href: "#stats" },
      ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cream border-b-3 border-dark py-3 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="font-display text-xl md:text-3xl text-orange text-shadow-sm tracking-wider">
          Commit<span className="text-teal">Quest</span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className={`font-body font-bold transition-colors text-lg ${
                    isActive
                      ? "text-orange"
                      : "text-dark hover:text-orange"
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-4">
          {session?.user ? (
            <>
              <div className="hidden sm:flex items-center gap-2">
                <span className="font-body font-bold text-sm">
                  {session.user.name || session.user.email}
                </span>
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-8 h-8 rounded-full border-2 border-dark"
                  />
                )}
              </div>
              <div className="hidden md:block">
                <SignOutButton />
              </div>
            </>
          ) : (
            <Link href="/">
              <Button size="sm">Start Quest</Button>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-dark text-2xl font-bold"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-4 border-dark bg-cream">
          <ul className="py-4 space-y-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`block font-body font-bold transition-colors text-lg px-4 py-2 ${
                      isActive
                        ? "text-orange"
                        : "text-dark hover:text-orange"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
            {session?.user && (
              <li className="px-4 md:hidden">
                <SignOutButton />
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}
