"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Activity, Mail, Lock, ArrowRight, X, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)
  const router = useRouter()

  // Show/hide password toggles
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Forgot password flow (reset token + new password)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [resetToken, setResetToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [forgotLoading, setForgotLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [forgotMsg, setForgotMsg] = useState<string>("")
  const [forgotError, setForgotError] = useState<string>("")

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

  const requestResetToken = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotLoading(true)
    setForgotMsg("")
    setForgotError("")

    try {
      const res = await fetch("https://nachiket-2004-pulmocare-backend.hf.space/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      })
      const data = await res.json()

      if (!res.ok) {
        setForgotError(data.error || "Failed to request reset token")
        return
      }

      setResetToken(data.reset_token || "")
      setForgotMsg(data.message || "Reset token generated.")
    } catch {
      setForgotError("Something went wrong. Please try again.")
    } finally {
      setForgotLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    setForgotMsg("")
    setForgotError("")

    try {
      if (newPassword !== confirmPassword) {
        setForgotError("Passwords do not match")
        return
      }

      const res = await fetch("https://nachiket-2004-pulmocare-backend.hf.space/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, new_password: newPassword }),
      })
      const data = await res.json()

      if (!res.ok) {
        setForgotError(data.error || "Failed to reset password")
        return
      }

      setForgotMsg(data.message || "Password reset successfully.")
      // Close after success so user goes back to login.
      setForgotOpen(false)
      setResetToken("")
      setNewPassword("")
      setConfirmPassword("")
      setForgotEmail("")
    } catch {
      setForgotError("Something went wrong. Please try again.")
    } finally {
      setResetLoading(false)
    }
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  placeholder="Enter your password"
                  className="flex-1 bg-transparent py-3 text-foreground placeholder:text-muted-foreground focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
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

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setForgotOpen(true)
                  setForgotEmail(email)
                  setResetToken("")
                  setNewPassword("")
                  setConfirmPassword("")
                  setForgotMsg("")
                  setForgotError("")
                }}
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </button>
              {forgotMsg && (
                <span className="text-xs text-muted-foreground truncate">{forgotMsg}</span>
              )}
            </div>
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

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl border border-border w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground text-lg">Reset Password</h3>
              <button
                type="button"
                onClick={() => {
                  setForgotOpen(false)
                  setResetToken("")
                  setForgotEmail("")
                  setNewPassword("")
                  setConfirmPassword("")
                  setForgotMsg("")
                  setForgotError("")
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {!resetToken ? (
                <form onSubmit={requestResetToken} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  {forgotError && (
                    <p className="text-sm text-destructive">{forgotError}</p>
                  )}
                  {forgotMsg && (
                    <p className="text-sm text-muted-foreground">{forgotMsg}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full h-12 rounded-xl"
                  >
                    {forgotLoading ? "Generating..." : "Get Reset Code"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Reset Code</label>
                    <input
                      type="text"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      required
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use the token returned by the backend (this demo doesn&apos;t send email).
                    </p>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">New Password</label>
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="Enter new password"
                        className="flex-1 bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(v => !v)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Confirm Password</label>
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Confirm new password"
                        className="flex-1 bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(v => !v)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {forgotError && (
                    <p className="text-sm text-destructive">{forgotError}</p>
                  )}
                  {forgotMsg && (
                    <p className="text-sm text-muted-foreground">{forgotMsg}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full h-12 rounded-xl"
                  >
                    {resetLoading ? "Resetting..." : "Reset Password"}
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setResetToken("")
                      setNewPassword("")
                      setConfirmPassword("")
                      setForgotError("")
                      setForgotMsg("")
                    }}
                    className="w-full text-sm font-medium text-primary hover:underline"
                  >
                    Back
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
