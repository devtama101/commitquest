import { ClientNavbar } from "@/components/layout/ClientNavbar";
import { PublicProfile } from "@/components/profile/PublicProfile";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;

  return (
    <div className="min-h-screen bg-sand">
      <ClientNavbar />

      <main className="pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <PublicProfile username={username} />
        </div>
      </main>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params;

  return {
    title: `${username} - CommitQuest Profile`,
    description: `View ${username}'s coding achievements and commit history on CommitQuest.`,
  };
}
