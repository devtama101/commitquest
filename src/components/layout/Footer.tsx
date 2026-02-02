import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-dark text-cream py-12 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <div className="font-display text-3xl text-orange mb-6">
          Commit<span className="text-teal">Quest</span>
        </div>

        <div className="flex flex-wrap justify-center gap-8 mb-6">
          <a href="https://webartisan.id" target="_blank" rel="noopener noreferrer" className="font-body font-bold hover:text-orange transition-colors">
            WebArtisan.id
          </a>
          <a href="https://github.com/devtama101" target="_blank" rel="noopener noreferrer" className="font-body font-bold hover:text-orange transition-colors">
            GitHub
          </a>
        </div>

        <p className="font-body opacity-70 text-sm">
          © 2025 CommitQuest. Crafted with ☕ and 🔥 by <a href="https://github.com/devtama101" target="_blank" rel="noopener noreferrer" className="text-orange hover:underline">Tama</a>
        </p>
      </div>
    </footer>
  );
}
