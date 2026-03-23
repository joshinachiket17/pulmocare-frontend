"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Activity, Mail, Lock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("https://nachiket-2004-pulmocare-backend.hf.space/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (data.token) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        router.push("/home")
      } else {
        alert(data.error || "Login failed")
      }
    } catch {
      alert("Something went wrong. Please try again.")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">PulmoCare</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Advanced
            <br />
            Lung Diagnostics
          </h1>

          <p className="text-lg text-white/80 max-w-md leading-relaxed">
            Advanced detection and monitoring for COPD, Pneumonia, and
            respiratory conditions.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-foreground">PulmoCare</span>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Welcome back
            </h2>
            <p className="text-muted-foreground">
              Sign in to access your health dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-xl border bg-card px-4 transition-all duration-200",
                  focused === "email"
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-muted-foreground/50"
                )}
              >
                <Mail className="h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  placeholder="Enter your email"
                  className="flex-1 bg-transparent py-3 text-foreground placeholder:text-muted-foreground focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Password
              </label>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-xl border bg-card px-4 transition-all duration-200",
                  focused === "password"
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-muted-foreground/50"
                )}
              >
                <Lock className="h-5 w-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  placeholder="Enter your password"
                  className="flex-1 bg-transparent py-3 text-foreground placeholder:text-muted-foreground focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-base font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
            >
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/create-account"
              className="font-medium text-primary hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
