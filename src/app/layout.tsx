import type { Metadata } from "next";
import { Bangers, Comic_Neue } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { AchievementToastProvider } from "@/components/ui/AchievementToast";
import "./globals.css";

const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

const comicNeue = Comic_Neue({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "CommitQuest - Level Up Your Git Game",
  description: "Track your commits, build streaks, unlock achievements. Turn your coding journey into an epic adventure!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bangers.variable} ${comicNeue.variable} bg-cream font-body text-dark`} suppressHydrationWarning>
        <SessionProvider>
          <AchievementToastProvider />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
