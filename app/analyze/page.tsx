"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import {
  Activity, Send, Bot, User, Upload, X,
  Mic, Scan, Layers, ArrowRight, Check,
  FileAudio, ChevronRight, UserCircle,
  Thermometer, Heart, Shield, Brain,
  AlertCircle, Info, ZoomIn, RotateCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const questions = [
  { id: 0,  text: "What is your age?", type: "number", placeholder: "e.g. 45", hint: "Enter your age in years (1–120)" },
  { id: 1,  text: "What is your gender?", type: "choice", choices: [{ label: "Male", value: 1 }, { label: "Female", value: 0 }] },
  { id: 2,  text: "What is your BMI category?", type: "choice", choices: [{ label: "Below 21", value: 0 }, { label: "21 – 25", value: 1 }, { label: "Above 25", value: 2 }] },
  { id: 3,  text: "What is your height in meters?", type: "number", placeholder: "e.g. 1.75", hint: "Enter height in meters (0.5–2.5)" },
  { id: 4,  text: "Have you ever been diagnosed with heart failure?", type: "yesno" },
  { id: 5,  text: "What is your smoking status?", type: "choice", choices: [{ label: "Never smoked", value: 0 }, { label: "Former smoker", value: 1 }, { label: "Current smoker", value: 2 }] },
  { id: 6,  text: "How many pack-years have you smoked?", type: "number", placeholder: "e.g. 10", hint: "Packs per day × years smoked. Enter 0 if non-smoker." },
  { id: 7,  text: "Have you received a respiratory disease vaccination?", type: "yesno_info", infoType: "vaccination" },
  { id: 8,  text: "Have you been diagnosed with depression?", type: "yesno_info", infoType: "depression" },
  { id: 9,  text: "Is your body temperature normal?", type: "choice_info", infoType: "temperature", choices: [{ label: "Normal", value: 0 }, { label: "High / Fever", value: 1 }] },
  { id: 10, text: "What is your respiratory rate? (breaths per minute)", type: "number", placeholder: "e.g. 18", hint: "Normal is 12–20 breaths per minute" },
  { id: 11, text: "What is your heart rate?", type: "choice_info", infoType: "heartrate", choices: [{ label: "Lower than normal", value: 0 }, { label: "Normal", value: 1 }, { label: "Higher than normal", value: 2 }] },
  { id: 12, text: "What is your oxygen saturation (SpO2)?", type: "number", placeholder: "e.g. 95", hint: "Enter as percentage. Normal is above 95% — or skip if unknown" },
  { id: 13, text: "Do you produce sputum (mucus) when coughing?", type: "choice", choices: [{ label: "None", value: 0 }, { label: "Normal amount", value: 1 }, { label: "Excessive", value: 2 }] },
]

// ── Per-question input constraints ────────────────────────────────────────────
const inputConstraints: Record<number, { min: number; max: number; step: number; integer?: boolean }> = {
  0:  { min: 1,    max: 120,  step: 1,    integer: true  }, // age
  3:  { min: 0.5,  max: 2.5,  step: 0.01                 }, // height (m)
  6:  { min: 0,    max: 300,  step: 0.1                  }, // pack-years
  10: { min: 1,    max: 60,   step: 1,    integer: true  }, // respiratory rate
  12: { min: 1,    max: 100,  step: 1,    integer: true  }, // SpO2 (%)
}

// ── Validation helpers ────────────────────────────────────────────────────────

function validateAge(value: string): string | null {
  if (!value.trim()) return "Age is required"
  const n = Number(value)
  if (!Number.isInteger(n) || isNaN(n)) return "Age must be a whole number"
  if (n < 1 || n > 120) return "Age must be between 1 and 120"
  return null
}

function validatePhone(value: string): string | null {
  if (!value.trim()) return null
  const digits = value.replace(/\D/g, "")
  if (digits.length !== 10) return "Phone must be exactly 10 digits"
  if (!/^[6-9]/.test(digits)) return "Enter a valid Indian mobile number (starts with 6–9)"
  return null
}

function validateQuestionnaireAge(value: string): string | null {
  if (!value.trim()) return "Please enter your age"
  const n = Number(value)
  if (isNaN(n) || !Number.isInteger(Number(value))) return "Age must be a whole number"
  if (n < 1 || n > 120) return "Age must be between 1 and 120"
  return null
}

function validateHeight(value: string): string | null {
  if (!value.trim()) return "Please enter your height"
  const n = parseFloat(value)
  if (isNaN(n)) return "Enter a valid number"
  if (n < 0.5 || n > 2.5) return "Height must be between 0.5 m and 2.5 m"
  return null
}

function validateRespiratoryRate(value: string): string | null {
  if (!value.trim()) return "Please enter respiratory rate"
  const n = Number(value)
  if (isNaN(n) || n < 1 || n > 60) return "Respiratory rate must be between 1 and 60 breaths/min"
  return null
}

