"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { SignOutButton } from "./SignOutButton";

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isLanding = pathname === "/";
  const navLinks = session
    ? [
        { name: "Dashboard", href: "/dashboard" },
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
    <nav className="fixed top-0 left-0 right-0 z-40 bg-cream border-b-3 border-dark py-3 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="font-display text-2xl md:text-3xl text-orange text-shadow-sm tracking-wider">
          Commit<span className="text-teal">Quest</span>
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                className="font-body font-bold text-dark hover:text-orange transition-colors text-lg"
              >
                {link.name}
              </Link>
            </li>
          ))}
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
              <SignOutButton />
            </>
          ) : (
            <Link href="/">
              <Button size="sm">Start Quest</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
