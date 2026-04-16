"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import {
  Activity, Send, Bot, User, Upload, X,
  Mic, Scan, Layers, ArrowRight, Check,
  FileAudio, ChevronRight, UserCircle,
  Thermometer, Heart, Shield, Brain
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const questions = [
  { id: 0,  text: "What is your age?", type: "number", placeholder: "e.g. 45", hint: "Enter your age in years" },
  { id: 1,  text: "What is your gender?", type: "choice", choices: [{ label: "Male", value: 1 }, { label: "Female", value: 0 }] },
  { id: 2,  text: "What is your BMI category?", type: "choice", choices: [{ label: "Below 21", value: 0 }, { label: "21 – 25", value: 1 }, { label: "Above 25", value: 2 }] },
  { id: 3,  text: "What is your height in meters?", type: "number", placeholder: "e.g. 1.75", hint: "Enter height in meters" },
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
  const [name,  setName]  = useState("")
  const [age,   setAge]   = useState("")
  const [phone, setPhone] = useState("")

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
              onChange={e => setAge(e.target.value)}
              placeholder="e.g. 45"
              type="number"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Phone Number</label>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              type="tel"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => onNext({ name: "", age: "", phone: "" })} className="flex-1 h-12 rounded-xl">
          Skip
        </Button>
        <Button onClick={() => onNext({ name, age, phone })} className="flex-1 h-12 rounded-xl gap-2">
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// ── Step 2: Questionnaire ─────────────────────────────────────────────────────
function QuestionnaireStep({ onComplete }: { onComplete: (answers: number[]) => void }) {
  const [messages,     setMessages]     = useState([{ from: "bot", text: questions[0].text }])
  const [input,        setInput]        = useState("")
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers,      setAnswers]      = useState<number[]>([])
  const [bmiHeightCm,  setBmiHeightCm]  = useState<string>("")
  const [bmiWeightKg,  setBmiWeightKg]  = useState<string>("")
  const chatEndRef = useRef<HTMLDivElement>(null)

  const currentQuestion = questions[questionIndex]
  const progress = (questionIndex / questions.length) * 100

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // ── Go back one question ──
  const handleBack = () => {
    if (questionIndex === 0) return
    const prevIndex = questionIndex - 1
    setMessages(prev => prev.slice(0, -2))
    setAnswers(prev => prev.slice(0, -1))
    setQuestionIndex(prevIndex)
    setInput("")
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
    } else {
      newMessages.push({ from: "bot", text: "✅ Questionnaire complete! Proceed to upload files." })
      setMessages(newMessages)
      setAnswers(updatedAnswers)
      setQuestionIndex(nextIndex)
      setInput("")
      setTimeout(() => onComplete(updatedAnswers), 800)
    }
  }

  const handleNumberSubmit = () => {
    if (!input.trim()) return
    const raw   = input.trim()
    const value = parseFloat(raw)
    if (isNaN(value)) { alert("Please enter a valid number"); return }

    if (currentQuestion.id === 12) {
      const inputAsPercentage = value > 1
      const decimalValue      = inputAsPercentage ? value / 100 : value
      const safeDecimalValue  = Math.max(0, Math.min(1, decimalValue))
      const displayText       = inputAsPercentage ? `${value}%` : `${(value * 100).toFixed(0)}%`
      handleAnswer(safeDecimalValue, displayText)
      return
    }

    handleAnswer(value, raw)
  }

  // ── Render the contextual info card ──
  const renderInfoCard = () => {
    const infoType = (currentQuestion as any).infoType
    if (!infoType) return null
    if (infoType === "vaccination") return <VaccinationInfoCard />
    if (infoType === "depression")  return <DepressionInfoCard />
    if (infoType === "temperature") return <TemperatureInfoCard />
    if (infoType === "heartrate")   return <HeartRateInfoCard />
    return null
  }

  // ── Shared Yes/No buttons ──
  const YesNoButtons = () => (
    <div className="flex gap-3">
      <button onClick={() => handleAnswer(1, "Yes")} className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors">✅ Yes</button>
      <button onClick={() => handleAnswer(0, "No")}  className="flex-1 py-3 rounded-xl bg-red-500   hover:bg-red-600   text-white font-semibold transition-colors">❌ No</button>
    </div>
  )

  // ── Shared choice buttons ──
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
      {/* Progress bar */}
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
        {/* Chat history */}
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

        {/* Input panel */}
        {questionIndex < questions.length && (
          <div className="border-t border-border p-4 space-y-3">

            {/* Back button */}
            {questionIndex > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                Edit previous answer
              </button>
            )}

            {/* Contextual info card */}
            {renderInfoCard()}

            {/* Answer controls */}
            {currentQuestion.type === "yesno" && <YesNoButtons />}

            {currentQuestion.type === "yesno_info" && <YesNoButtons />}

            {currentQuestion.type === "choice_info" && (
              <ChoiceButtons choices={(currentQuestion as any).choices} />
            )}

            {currentQuestion.type === "choice" && (
              currentQuestion.id === 2 ? (
                // BMI question — special layout with calculator
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="sm:w-64 rounded-xl border border-border bg-card p-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">BMI Calculator</p>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Height (cm)</label>
                        <input
                          value={bmiHeightCm}
                          onChange={e => setBmiHeightCm(e.target.value)}
                          type="number" step="0.1" min="1" placeholder="e.g. 170"
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Weight (kg)</label>
                        <input
                          value={bmiWeightKg}
                          onChange={e => setBmiWeightKg(e.target.value)}
                          type="number" step="0.1" min="1" placeholder="e.g. 70"
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
                {(currentQuestion as any).hint && (
                  <p className="text-xs text-muted-foreground px-1">💡 {(currentQuestion as any).hint}</p>
                )}
                <div className="flex gap-3">
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleNumberSubmit()}
                      placeholder={(currentQuestion as any).placeholder}
                      type="number"
                      step="any"
                      className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    {currentQuestion.id === 12 && (
                      <span className="text-sm text-muted-foreground select-none">%</span>
                    )}
                  </div>
                  <button
                    onClick={handleNumberSubmit}
                    disabled={!input.trim()}
                    className={cn("flex h-12 w-12 items-center justify-center rounded-xl transition-all",
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
  const [xray,  setXray]  = useState<File | null>(null)
  const [ct,    setCt]    = useState<File | null>(null)
  const [audio, setAudio] = useState<File | null>(null)
  const xrayRef  = useRef<HTMLInputElement>(null)
  const ctRef    = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLInputElement>(null)

  const FileUploadBox = ({ label, icon: Icon, color, bgColor, file, onFile, inputRef, accept, hint }: any) => (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", bgColor)}>
          <Icon className={cn("h-5 w-5", color)} />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{label}</h3>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        {file && <div className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white"><Check className="h-4 w-4" /></div>}
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
        </button>
      )}
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />
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

      <FileUploadBox
        label="Chest X-ray" icon={Scan}
        color="text-emerald-600 dark:text-emerald-400" bgColor="bg-emerald-500/10"
        file={xray} onFile={setXray} inputRef={xrayRef} accept="image/*" hint="Optional — JPG, PNG"
      />
      <FileUploadBox
        label="CT Scan" icon={Layers}
        color="text-amber-600 dark:text-amber-400" bgColor="bg-amber-500/10"
        file={ct} onFile={setCt} inputRef={ctRef} accept="image/*" hint="Optional — JPG, PNG"
      />

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
            <Mic className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Lung Audio</h3>
            <p className="text-xs text-muted-foreground">Optional — Upload WAV file</p>
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