function validatePackYears(value: string): string | null {
  if (!value.trim()) return "Enter 0 if non-smoker"
  const n = parseFloat(value)
  if (isNaN(n) || n < 0 || n > 300) return "Pack-years must be between 0 and 300"
  return null
}

function validateSpO2(value: string): string | null {
  if (!value.trim()) return null // skippable
  const n = Number(value)
  if (isNaN(n) || n < 1 || n > 100) return "SpO2 must be between 1 and 100 (%)"
  return null
}

function validateNumberQuestion(id: number, value: string): string | null {
  if (id === 0)  return validateQuestionnaireAge(value)
  if (id === 3)  return validateHeight(value)
  if (id === 6)  return validatePackYears(value)
  if (id === 10) return validateRespiratoryRate(value)
  if (id === 12) return validateSpO2(value)
  return null
}

// Clamp a value to allowed range on blur
function clampToConstraints(id: number, value: string): string {
  const c = inputConstraints[id]
  if (!c || !value.trim()) return value
  let n = parseFloat(value)
  if (isNaN(n)) return value
  n = Math.min(c.max, Math.max(c.min, n))
  if (c.integer) n = Math.round(n)
  return String(n)
}

// ── Info cards ────────────────────────────────────────────────────────────────

function VaccinationInfoCard() {
  return (
    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Respiratory Disease Vaccines</p>
      </div>
      <div className="space-y-2">
        <div className="rounded-lg bg-white dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 p-3">
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-1">PCV20 / PCV15 (Pneumococcal)</p>
          <p className="text-xs text-muted-foreground">
            Protects against <span className="font-medium text-foreground">pneumonia, meningitis</span> and bloodstream infections caused by <em>Streptococcus pneumoniae</em>.
            PCV20 covers 20 strains and is recommended once for adults 65+ or earlier for high-risk individuals.
            Reduces pneumonia hospitalisation risk by up to <span className="font-medium text-foreground">45%</span>.
          </p>
        </div>
        <div className="rounded-lg bg-white dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 p-3">
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-1">Influenza (Flu) Vaccine</p>
          <p className="text-xs text-muted-foreground">
            Annual shot that reduces flu-related <span className="font-medium text-foreground">hospitalisation risk by ~40–60%</span>.
            Especially critical for COPD and asthma patients — flu can trigger severe exacerbations and secondary bacterial pneumonia.
          </p>
        </div>
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-3">
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">Why it matters here</p>
          <p className="text-xs text-muted-foreground">
            Vaccination history is a key risk modifier. Vaccinated individuals show measurably lower rates of severe respiratory complications,
            so this helps the model calibrate your <span className="font-medium text-foreground">baseline infection risk</span>.
          </p>
        </div>
      </div>
    </div>
  )
}

function DepressionInfoCard() {
  return (
    <div className="rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
        <p className="text-sm font-semibold text-purple-800 dark:text-purple-300">Depression & Lung Health</p>
      </div>
      <div className="space-y-2">
        <div className="rounded-lg bg-white dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50 p-3">
          <p className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wide mb-1">The Clinical Link</p>
          <p className="text-xs text-muted-foreground">
            Depression is clinically linked to chronic lung diseases like <span className="font-medium text-foreground">COPD and asthma</span>.
            Studies show ~40% of COPD patients have comorbid depression, which worsens breathlessness perception
            and significantly reduces adherence to inhalers and treatment plans.
          </p>
        </div>
        <div className="rounded-lg bg-white dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50 p-3">
          <p className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wide mb-1">How it affects this analysis</p>
          <p className="text-xs text-muted-foreground">
            Depression can cause <span className="font-medium text-foreground">shallow, irregular breathing patterns</span> and reduce the motivation to seek care early.
            It is used here as a risk modifier — not as a standalone indicator of lung disease.
          </p>
        </div>
      </div>
    </div>
  )
}

function TemperatureInfoCard() {
  return (
    <div className="rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Thermometer className="h-4 w-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
        <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">Body Temperature Reference</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-white dark:bg-orange-900/20 border border-green-200 dark:border-green-800/50 p-3 text-center">
          <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wide mb-1">Normal</p>
          <p className="text-lg font-bold text-foreground">36.1 – 37.2°C</p>
          <p className="text-xs text-muted-foreground">97.0 – 99.0°F</p>
          <p className="text-xs text-muted-foreground mt-1">Typical healthy adult range</p>
        </div>
        <div className="rounded-lg bg-white dark:bg-orange-900/20 border border-red-200 dark:border-red-800/50 p-3 text-center">
          <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wide mb-1">Fever</p>
          <p className="text-lg font-bold text-foreground">≥ 38.0°C</p>
          <p className="text-xs text-muted-foreground">≥ 100.4°F</p>
          <p className="text-xs text-muted-foreground mt-1">Indicates infection / inflammation</p>
        </div>
      </div>
      <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-3">
        <p className="text-xs text-muted-foreground">
          Fever alongside cough or breathlessness strongly suggests an <span className="font-medium text-foreground">active respiratory infection</span> such as
          pneumonia, acute bronchitis, or flu. Select <em>High / Fever</em> if your temperature is — or was recently — above 38°C.
        </p>
      </div>
    </div>
  )
}

