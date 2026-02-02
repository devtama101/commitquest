import { ClientNavbar } from "@/components/layout/ClientNavbar";
import { Footer } from "@/components/layout/Footer";
import { RepoList } from "@/components/repos/RepoList";

export default function ReposPage() {
  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <ClientNavbar />

      <main className="flex-1 pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-5xl md:text-6xl text-dark mb-4">
              Repository Manager
            </h1>
            <p className="font-body font-bold text-dark text-lg">
              Connect your GitHub and GitLab repositories to start tracking commits
            </p>
          </div>

          {/* Repo List */}
          <RepoList />
        </div>
      </main>

      <Footer />
    </div>
  );
}
