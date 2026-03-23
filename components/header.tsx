"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, History, Settings, LogOut, Menu, X, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { href: "/home", label: "Home" },
    { href: "/resources", label: "Resources" },
    { href: "/doctor", label: "Consult" },
  ]

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-card/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/home"
            className="flex items-center gap-2 transition-transform hover:scale-[1.02]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-foreground">
              PulmoCare
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Profile Dropdown */}
          <div className="flex items-center gap-2">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Profile Button */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200",
                  "bg-muted hover:bg-primary/10 hover:text-primary",
                  menuOpen && "bg-primary/10 text-primary ring-2 ring-primary/20"
                )}
              >
                <User className="h-5 w-5" />
              </button>

              {/* Dropdown Menu */}
              <div
                className={cn(
                  "absolute right-0 mt-2 w-48 rounded-xl bg-card border border-border shadow-lg overflow-hidden transition-all duration-200 origin-top-right",
                  menuOpen
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                )}
              >
                <div className="p-1">
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground rounded-lg hover:bg-muted transition-colors"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    Profile
                  </Link>
                  <Link
                    href="/history"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground rounded-lg hover:bg-muted transition-colors"
                  >
                    <History className="h-4 w-4 text-muted-foreground" />
                    History
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground rounded-lg hover:bg-muted transition-colors"
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    Settings
                  </Link>
                  <div className="my-1 border-t border-border" />
                  <Link
                    href="/"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            mobileMenuOpen ? "max-h-48 pb-4" : "max-h-0"
          )}
        >
          <nav className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