function HeartRateInfoCard() {
  return (
    <div className="rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Heart className="h-4 w-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
        <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">Heart Rate Reference (beats per minute)</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-white dark:bg-rose-900/20 border border-blue-200 dark:border-blue-800/50 p-3 text-center">
          <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">Low</p>
          <p className="text-base font-bold text-foreground">&lt; 60 bpm</p>
          <p className="text-xs text-muted-foreground mt-1">Bradycardia — may signal low oxygen delivery or medication effect</p>
        </div>
        <div className="rounded-lg bg-white dark:bg-rose-900/20 border border-green-200 dark:border-green-800/50 p-3 text-center">
          <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wide mb-1">Normal</p>
          <p className="text-base font-bold text-foreground">60 – 100 bpm</p>
          <p className="text-xs text-muted-foreground mt-1">Healthy resting range for adults</p>
        </div>
        <div className="rounded-lg bg-white dark:bg-rose-900/20 border border-red-200 dark:border-red-800/50 p-3 text-center">
          <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wide mb-1">High</p>
          <p className="text-base font-bold text-foreground">&gt; 100 bpm</p>
          <p className="text-xs text-muted-foreground mt-1">Tachycardia — common in infection, fever, or low SpO2</p>
        </div>
      </div>
      <div className="rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 p-3">
        <p className="text-xs text-muted-foreground">
          An elevated heart rate alongside respiratory symptoms often means the body is compensating for <span className="font-medium text-foreground">reduced oxygen levels</span>.
          To check manually — place two fingers on your wrist (radial pulse), count beats for 30 seconds and multiply by 2.
        </p>
      </div>
    </div>
  )
}

// ── Inline error message ──────────────────────────────────────────────────────
function FieldError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-1.5 mt-1">
      <AlertCircle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
      <p className="text-xs text-destructive">{message}</p>
    </div>
  )
}

