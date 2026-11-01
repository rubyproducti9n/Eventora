import * as React from "react";

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-stone-900 focus:text-white focus:rounded-md focus:shadow-md focus:text-xs focus:font-medium focus:outline-none"
    >
      Skip to main content
    </a>
  );
}
