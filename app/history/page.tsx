"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Activity, AlertTriangle, AlertCircle, CheckCircle2, Calendar, Clock, HelpCircle, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface PredictionRecord {
  _id?: string
  id?: string
  created_at: string
  disease: string
  confidence: number
  copd_stage?: string
  modalities_used?: string[]
  questionnaire?: Record<string, number>
  xray_url?: string
  ct_url?: string
  audio_url?: string
  patient_name?: string
  patient_age?: string
  patient_phone?: string
}

const diseaseStyles: Record<string, any> = {
  COPD: {
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    icon: AlertTriangle,
  },
  PNEUMONIA: {
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
    icon: AlertCircle,
  },
  NORMAL: {
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    icon: CheckCircle2,
  },
  UNKNOWN_DISEASE: {
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    borderColor: "border-border",
    icon: HelpCircle,
  },
}

export default function HistoryPage() {
  const [records, setRecords] = useState<PredictionRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch("http://127.0.0.1:5000/api/predict/history", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (data.predictions) setRecords(data.predictions)
      } catch (err) {
        console.error("Error fetching history:", err)
      }
      setLoading(false)
    }
    fetchHistory()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Analysis History</h1>
          <p className="text-muted-foreground">View your past diagnostic analyses and results</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : records.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">No Analyses Yet</h2>
            <p className="text-muted-foreground">Your diagnostic history will appear here once you complete an analysis.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record, index) => {
              const disease    = record.disease || "UNKNOWN_DISEASE"
              const style      = diseaseStyles[disease] || diseaseStyles["UNKNOWN_DISEASE"]
              const Icon       = style.icon
              const confidence = Math.round((record.confidence || 0) * 100)
              const date       = new Date(record.created_at)

              return (
                <div key={record._id || record.id || index}
                  className={cn("rounded-2xl border bg-card p-5 transition-all duration-200 hover:shadow-md", style.borderColor)}>
                  <div className="flex items-start gap-4">
                    <div className={cn("flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl", style.bgColor)}>
                      <Icon className={cn("h-6 w-6", style.color)} />
                    </div>
                    <div className="flex-1 min-w-0">

                      {/* Disease + Confidence */}
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <h3 className={cn("text-xl font-bold", style.color)}>{disease}</h3>
                        <span className="text-lg font-semibold text-primary">{confidence}%</span>
                      </div>

                      {/* Patient Info — shown if available */}
                      {record.patient_name && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
                            <User className="h-3 w-3" />
                            {record.patient_name}
                            {record.patient_age && <span className="text-primary/70">• Age {record.patient_age}</span>}
                            {record.patient_phone && <span className="text-primary/70">• {record.patient_phone}</span>}
                          </div>
                        </div>
                      )}

                      {/* COPD Stage */}
                      {record.copd_stage && (
                        <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mb-2", style.bgColor, style.color)}>
                          Stage: {record.copd_stage}
                        </span>
                      )}

                      {/* Modalities */}
                      {record.modalities_used && record.modalities_used.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {record.modalities_used.map(m => (
                            <span key={m} className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
                              {m}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* File Links */}
                      {(record.xray_url || record.ct_url || record.audio_url) && (
                        <div className="flex gap-3 mb-2">
                          {record.xray_url && (
                            <a href={record.xray_url} target="_blank" rel="noreferrer"
                              className="text-xs text-primary underline">View X-ray</a>
                          )}
                          {record.ct_url && (
                            <a href={record.ct_url} target="_blank" rel="noreferrer"
                              className="text-xs text-primary underline">View CT Scan</a>
                          )}
                          {record.audio_url && (
                            <a href={`${record.audio_url}.wav`} target="_blank" rel="noreferrer"
                              className="text-xs text-primary underline">Listen to Audio</a>
                          )}
                        </div>
                      )}

                      {/* Date & Time */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Stats */}
        {records.length > 0 && (
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border bg-card p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{records.length}</div>
              <div className="text-sm text-muted-foreground">Total Analyses</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {records.filter(r => r.disease === "NORMAL").length}
              </div>
              <div className="text-sm text-muted-foreground">Normal Results</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">
                {records.filter(r => r.disease === "COPD" || r.disease === "PNEUMONIA").length}
              </div>
              <div className="text-sm text-muted-foreground">Conditions Found</div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}