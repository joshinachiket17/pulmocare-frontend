"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { User, Phone, Calendar, ArrowLeft, Save } from "lucide-react"
import { cn } from "@/lib/utils"

export default function EditProfilePage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    phone: "",
  })
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch("https://nachiket-2004-pulmocare-backend.hf.space/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        const data = await res.json()
        if (data.user) {
          const nameParts = (data.user.name || "").split(" ")
          setForm({
            firstName: nameParts[0] || "",
            lastName: nameParts.slice(1).join(" ") || "",
            age: data.user.age || "",
            phone: data.user.phone || "",
          })
        }
      } catch (err) {
        console.error("Error fetching user:", err)
      }
    }
    fetchUser()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      await fetch("https://nachiket-2004-pulmocare-backend.hf.space/api/auth/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })
      router.push("/profile")
    } catch {
      alert("Failed to update profile")
    }

    setLoading(false)
  }

  const inputFields = [
    { name: "firstName", label: "First Name", type: "text", icon: User },
    { name: "lastName", label: "Last Name", type: "text", icon: User },
    { name: "age", label: "Age", type: "number", icon: Calendar },
    { name: "phone", label: "Phone Number", type: "tel", icon: Phone },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Edit Profile
          </h1>
          <p className="text-muted-foreground">
            Update your personal information
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-5">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
            {inputFields.map((field) => (
              <div key={field.name} className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {field.label}
                </label>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-xl border bg-background px-4 transition-all duration-200",
                    focused === field.name
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <field.icon className="h-5 w-5 text-muted-foreground" />
                  <input
                    name={field.name}
                    type={field.type}
                    value={form[field.name as keyof typeof form]}
                    onChange={handleChange}
                    onFocus={() => setFocused(field.name)}
                    onBlur={() => setFocused(null)}
                    className="flex-1 bg-transparent py-3 text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1 h-12 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-12 rounded-xl gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
