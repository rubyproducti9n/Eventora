import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-semibold text-slate-800">Eventora</span>
          <span className="text-xs text-slate-400">© 2026 GenAI Event Assistant</span>
        </div>
        <p className="text-xs text-slate-500 text-center sm:text-right">
          Empowering weddings, birthdays, and community gatherings with intelligent planning.
        </p>
      </div>
    </footer>
  );
}
