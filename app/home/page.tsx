"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import {
  Activity,
  Stethoscope,
  BookOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: Activity,
    title: "Start Analysis",
    description: "Fill questionnaire and optionally upload X-ray, CT scan or lung audio for combined AI diagnosis.",
    href: "/analyze",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Stethoscope,
    title: "Consult Doctor",
    description: "Connect with pulmonary specialists for expert consultation.",
    href: "/doctor",
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-500/10",
  },
  {
    icon: BookOpen,
    title: "Educational Resources",
    description: "Learn about lung health, COPD, and pneumonia care.",
    href: "/resources",
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-500/10",
  },
]

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0]
  index: number
}) {
  const Icon = feature.icon

  return (
    <Link href={feature.href} className="group block">
      <div
        className={cn(
          "relative h-full rounded-2xl border border-border bg-card p-6 transition-all duration-300",
          "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
          "hover:-translate-y-1"
        )}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className={cn(
          "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
          feature.bgColor
        )}>
          <Icon className={cn("h-6 w-6", feature.color)} />
        </div>

        <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {feature.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {feature.description}
        </p>

        <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span>Get started</span>
          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">

        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Sparkles className="h-4 w-4" />
            Advanced Lung Diagnostics
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4 text-balance">
            Welcome to{" "}
            <span className="text-primary">PulmoCare</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Advanced diagnostic platform for early detection and
            monitoring of COPD, Pneumonia, and other respiratory conditions.
          </p>
        </section>

        {/* Feature Grid */}
        <section className="mb-16">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Activity className="h-4 w-4" />
              </div>
              <span className="font-semibold text-foreground">PulmoCare</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date().getFullYear()} PulmoCare. Designed with care for your health.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
