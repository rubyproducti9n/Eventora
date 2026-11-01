export function Footer() {
  return (
    <footer className="w-full border-t border-stone-200/90 bg-stone-50 py-6 mt-12">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold text-stone-900">Eventora</span>
          <span className="text-[11px] text-stone-500">© 2026</span>
        </div>
        <p className="text-[11px] text-stone-500">
          Timeline, budget, and vendor planning for private and community celebrations.
        </p>
      </div>
    </footer>
  );
}
