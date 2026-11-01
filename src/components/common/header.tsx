"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, PlusCircle, LayoutDashboard, Menu, X } from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";

const navigationItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "All events", href: "/events", icon: Calendar },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/90 bg-stone-50/95 backdrop-blur-xs">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-baseline gap-2 group">
            <span className="text-lg font-semibold tracking-tight text-stone-900 group-hover:text-stone-700">
              Eventora
            </span>
            <span className="text-xs text-stone-500 font-normal">
              planner
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium",
                    isActive
                      ? "bg-stone-200/80 text-stone-900"
                      : "text-stone-600 hover:bg-stone-200/50 hover:text-stone-900"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Action Button & Mobile Menu Trigger */}
        <div className="flex items-center gap-3">
          <Link href="/events/new">
            <Button size="sm" className="hidden sm:inline-flex items-center gap-1.5">
              <PlusCircle className="h-3.5 w-3.5" />
              New event
            </Button>
          </Link>

          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-stone-600 hover:bg-stone-200/60 hover:text-stone-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
          >
            <span className="sr-only">Toggle navigation menu</span>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-stone-200 bg-stone-50 px-4 py-3 space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium",
                  isActive
                    ? "bg-stone-200 text-stone-900"
                    : "text-stone-600 hover:bg-stone-200/50 hover:text-stone-900"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-stone-200">
            <Link href="/events/new" onClick={() => setMobileMenuOpen(false)}>
              <Button size="sm" className="w-full justify-center gap-1.5">
                <PlusCircle className="h-4 w-4" />
                New event
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