// ── X-ray / CT upload instructions card ──────────────────────────────────────
function ScanInstructionsCard({ type }: { type: "xray" | "ct" }) {
  const isXray = type === "xray"
  return (
    <div className={cn(
      "rounded-xl border p-4 space-y-3 mt-3",
      isXray
        ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
        : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
    )}>
      <div className="flex items-center gap-2">
        <Info className={cn("h-4 w-4 flex-shrink-0", isXray ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")} />
        <p className={cn("text-sm font-semibold", isXray ? "text-emerald-800 dark:text-emerald-300" : "text-amber-800 dark:text-amber-300")}>
          How to upload a {isXray ? "Chest X-ray" : "CT Scan"}
        </p>
      </div>

      <div className="rounded-lg overflow-hidden border border-border bg-black flex items-center justify-center" style={{ height: 160 }}>
        {isXray ? (
          <svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="240" height="160" fill="#111" />
            <ellipse cx="120" cy="80" rx="70" ry="60" fill="none" stroke="#e5e7eb" strokeWidth="1.5" opacity="0.6" />
            {[40,55,70,85,100,115].map((y, i) => (
              <g key={i}>
                <path d={`M 60 ${y} Q 50 ${y+8} 55 ${y+18}`} fill="none" stroke="#d1d5db" strokeWidth="1.2" />
                <path d={`M 180 ${y} Q 190 ${y+8} 185 ${y+18}`} fill="none" stroke="#d1d5db" strokeWidth="1.2" />
              </g>
            ))}
            <rect x="116" y="20" width="8" height="120" rx="4" fill="#9ca3af" opacity="0.6" />
            <ellipse cx="90" cy="80" rx="30" ry="45" fill="#1f2937" stroke="#6b7280" strokeWidth="1" />
            <ellipse cx="150" cy="80" rx="30" ry="45" fill="#1f2937" stroke="#6b7280" strokeWidth="1" />
            <ellipse cx="110" cy="90" rx="18" ry="22" fill="#374151" opacity="0.8" />
            <text x="120" y="152" textAnchor="middle" fill="#6b7280" fontSize="9" fontFamily="sans-serif">Sample Chest X-ray — Posterior-Anterior (PA) View</text>
          </svg>
        ) : (
          <svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="240" height="160" fill="#111" />
            <ellipse cx="120" cy="80" rx="85" ry="68" fill="#1c1c1c" stroke="#4b5563" strokeWidth="1.5" />
            <ellipse cx="85" cy="75" rx="32" ry="38" fill="#0f172a" stroke="#374151" strokeWidth="1" />
            <ellipse cx="155" cy="75" rx="32" ry="38" fill="#0f172a" stroke="#374151" strokeWidth="1" />
            <ellipse cx="112" cy="85" rx="20" ry="24" fill="#292524" stroke="#57534e" strokeWidth="1" />
            <circle cx="120" cy="130" r="14" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
            <circle cx="120" cy="130" r="6" fill="#334155" />
            <circle cx="130" cy="88" r="5" fill="#1e293b" stroke="#6b7280" strokeWidth="1" />
            <circle cx="95" cy="80" r="3" fill="#374151" stroke="#6b7280" strokeWidth="0.8" />
            <circle cx="145" cy="80" r="3" fill="#374151" stroke="#6b7280" strokeWidth="0.8" />
            <text x="120" y="152" textAnchor="middle" fill="#6b7280" fontSize="9" fontFamily="sans-serif">Sample CT Scan — Axial Cross-section View</text>
          </svg>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Upload checklist</p>
        <ul className="space-y-1.5">
          {(isXray ? [
            { ok: true,  text: "Use the PA (Posterior-Anterior / front-facing) view if available — the standard upright chest X-ray" },
            { ok: true,  text: "Image must show both lungs clearly, from the apex (top) to the costophrenic angles (bottom corners)" },
            { ok: true,  text: "Accepted formats: JPG or PNG — export from your DICOM viewer if your hospital gave you a disc" },
            { ok: false, text: "Do not upload lateral (side) views or partial scans — the model is trained on PA views only" },
            { ok: false, text: "Avoid images with large watermarks, rulers, or labels covering the lung fields" },
          ] : [
            { ok: true,  text: "Upload a single representative axial (cross-section / top-down) slice — ideally at the level of the carina or mid-lung" },
            { ok: true,  text: "Accepted formats: JPG or PNG — export the image from your DICOM viewer or hospital disc" },
            { ok: true,  text: "Lung-window preset is preferred (shows lung detail, not bone or mediastinum window)" },
            { ok: false, text: "Do not upload coronal or sagittal reconstructions — axial slices only" },
            { ok: false, text: "Avoid colour-mapped or 3D-rendered CT images — greyscale axial slices only" },
          ]).map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className={cn("mt-0.5 flex-shrink-0 text-base leading-none", item.ok ? "text-green-500" : "text-red-500")}>
                {item.ok ? "✓" : "✗"}
              </span>
              <span className="text-xs text-muted-foreground">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg bg-white/60 dark:bg-white/5 border border-border p-3">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">💡 Tip: </span>
          {isXray
            ? "Most diagnostic centres provide a digital copy (CD/pen drive). Open it with any DICOM viewer (e.g. RadiAnt, MicroDicom) and export as PNG."
            : "Ask your radiologist for the \"lung window\" images in JPG/PNG format, or export the axial series from your DICOM viewer."
          }
        </p>
      </div>
    </div>
  )
}

// ── Steps ─────────────────────────────────────────────────────────────────────
const steps = [
  { id: 1, label: "Patient Info",  icon: UserCircle },
  { id: 2, label: "Questionnaire", icon: Activity },
  { id: 3, label: "Upload Files",  icon: Upload },
]

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, idx) => {
        const Icon = step.icon
        const isCompleted = currentStep > step.id
        const isActive    = currentStep === step.id
        return (
          <div key={step.id} className="flex items-center gap-2">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
              isCompleted ? "bg-primary border-primary text-primary-foreground" :
              isActive    ? "border-primary text-primary" :
                            "border-muted-foreground/30 text-muted-foreground"
            )}>
              {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
            </div>
            <span className={cn(
              "text-sm font-medium hidden sm:block",
              isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
            )}>
              {step.label}
            </span>
            {idx < steps.length - 1 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Step 1: Patient Info ──────────────────────────────────────────────────────
function PatientInfoStep({ onNext }: { onNext: (info: { name: string; age: string; phone: string }) => void }) {
  const [name,       setName]       = useState("")
  const [age,        setAge]        = useState("")
  const [phone,      setPhone]      = useState("")
  const [ageError,   setAgeError]   = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)

  const handleAgeChange = (v: string) => {
    // Strip non-digit characters immediately; cap at 3 chars
    const sanitized = v.replace(/[^0-9]/g, "").slice(0, 3)
    setAge(sanitized)
    setAgeError(validateAge(sanitized))
  }

  // Clamp to 1–120 when focus leaves
  const handleAgeBlur = () => {
    if (!age.trim()) return
    const n = parseInt(age, 10)
    const clamped = isNaN(n) ? age : String(Math.min(120, Math.max(1, n)))
    setAge(clamped)
    setAgeError(validateAge(clamped))
  }

  const handlePhoneChange = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 10)
    setPhone(digits)
    setPhoneError(validatePhone(digits))
  }

  const handleContinue = () => {
    const ae = age.trim() ? validateAge(age) : null
    const pe = validatePhone(phone)
    setAgeError(ae)
    setPhoneError(pe)
    if (ae || pe) return
    onNext({ name, age, phone })
  }

  const handleSkip = () => onNext({ name: "", age: "", phone: "" })

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4">
        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
          👤 Patient details are <span className="underline">optional</span> — they will appear on the PDF report and history.
          You can skip this step and proceed directly to the questionnaire.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Patient Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Rahul Sharma"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Age</label>
            <input
              value={age}
              onChange={e => handleAgeChange(e.target.value)}
              onBlur={handleAgeBlur}
              placeholder="e.g. 45"
              type="number"
              inputMode="numeric"
              min={1}
              max={120}
              step={1}
              className={cn(
                "w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                ageError ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
              )}
            />
            {ageError && <FieldError message={ageError} />}
            {!ageError && age && (
              <p className="text-xs text-muted-foreground">Age: {age} years</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Phone Number</label>
            <input
              value={phone}
              onChange={e => handlePhoneChange(e.target.value)}
              placeholder="e.g. 9876543210"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              className={cn(
                "w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20",
                phoneError ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
              )}
            />
            {phoneError && <FieldError message={phoneError} />}
            {!phoneError && phone.length === 10 && (
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <Check className="h-3 w-3" /> Valid mobile number
              </p>
            )}
            {!phoneError && phone.length > 0 && phone.length < 10 && (
              <p className="text-xs text-muted-foreground">{10 - phone.length} more digit{10 - phone.length !== 1 ? "s" : ""} needed</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={handleSkip} className="flex-1 h-12 rounded-xl">
          Skip
        </Button>
        <Button onClick={handleContinue} className="flex-1 h-12 rounded-xl gap-2">
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// ── Step 2: Questionnaire ─────────────────────────────────────────────────────
function QuestionnaireStep({ onComplete }: { onComplete: (answers: number[]) => void }) {
  const [messages,      setMessages]      = useState([{ from: "bot", text: questions[0].text }])
  const [input,         setInput]         = useState("")
  const [inputError,    setInputError]    = useState<string | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers,       setAnswers]       = useState<number[]>([])
  const [bmiHeightCm,   setBmiHeightCm]   = useState<string>("")
  const [bmiWeightKg,   setBmiWeightKg]   = useState<string>("")
  const chatEndRef = useRef<HTMLDivElement>(null)

  const currentQuestion = questions[questionIndex]
  const progress = (questionIndex / questions.length) * 100
  const constraints = inputConstraints[currentQuestion?.id]

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    setInputError(null)
    setInput("")
  }, [questionIndex])

  const handleBack = () => {
    if (questionIndex === 0) return
    const prevIndex = questionIndex - 1
    setMessages(prev => prev.slice(0, -2))
    setAnswers(prev => prev.slice(0, -1))
    setQuestionIndex(prevIndex)
    setInput("")
    setInputError(null)
    setBmiHeightCm("")
    setBmiWeightKg("")
  }

  const handleAnswer = (value: number, displayText?: string) => {
    const updatedAnswers = [...answers, value]
    const newMessages: any[] = [...messages, { from: "user", text: displayText || String(value) }]
    const nextIndex = questionIndex + 1

    if (nextIndex < questions.length) {
      newMessages.push({ from: "bot", text: questions[nextIndex].text })
      setMessages(newMessages)
      setAnswers(updatedAnswers)
      setQuestionIndex(nextIndex)
      setInput("")
      setInputError(null)
    } else {
      newMessages.push({ from: "bot", text: "✅ Questionnaire complete! Proceed to upload files." })
      setMessages(newMessages)
      setAnswers(updatedAnswers)
      setQuestionIndex(nextIndex)
      setInput("")
      setInputError(null)
      setTimeout(() => onComplete(updatedAnswers), 800)
    }
  }

  const handleNumberSubmit = () => {
    if (!input.trim()) {
      setInputError("Please enter a value")
      return
    }

    const error = validateNumberQuestion(currentQuestion.id, input.trim())
    if (error) {
      setInputError(error)
      return
    }

    const raw   = input.trim()
    const value = parseFloat(raw)

    if (currentQuestion.id === 12) {
      const inputAsPercentage = value > 1
      const decimalValue      = inputAsPercentage ? value / 100 : value
      const safeDecimalValue  = Math.max(0, Math.min(1, decimalValue))
      const displayText       = inputAsPercentage ? `${value}%` : `${(value * 100).toFixed(0)}%`
      setInputError(null)
      handleAnswer(safeDecimalValue, displayText)
      return
    }

    if (currentQuestion.id === 0 && !Number.isInteger(value)) {
      setInputError("Age must be a whole number")
      return
    }

    setInputError(null)
    handleAnswer(value, raw)
  }

  const handleInputChange = (v: string) => {
    setInput(v)
    if (inputError) {
      const err = validateNumberQuestion(currentQuestion.id, v)
      setInputError(err)
    }
  }

  // Auto-clamp when user leaves the field
  const handleInputBlur = () => {
    if (!input.trim()) return
    const clamped = clampToConstraints(currentQuestion.id, input)
    if (clamped !== input) {
      setInput(clamped)
      setInputError(validateNumberQuestion(currentQuestion.id, clamped))
    }
  }

  const renderInfoCard = () => {
    const infoType = (currentQuestion as any).infoType
    if (!infoType) return null
    if (infoType === "vaccination") return <VaccinationInfoCard />
    if (infoType === "depression")  return <DepressionInfoCard />
    if (infoType === "temperature") return <TemperatureInfoCard />
    if (infoType === "heartrate")   return <HeartRateInfoCard />
    return null
  }

  const YesNoButtons = () => (
    <div className="flex gap-3">
      <button onClick={() => handleAnswer(1, "Yes")} className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors">✅ Yes</button>
      <button onClick={() => handleAnswer(0, "No")}  className="flex-1 py-3 rounded-xl bg-red-500   hover:bg-red-600   text-white font-semibold transition-colors">❌ No</button>
    </div>
  )

  const ChoiceButtons = ({ choices }: { choices: { label: string; value: number }[] }) => (
    <div className="flex flex-wrap gap-2">
      {choices.map(choice => (
        <button
          key={choice.value}
          onClick={() => handleAnswer(choice.value, choice.label)}
          className="flex-1 min-w-[120px] py-3 px-4 rounded-xl border-2 border-primary text-primary font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          {choice.label}
        </button>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">Question {Math.min(questionIndex + 1, questions.length)} of {questions.length}</span>
          <span className="font-medium text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex-1 rounded-2xl border border-border bg-card overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, idx) => (
            <div key={idx} className={cn("flex gap-3", m.from === "user" ? "flex-row-reverse" : "flex-row")}>
              <div className={cn("flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                m.from === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                {m.from === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={cn("max-w-[75%] rounded-2xl px-4 py-3 text-sm",
                m.from === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm")}>
                {m.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {questionIndex < questions.length && (
          <div className="border-t border-border p-4 space-y-3">

            {questionIndex > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                Edit previous answer
              </button>
            )}

            {renderInfoCard()}

            {currentQuestion.type === "yesno" && <YesNoButtons />}
            {currentQuestion.type === "yesno_info" && <YesNoButtons />}
            {currentQuestion.type === "choice_info" && <ChoiceButtons choices={(currentQuestion as any).choices} />}

            {currentQuestion.type === "choice" && (
              currentQuestion.id === 2 ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="sm:w-64 rounded-xl border border-border bg-card p-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">BMI Calculator</p>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Height (cm)</label>
                        <input
                          value={bmiHeightCm}
                          onChange={e => {
                            const v = e.target.value
                            if (v === "" || /^\d{0,3}(\.\d{0,1})?$/.test(v)) setBmiHeightCm(v)
                          }}
                          onBlur={() => {
                            const n = parseFloat(bmiHeightCm)
                            if (!isNaN(n)) setBmiHeightCm(String(Math.min(250, Math.max(1, n))))
                          }}
                          type="number"
                          inputMode="decimal"
                          step="0.1"
                          min={1}
                          max={250}
                          placeholder="e.g. 170"
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Weight (kg)</label>
                        <input
                          value={bmiWeightKg}
                          onChange={e => {
                            const v = e.target.value
                            if (v === "" || /^\d{0,3}(\.\d{0,1})?$/.test(v)) setBmiWeightKg(v)
                          }}
                          onBlur={() => {
                            const n = parseFloat(bmiWeightKg)
                            if (!isNaN(n)) setBmiWeightKg(String(Math.min(300, Math.max(1, n))))
                          }}
                          type="number"
                          inputMode="decimal"
                          step="0.1"
                          min={1}
                          max={300}
                          placeholder="e.g. 70"
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                    {(() => {
                      const h = parseFloat(bmiHeightCm)
                      const w = parseFloat(bmiWeightKg)
                      if (!bmiHeightCm || !bmiWeightKg || Number.isNaN(h) || Number.isNaN(w) || h <= 0 || w <= 0) {
                        return <p className="text-xs text-muted-foreground mt-3">Enter height and weight to calculate.</p>
                      }
                      const heightM  = h / 100
                      const bmi      = w / (heightM * heightM)
                      const category = bmi < 21 ? { value: 0, label: "Below 21" } : bmi <= 25 ? { value: 1, label: "21 – 25" } : { value: 2, label: "Above 25" }
                      return (
                        <div className="mt-3 space-y-3">
                          <div className="rounded-xl bg-muted/30 border border-muted/60 p-3">
                            <p className="text-xs text-muted-foreground">Your BMI</p>
                            <p className="text-lg font-bold text-foreground">{bmi.toFixed(1)}</p>
                            <p className="text-sm font-medium text-primary">Category: {category.label}</p>
                          </div>
                          <button
                            onClick={() => handleAnswer(category.value, category.label)}
                            className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
                          >
                            Use BMI Category
                          </button>
                        </div>
                      )
                    })()}
                  </div>
                  <div className="flex flex-wrap gap-2 flex-1">
                    {(currentQuestion as any).choices.map((choice: any) => (
                      <button
                        key={choice.value}
                        onClick={() => handleAnswer(choice.value, choice.label)}
                        className="flex-1 min-w-[120px] py-3 px-4 rounded-xl border-2 border-primary text-primary font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {choice.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <ChoiceButtons choices={(currentQuestion as any).choices} />
              )
            )}

            {currentQuestion.type === "number" && (
              <div className="space-y-2">
                {/* Always-visible range badge */}
                {constraints && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 border border-border px-3 py-2">
                    <Info className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Allowed range:{" "}
                      <span className="font-semibold text-foreground">
                        {constraints.min}
                        {currentQuestion.id === 3 ? " m" : ""} – {constraints.max}
                        {currentQuestion.id === 12 ? "%" :
                         currentQuestion.id === 3  ? " m" :
                         currentQuestion.id === 10 ? " breaths/min" : ""}
                      </span>
                      {constraints.integer ? " · whole numbers only" : ""}
                    </p>
                  </div>
                )}

                {(currentQuestion as any).hint && (
                  <p className="text-xs text-muted-foreground px-1">💡 {(currentQuestion as any).hint}</p>
                )}

                <div className="flex gap-3">
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <input
                        value={input}
                        onChange={e => handleInputChange(e.target.value)}
                        onBlur={handleInputBlur}
                        onKeyDown={e => e.key === "Enter" && handleNumberSubmit()}
                        placeholder={(currentQuestion as any).placeholder}
                        type="number"
                        inputMode={constraints?.integer ? "numeric" : "decimal"}
                        step={constraints?.step ?? "any"}
                        min={constraints?.min}
                        max={constraints?.max}
                        className={cn(
                          "flex-1 rounded-xl border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                          inputError ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
                        )}
                      />
                      {currentQuestion.id === 12 && (
                        <span className="text-sm text-muted-foreground select-none">%</span>
                      )}
                    </div>
                    {inputError && <FieldError message={inputError} />}
                  </div>
                  <button
                    onClick={handleNumberSubmit}
                    disabled={!input.trim()}
                    className={cn("flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-all self-start",
                      input.trim() ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed")}
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
                {currentQuestion.id === 12 && (
                  <button
                    onClick={() => handleAnswer(0, "Skipped")}
                    className="w-full py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    Skip — I don&apos;t know my SpO2
                  </button>
                )}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}

// ── Step 3: Upload Files ──────────────────────────────────────────────────────
function UploadStep({
  onAnalyze, analyzing, patientName
}: {
  onAnalyze: (files: { xray: File | null, ct: File | null, audio: File | null }) => void
  analyzing: boolean
  patientName: string
}) {
  const [xray,          setXray]          = useState<File | null>(null)
  const [ct,            setCt]            = useState<File | null>(null)
  const [audio,         setAudio]         = useState<File | null>(null)
  const [showXrayGuide, setShowXrayGuide] = useState(false)
  const [showCtGuide,   setShowCtGuide]   = useState(false)
  const xrayRef  = useRef<HTMLInputElement>(null)
  const ctRef    = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLInputElement>(null)

  const ScanUploadBox = ({
    label, icon: Icon, color, bgColor, file, onFile, inputRef, hint, showGuide, onToggleGuide, guideType
  }: any) => (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", bgColor)}>
          <Icon className={cn("h-5 w-5", color)} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{label}</h3>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        <div className="flex items-center gap-2">
          {file && <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white"><Check className="h-4 w-4" /></div>}
          <button
            onClick={onToggleGuide}
            className={cn(
              "flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors border",
              showGuide
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-muted text-muted-foreground border-border hover:text-foreground"
            )}
          >
            <ZoomIn className="h-3.5 w-3.5" />
            {showGuide ? "Hide guide" : "How to upload"}
          </button>
        </div>
      </div>

      {file ? (
        <div className="flex items-center justify-between rounded-xl bg-muted p-3">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground truncate max-w-[180px]">{file.name}</span>
            <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
          <button onClick={() => onFile(null)} className="text-muted-foreground hover:text-destructive transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button onClick={() => inputRef.current?.click()}
          className="w-full rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 py-6 text-center transition-all">
          <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Click to upload <span className="text-primary font-medium">optional</span></p>
          <p className="text-xs text-muted-foreground mt-1">JPG or PNG</p>
        </button>
      )}

      {showGuide && <ScanInstructionsCard type={guideType} />}

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />
    </div>
  )

  return (
    <div className="space-y-4">
      {patientName && (
        <div className="flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-4 py-3">
          <UserCircle className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Patient: {patientName}</span>
        </div>
      )}

      <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4">
        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
          ✅ Questionnaire complete! Upload any combination of files below for better accuracy.
          All uploads are optional — you can analyze with questionnaire alone.
        </p>
      </div>

      <ScanUploadBox
        label="Chest X-ray"
        icon={Scan}
        color="text-emerald-600 dark:text-emerald-400"
        bgColor="bg-emerald-500/10"
        file={xray}
        onFile={setXray}
        inputRef={xrayRef}
        hint="Optional — JPG, PNG (PA view preferred)"
        showGuide={showXrayGuide}
        onToggleGuide={() => setShowXrayGuide(v => !v)}
        guideType="xray"
      />

      <ScanUploadBox
        label="CT Scan"
        icon={Layers}
        color="text-amber-600 dark:text-amber-400"
        bgColor="bg-amber-500/10"
        file={ct}
        onFile={setCt}
        inputRef={ctRef}
        hint="Optional — JPG, PNG (axial slice preferred)"
        showGuide={showCtGuide}
        onToggleGuide={() => setShowCtGuide(v => !v)}
        guideType="ct"
      />

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
            <Mic className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Lung Audio</h3>
            <p className="text-xs text-muted-foreground">Optional — Upload WAV file of breath sounds</p>
          </div>
          {audio && <div className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white"><Check className="h-4 w-4" /></div>}
        </div>
        {audio ? (
          <div className="flex items-center justify-between rounded-xl bg-muted p-3">
            <div className="flex items-center gap-2">
              <FileAudio className="h-4 w-4 text-cyan-600" />
              <span className="text-sm text-foreground truncate max-w-[180px]">{audio.name}</span>
              <span className="text-xs text-muted-foreground">{(audio.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <button onClick={() => setAudio(null)} className="text-muted-foreground hover:text-destructive transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button onClick={() => audioRef.current?.click()}
            className="w-full rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 py-6 text-center transition-all">
            <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Click to upload <span className="text-primary font-medium">optional</span></p>
          </button>
        )}
        <input ref={audioRef} type="file" accept="audio/*" className="hidden" onChange={e => e.target.files?.[0] && setAudio(e.target.files[0])} />
      </div>

      <Button
        onClick={() => onAnalyze({ xray, ct, audio })}
        disabled={analyzing}
        className="w-full h-14 rounded-xl text-base font-semibold gap-2 shadow-lg shadow-primary/25"
      >
        {analyzing ? (
          <><div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />Analyzing all inputs...</>
        ) : (
          <><Activity className="h-5 w-5" />Analyze All Inputs<ArrowRight className="h-5 w-5" /></>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Analysis uses questionnaire + any uploaded files for best accuracy
      </p>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AnalyzePage() {
  const [step,         setStep]         = useState(1)
  const [patientInfo,  setPatientInfo]  = useState({ name: "", age: "", phone: "" })
  const [questAnswers, setQuestAnswers] = useState<number[]>([])
  const [analyzing,    setAnalyzing]    = useState(false)
  const router = useRouter()

  const handlePatientInfo = (info: { name: string; age: string; phone: string }) => {
    setPatientInfo(info)
    setStep(2)
  }

  const handleQuestionnaireComplete = (answers: number[]) => {
    setQuestAnswers(answers)
    setStep(3)
  }

  const handleAnalyze = async ({ xray, ct, audio }: { xray: File | null, ct: File | null, audio: File | null }) => {
    setAnalyzing(true)
    try {
      const token    = localStorage.getItem("token")
      const formData = new FormData()

      formData.append("questionnaire", JSON.stringify(questAnswers))
      if (patientInfo.name)  formData.append("patient_name",  patientInfo.name)
      if (patientInfo.age)   formData.append("patient_age",   patientInfo.age)
      if (patientInfo.phone) formData.append("patient_phone", patientInfo.phone)
      if (xray)  formData.append("xray",  xray)
      if (ct)    formData.append("ct",    ct)
      if (audio) formData.append("audio", audio)

      const res  = await fetch("https://nachiket-2004-pulmocare-backend.hf.space/api/predict/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()

      if (data.disease) {
        localStorage.setItem("predictionResult", JSON.stringify(data))
        router.push("/results")
      } else {
        alert(data.error || "Analysis failed. Please try again.")
      }
    } catch {
      alert("Something went wrong. Please try again.")
    }
    setAnalyzing(false)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">AI Lung Analysis</h1>
          <p className="text-sm text-muted-foreground">Fill patient info, complete questionnaire then optionally upload scans</p>
        </div>
        <StepIndicator currentStep={step} />
        <div className="flex-1">
          {step === 1 && <PatientInfoStep onNext={handlePatientInfo} />}
          {step === 2 && <QuestionnaireStep onComplete={handleQuestionnaireComplete} />}
          {step === 3 && <UploadStep onAnalyze={handleAnalyze} analyzing={analyzing} patientName={patientInfo.name} />}
        </div>
      </main>
    </div>
  )
}
