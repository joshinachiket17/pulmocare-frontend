"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Activity,
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  ArrowRight,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function CreateAccountPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    phone: "",
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const name = `${form.firstName} ${form.lastName}`
      const res = await fetch("https://nachiket-2004-pulmocare-backend.hf.space/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: form.email, password: form.password }),
      })
      const data = await res.json()

      if (data.token) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        router.push("/home")
      } else {
        alert(data.error || "Registration failed")
      }
    } catch {
      alert("Something went wrong. Please try again.")
    }

    setLoading(false)
  }

  const inputFields = [
    { name: "firstName", label: "First Name", type: "text",     icon: User,     placeholder: "John",               half: true  },
    { name: "lastName",  label: "Last Name",  type: "text",     icon: User,     placeholder: "Doe",                half: true  },
    { name: "age",       label: "Age",        type: "number",   icon: Calendar, placeholder: "25",                 half: true  },
    { name: "phone",     label: "Phone",      type: "tel",      icon: Phone,    placeholder: "+91 98765 43210",    half: true  },
    { name: "email",     label: "Email",      type: "email",    icon: Mail,     placeholder: "john@example.com",   half: false },
    { name: "password",  label: "Password",   type: "password", icon: Lock,     placeholder: "Create a strong password", half: false },
  ]

  return (
    <div className="min-h-screen bg-background flex">

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">PulmoCare</span>
          </div>

          {/* Tagline */}
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Start Your
            <br />
            Health Journey
          </h1>

          <p className="text-lg text-white/80 max-w-md leading-relaxed">
            Advanced lung diagnostics powered by AI — detect COPD, Pneumonia,
            and respiratory conditions early.
          </p>

        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-lg">

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-foreground">PulmoCare</span>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Create your account</h2>
            <p className="text-muted-foreground">Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {inputFields.slice(0, 4).map((field) => (
                <div key={field.name} className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{field.label}</label>
                  <div className={cn(
                    "flex items-center gap-3 rounded-xl border bg-card px-4 transition-all duration-200",
                    focused === field.name ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-muted-foreground/50"
                  )}>
                    <field.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <input
                      name={field.name}
                      type={field.type}
                      value={form[field.name as keyof typeof form]}
                      onChange={handleChange}
                      onFocus={() => setFocused(field.name)}
                      onBlur={() => setFocused(null)}
                      placeholder={field.placeholder}
                      className="flex-1 bg-transparent py-3 text-foreground placeholder:text-muted-foreground focus:outline-none min-w-0"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>

            {inputFields.slice(4).map((field) => (
              <div key={field.name} className="space-y-2">
                <label className="text-sm font-medium text-foreground">{field.label}</label>
                <div className={cn(
                  "flex items-center gap-3 rounded-xl border bg-card px-4 transition-all duration-200",
                  focused === field.name ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-muted-foreground/50"
                )}>
                  <field.icon className="h-5 w-5 text-muted-foreground" />
                  <input
                    name={field.name}
                    type={field.type}
                    value={form[field.name as keyof typeof form]}
                    onChange={handleChange}
                    onFocus={() => setFocused(field.name)}
                    onBlur={() => setFocused(null)}
                    placeholder={field.placeholder}
                    className="flex-1 bg-transparent py-3 text-foreground placeholder:text-muted-foreground focus:outline-none"
                    required
                  />
                </div>
              </div>
            ))}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-base font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
            >
              {loading ? (
                <><div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />Creating account...</>
              ) : (
                <>Create Account<ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/" className="font-medium text-primary hover:underline">
              <ArrowLeft className="inline h-4 w-4 mr-1" />
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}
