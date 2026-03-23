"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import {
  User,
  Mail,
  Edit3,
  LogOut,
  Shield,
  Activity,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface UserData {
  name?: string
  email?: string
  profile_image?: string
  created_at?: string
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Try localStorage first for instant load
        const cached = localStorage.getItem("user")
        if (cached) {
          setUserData(JSON.parse(cached))
        }

        // Then fetch fresh from backend
        const token = localStorage.getItem("token")
        const res = await fetch("http://127.0.0.1:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        const data = await res.json()
        if (data.user) {
          setUserData(data.user)
          localStorage.setItem("user", JSON.stringify(data.user))
        }
      } catch (err) {
        console.error("Error fetching profile:", err)
      }
      setLoading(false)
    }

    fetchProfile()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <div className="relative rounded-2xl bg-primary overflow-hidden mb-8">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:2rem_2rem]" />
          <div className="relative px-6 py-8 sm:px-8 sm:py-10">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                {userData?.profile_image ? (
                  <img
                    src={userData.profile_image}
                    alt="Profile"
                    className="h-24 w-24 rounded-full border-4 border-white/30 object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 border-4 border-white/30">
                    <User className="h-10 w-10 text-white" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
              </div>

              {/* Info */}
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold text-white mb-1">
                  {userData?.name || "User"}
                </h1>
                <p className="text-white/80 flex items-center justify-center sm:justify-start gap-2">
                  <Mail className="h-4 w-4" />
                  {userData?.email || "No email"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        {userData ? (
          <div className="space-y-4 mb-8">
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Account Information</h2>
              </div>
              <div className="divide-y divide-border">
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">Full Name</span>
                  </div>
                  <span className="font-medium text-foreground">{userData.name}</span>
                </div>
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">Email</span>
                  </div>
                  <span className="font-medium text-foreground">{userData.email}</span>
                </div>
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">Member Since</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {userData.created_at
                      ? new Date(userData.created_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <Activity className="h-5 w-5 text-primary mb-2" />
                <div className="text-2xl font-bold text-foreground">12</div>
                <div className="text-sm text-muted-foreground">Analyses Run</div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <Shield className="h-5 w-5 text-emerald-500 mb-2" />
                <div className="text-2xl font-bold text-foreground">Verified</div>
                <div className="text-sm text-muted-foreground">Account Status</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center mb-8">
            <p className="text-destructive">No profile data found. Please try logging in again.</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/edit-profile" className="flex-1">
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl gap-2"
            >
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="flex-1 h-12 rounded-xl gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </main>
    </div>
  )
}
