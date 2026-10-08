"use client";

import Link from "next/link";
import { Layers, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "./theme-switcher";

export function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex min-h-14 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-white">
            <Layers className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-ink">CampusLink</span>
        </Link>
        <nav className="hidden items-center gap-6 font-fira-code text-sm text-ink-muted md:flex">
          <a href="#how-it-works" className="transition-colors hover:text-ink">How it works</a>
          <a href="#stakeholders" className="transition-colors hover:text-ink">For you</a>
          <a href="#loop" className="transition-colors hover:text-ink">The loop</a>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <ThemeSwitcher />
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/dashboard/student">
            <Button size="sm">View Demo Dashboard</Button>
          </Link>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <ThemeSwitcher />
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="border-t border-border bg-surface/95 px-4 pb-4 pt-3 md:hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col gap-1 font-fira-code text-sm text-ink">
            <a href="#how-it-works" onClick={closeMenu} className="rounded-md px-3 py-2 hover:bg-surface-raised hover:text-accent">How it works</a>
            <a href="#stakeholders" onClick={closeMenu} className="rounded-md px-3 py-2 hover:bg-surface-raised hover:text-accent">For you</a>
            <a href="#loop" onClick={closeMenu} className="rounded-md px-3 py-2 hover:bg-surface-raised hover:text-accent">The loop</a>
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
            <Link href="/login" onClick={closeMenu}>
              <Button variant="ghost" size="sm" className="w-full">Sign in</Button>
            </Link>
            <Link href="/dashboard/student" onClick={closeMenu}>
              <Button size="sm" className="w-full">View Demo Dashboard</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
