"use client"

import { useState, useEffect, type FormEvent, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle, Bell, Check, ChevronRight,
  Eye, EyeOff, LogOut, Mail, MessageCircle,
  Moon, Shield, Sun, X,
} from "lucide-react"
import { Header } from "@/components/header"
import { cn } from "@/lib/utils"

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!enabled)}
      className={cn("relative h-6 w-11 rounded-full transition-colors duration-200", enabled ? "bg-primary" : "bg-muted")}>
      <span className={cn("absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200", enabled && "translate-x-5")} />
    </button>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── PasswordInput — defined OUTSIDE SettingsPage to prevent remount on each keystroke ──
function PasswordInput({
  value, show, placeholder, required,
  onChange, onToggle,
}: {
  value: string
  show: boolean
  placeholder: string
  required?: boolean
  onChange: (v: string) => void
  onToggle: () => void
}) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      />
      <button type="button" onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

// ── FAQ Items ─────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  { q: "How accurate is the diagnosis?",       a: "PulmoCare uses a multi-modal fusion model combining X-ray, CT scan, audio and questionnaire data. Accuracy improves with more inputs. Always consult a doctor for final diagnosis." },
  { q: "Is my health data safe?",              a: "Yes. All data is encrypted and stored on secure servers. We never share your data with third parties. You can delete your data anytime from Settings." },
  { q: "What files can I upload?",             a: "X-ray and CT scan: JPG or PNG. Lung audio: WAV format recorded using a digital stethoscope. Maximum file size is 15MB." },
  { q: "Why is questionnaire compulsory?",     a: "The questionnaire provides essential patient history that significantly improves prediction accuracy. It only takes 2 minutes to complete." },
  { q: "Can I share my report with a doctor?", a: "Yes! Go to Consult Doctor page, select a past analysis, and download a PDF report or share it directly on WhatsApp with a doctor." },
  { q: "What does COPD GOLD stage mean?",      a: "GOLD staging (1-4) indicates COPD severity. GOLD 1 is mild, GOLD 4 is very severe. Based on international GOLD guidelines for COPD classification." },
  { q: "Can patient info be added to reports?",a: "Yes! On the Analyze page, fill in patient name, age and phone before starting the questionnaire. This info appears in the PDF report and history." },
  { q: "How do I book a doctor appointment?",  a: "Go to Consult Doctor page. You can call directly, book online via Practo, or share your AI report on WhatsApp with the doctor before your visit." },
]

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter()

  const [settings, setSettings] = useState({ pushNotifications: true, healthReminders: true, darkMode: false })

  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showDeleteAccount,  setShowDeleteAccount]  = useState(false)
  const [showPrivacyPolicy,  setShowPrivacyPolicy]  = useState(false)
  const [showSupport,        setShowSupport]        = useState(false)

  // Password form state
  const [currentPass,  setCurrentPass]  = useState("")
  const [newPass,      setNewPass]      = useState("")
  const [confirmPass,  setConfirmPass]  = useState("")
  const [showCurrent,  setShowCurrent]  = useState(false)
  const [showNew,      setShowNew]      = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [toast,   setToast]   = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  // Load saved settings on mount
  useEffect(() => {
    const saved = localStorage.getItem("pulmocare_settings")
    if (!saved) return
    try {
      const parsed = JSON.parse(saved) as Partial<typeof settings>
      setSettings(prev => ({ ...prev, ...parsed }))
      if (parsed.darkMode) document.documentElement.classList.add("dark")
      else document.documentElement.classList.remove("dark")
    } catch { /* ignore */ }
  }, [])

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    const updated = { ...settings, [key]: value }
    setSettings(updated)
    localStorage.setItem("pulmocare_settings", JSON.stringify(updated))
    if (key === "darkMode") {
      value ? document.documentElement.classList.add("dark") : document.documentElement.classList.remove("dark")
      setToast(value ? "Dark mode enabled" : "Light mode enabled")
    }
    if (key === "pushNotifications") setToast(value ? "Push notifications enabled" : "Push notifications disabled")
    if (key === "healthReminders")   setToast(value ? "Health reminders enabled" : "Health reminders disabled")
  }

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault()
    setPasswordMsg(null)
    if (newPass !== confirmPass) { setPasswordMsg({ type: "error", text: "New passwords do not match!" }); return }
    if (newPass.length < 6)      { setPasswordMsg({ type: "error", text: "Password must be at least 6 characters!" }); return }
    setPasswordLoading(true)
    try {
      const token = localStorage.getItem("token")
      const res   = await fetch("http://127.0.0.1:5000/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ current_password: currentPass, new_password: newPass }),
      })
      const data = await res.json()
      if (res.ok) {
        setPasswordMsg({ type: "success", text: "Password changed successfully!" })
        setCurrentPass(""); setNewPass(""); setConfirmPass("")
        setTimeout(() => { setShowChangePassword(false); setPasswordMsg(null) }, 2000)
      } else {
        setPasswordMsg({ type: "error", text: data.error || "Failed to change password" })
      }
    } catch {
      setPasswordMsg({ type: "error", text: "Something went wrong. Please try again." })
    }
    setPasswordLoading(false)
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return
    setDeleteLoading(true)
    try {
      const token = localStorage.getItem("token")
      const res   = await fetch("http://127.0.0.1:5000/api/auth/delete-account", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        localStorage.removeItem("token"); localStorage.removeItem("user")
        router.push("/")
      } else { alert("Failed to delete account. Please try again.") }
    } catch { alert("Something went wrong.") }
    setDeleteLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem("token"); localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-foreground text-background px-4 py-3 shadow-lg text-sm font-medium">
          <Check className="h-4 w-4" />{toast}
        </div>
      )}

      <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences and account settings</p>
        </div>

        <div className="space-y-6">

          {/* Notifications */}
          <section className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">Notifications</h2>
              </div>
            </div>
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-foreground">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive alerts for analysis results</p>
                </div>
                <Toggle enabled={settings.pushNotifications} onChange={v => updateSetting("pushNotifications", v)} />
              </div>
              <div className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-foreground">Health Reminders</p>
                  <p className="text-sm text-muted-foreground">Daily tips and check-up reminders</p>
                </div>
                <Toggle enabled={settings.healthReminders} onChange={v => updateSetting("healthReminders", v)} />
              </div>
            </div>
          </section>

          {/* Appearance */}
          <section className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                {settings.darkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
                <h2 className="font-semibold text-foreground">Appearance</h2>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">
                    {settings.darkMode ? "Currently using dark theme" : "Currently using light theme"}
                  </p>
                </div>
                <Toggle enabled={settings.darkMode} onChange={v => updateSetting("darkMode", v)} />
              </div>
            </div>
          </section>

          {/* Privacy, Security & Help */}
          <section className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">Privacy, Security & Help</h2>
              </div>
            </div>
            <div className="divide-y divide-border">
              <button onClick={() => setShowChangePassword(true)}
                className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-medium text-foreground">Change Password</p>
                  <p className="text-sm text-muted-foreground">Update your account password</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              <button onClick={() => setShowPrivacyPolicy(true)}
                className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-medium text-foreground">Privacy Policy</p>
                  <p className="text-sm text-muted-foreground">Read our data handling practices</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              <button onClick={() => setShowSupport(true)}
                className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-medium text-foreground">Help & Support</p>
                  <p className="text-sm text-muted-foreground">FAQ and contact support</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              <button onClick={() => setShowDeleteAccount(true)}
                className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-medium text-destructive">Delete Account</p>
                  <p className="text-sm text-muted-foreground">Permanently remove your account</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </section>

          {/* Logout */}
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 py-4 text-destructive font-medium hover:bg-destructive/10 transition-colors">
            <LogOut className="h-5 w-5" />Log Out
          </button>

        </div>
      </main>

      {/* Change Password Modal */}
      <Modal open={showChangePassword} onClose={() => { setShowChangePassword(false); setPasswordMsg(null) }} title="Change Password">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Current Password</label>
            <PasswordInput value={currentPass} show={showCurrent} placeholder="Enter current password" required
              onChange={setCurrentPass} onToggle={() => setShowCurrent(p => !p)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">New Password</label>
            <PasswordInput value={newPass} show={showNew} placeholder="Enter new password" required
              onChange={setNewPass} onToggle={() => setShowNew(p => !p)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Confirm New Password</label>
            <PasswordInput value={confirmPass} show={showConfirm} placeholder="Confirm new password" required
              onChange={setConfirmPass} onToggle={() => setShowConfirm(p => !p)} />
          </div>
          {passwordMsg && (
            <div className={cn("flex items-center gap-2 rounded-xl p-3 text-sm",
              passwordMsg.type === "success" ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-destructive/10 text-destructive")}>
              {passwordMsg.type === "success" ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              {passwordMsg.text}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowChangePassword(false); setPasswordMsg(null) }}
              className="flex-1 rounded-xl border border-border py-3 text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" disabled={passwordLoading}
              className="flex-1 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              {passwordLoading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Account Modal */}
      <Modal open={showDeleteAccount} onClose={() => { setShowDeleteAccount(false); setDeleteConfirm("") }} title="Delete Account">
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-destructive/10 border border-destructive/20 p-4">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive text-sm">This action is irreversible!</p>
              <p className="text-sm text-muted-foreground mt-1">All your data including predictions, history and account will be permanently deleted.</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Type <span className="font-bold text-destructive">DELETE</span> to confirm
            </label>
            <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE here"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive/20 focus:border-destructive" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setShowDeleteAccount(false); setDeleteConfirm("") }}
              className="flex-1 rounded-xl border border-border py-3 text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
            <button onClick={handleDeleteAccount} disabled={deleteConfirm !== "DELETE" || deleteLoading}
              className="flex-1 rounded-xl bg-destructive text-destructive-foreground py-3 text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50">
              {deleteLoading ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal open={showPrivacyPolicy} onClose={() => setShowPrivacyPolicy(false)} title="Privacy Policy">
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {[
            { title: "Data Collection",  text: "We collect only the information necessary to provide AI lung diagnostics — including questionnaire answers, uploaded medical images, and audio recordings. All data is encrypted and stored securely on MongoDB Atlas." },
            { title: "Medical Images",   text: "X-rays, CT scans, and audio recordings uploaded to PulmoCare are stored on Cloudinary with restricted access. These are used solely for AI prediction purposes and are never shared with third parties." },
            { title: "AI Predictions",   text: "All prediction results are stored in your account history. PulmoCare's AI analysis is intended as a decision support tool only and does not replace professional medical diagnosis." },
            { title: "Data Sharing",     text: "We do not sell, trade, or share your personal health data with advertisers or third parties. Data may only be shared with healthcare providers at your explicit request." },
            { title: "Your Rights",      text: "You can delete your account and all associated data at any time from Settings. Upon deletion, all personal data is permanently removed within 30 days." },
            { title: "Contact",          text: "For any privacy concerns, contact us at privacy@pulmocare.in" },
          ].map(section => (
            <div key={section.title}>
              <h4 className="font-semibold text-foreground mb-1">{section.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{section.text}</p>
            </div>
          ))}
        </div>
        <button onClick={() => setShowPrivacyPolicy(false)}
          className="w-full mt-5 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-medium hover:bg-primary/90 transition-colors">
          I Understand
        </button>
      </Modal>

      {/* Help & Support Modal */}
      <Modal open={showSupport} onClose={() => setShowSupport(false)} title="Help & Support">
        <div className="max-h-[70vh] overflow-y-auto pr-1 space-y-5">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Frequently Asked Questions</p>
            <div className="space-y-2">
              {FAQ_ITEMS.map((item, idx) => (
                <div key={idx} className="rounded-xl border border-border overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors">
                    <p className="text-sm font-medium text-foreground pr-4">{item.q}</p>
                    <ChevronRight className={cn("h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform", openFaq === idx && "rotate-90")} />
                  </button>
                  {openFaq === idx && (
                    <div className="px-4 pb-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Contact Support</p>
            <div className="space-y-2">
              <a href="mailto:support@pulmocare.in"
                className="flex items-center gap-3 rounded-xl border border-border p-4 hover:bg-muted/50 transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Email Support</p>
                  <p className="text-xs text-muted-foreground">support@pulmocare.in</p>
                </div>
              </a>
              <a href="https://wa.me/918000000000" target="_blank" rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-border p-4 hover:bg-muted/50 transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/10">
                  <MessageCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">WhatsApp Support</p>
                  <p className="text-xs text-muted-foreground">Chat with us on WhatsApp</p>
                </div>
              </a>
            </div>
          </div>
        </div>
        <button onClick={() => setShowSupport(false)}
          className="w-full mt-5 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-medium hover:bg-primary/90 transition-colors">
          Close
        </button>
      </Modal>

    </div>
  )
}