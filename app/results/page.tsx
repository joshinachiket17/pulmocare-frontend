"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  AlertTriangle,
  Stethoscope,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PredictionResult {
  disease: string
  confidence: number
  copd_stage?: string
  confidence_vector?: Record<string, number>
  modalities_used?: string[]
}

const diseaseStyles = {
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
    icon: Activity,
  },
}

export default function ResultsPage() {
  const [result, setResult] = useState<PredictionResult | null>(null)
  const router = useRouter()

  useEffect(() => {
    const raw = localStorage.getItem("predictionResult")
    if (raw) {
      setResult(JSON.parse(raw))
    }
  }, [])

  if (!result) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No Results Found
            </h2>
            <p className="text-muted-foreground mb-6">
              Please complete an analysis first to view results.
            </p>
            <Button onClick={() => router.push("/home")} className="rounded-xl">
              Go to Home
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const style =
    diseaseStyles[result.disease as keyof typeof diseaseStyles] ||
    diseaseStyles.UNKNOWN_DISEASE
  const Icon = style.icon
  const confidencePct = Math.round(result.confidence * 100)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => router.push("/home")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>

        {/* Main Result Card */}
        <div className={cn("rounded-2xl border bg-card overflow-hidden mb-6", style.borderColor)}>
          <div className={cn("px-6 py-8 text-center", style.bgColor)}>
            <div
              className={cn(
                "inline-flex h-16 w-16 items-center justify-center rounded-full mb-4",
                "bg-card shadow-lg"
              )}
            >
              <Icon className={cn("h-8 w-8", style.color)} />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Detected Condition</p>
            <h1 className={cn("text-3xl font-bold", style.color)}>
              {result.disease}
            </h1>
          </div>

          <div className="px-6 py-6 space-y-6">
            {/* Confidence */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Confidence Level</span>
                <span className="text-lg font-bold text-primary">{confidencePct}%</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-1000"
                  style={{ width: `${confidencePct}%` }}
                />
              </div>
            </div>

            {/* COPD Stage */}
            {result.copd_stage && (
              <>
                <div className={cn("rounded-xl p-4", style.bgColor, "border", style.borderColor)}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={cn("h-5 w-5", style.color)} />
                    <span className="font-semibold text-foreground">
                      COPD Stage: {result.copd_stage}
                    </span>
                  </div>
                </div>

                {/* GOLD Stage Explanation Box */}
                <div className="rounded-xl p-4 border border-border bg-muted/30">
                  <h3 className="font-semibold text-foreground mb-2">
                    COPD Severity Guide (GOLD Stages)
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium text-emerald-600">GOLD 1:</span> Mild (Less Severe)
                    </p>
                    <p>
                      <span className="font-medium text-amber-600">GOLD 2:</span> Moderate (Medium Severity)
                    </p>
                    <p>
                      <span className="font-medium text-rose-600">GOLD 3:</span> Severe
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Confidence Breakdown */}
            {result.confidence_vector && (
              <div>
                <h3 className="font-semibold text-foreground mb-3">Confidence Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(result.confidence_vector).map(([disease, conf]) => {
                    const pct = Math.round(conf * 100)
                    const itemStyle =
                      diseaseStyles[disease as keyof typeof diseaseStyles] ||
                      diseaseStyles.UNKNOWN_DISEASE
                    return (
                      <div key={disease}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">{disease}</span>
                          <span className={cn("font-medium", itemStyle.color)}>
                            {pct}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              itemStyle.bgColor.replace("/10", "")
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Modalities Used */}
            {result.modalities_used && result.modalities_used.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Analysis based on:
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.modalities_used.map((m) => (
                    <span
                      key={m}
                      className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-2xl border border-border bg-muted/30 p-4 mb-6">
          <p className="text-sm text-muted-foreground text-center">
            This is a preliminary analysis. Please consult a healthcare professional
            for a detailed diagnosis and treatment plan.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={() => router.push("/home")}
            variant="outline"
            className="flex-1 h-12 rounded-xl"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <Button
            onClick={() => router.push("/doctor")}
            className="flex-1 h-12 rounded-xl"
          >
            <Stethoscope className="mr-2 h-4 w-4" />
            Consult Doctor
          </Button>
        </div>
      </main>
    </div>
  )
}