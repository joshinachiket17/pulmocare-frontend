"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Play, FileText, ExternalLink, BookOpen, Video, File, Send, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const resources = [
  {
    title: "What is COPD?",
    description: "Understanding Chronic Obstructive Pulmonary Disease — causes, symptoms and stages",
    url: "https://www.nhlbi.nih.gov/health-topics/education-and-awareness/copd-learn-more-breathe-better/copd-videos",
    type: "video",
    meta: "8 min",
  },
  {
    title: "Pneumonia Explained",
    description: "Causes, symptoms, and treatment options for pneumonia",
    url: "https://www.lung.org/lung-health-diseases/lung-disease-lookup/pneumonia",
    type: "video",
    meta: "5 min",
  },
  {
    title: "Breathing Exercises for Lung Health",
    description: "Pursed lip and belly breathing techniques for COPD patients",
    url: "https://www.lung.org/lung-health-diseases/wellness/breathing-exercises",
    type: "video",
    meta: "10 min",
  },
  {
    title: "GOLD 2024 COPD Pocket Guide",
    description: "Official GOLD guidelines — quick reference for COPD diagnosis and management",
    url: "https://goldcopd.org/wp-content/uploads/2024/02/POCKET-GUIDE-GOLD-2024-ver-1.2-11Jan2024_WMV.pdf",
    type: "pdf",
    meta: "PDF Guide",
  },
  {
    title: "COPD Nutrition Guide",
    description: "Healthy diet recommendations for COPD patients from the American Lung Association",
    url: "https://www.lung.org/lung-health-diseases/lung-disease-lookup/copd/living-with-copd/nutrition",
    type: "article",
    meta: "5 min read",
  },
  {
    title: "WHO — COPD Fact Sheet",
    description: "World Health Organization overview of COPD globally",
    url: "https://www.who.int/news-room/fact-sheets/detail/chronic-obstructive-pulmonary-disease-(copd)",
    type: "article",
    meta: "3 min read",
  },
]

const categories = [
  { label: "All", value: "all" },
  { label: "Videos", value: "video" },
  { label: "Articles", value: "article" },
  { label: "PDFs", value: "pdf" },
]

function ResourceIcon({ type }: { type: string }) {
  switch (type) {
    case "video":   return <Video className="h-5 w-5" />
    case "pdf":     return <File className="h-5 w-5" />
    default:        return <BookOpen className="h-5 w-5" />
  }
}

function ResourceBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    video:   "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    pdf:     "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    article: "bg-primary/10 text-primary",
  }
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide", styles[type] || styles.article)}>
      <ResourceIcon type={type} />
      {type}
    </span>
  )
}

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [form, setForm] = useState({ title: "", url: "", description: "" })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const filtered = activeCategory === "all"
    ? resources
    : resources.filter(r => r.type === activeCategory)

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.url) return
    setSubmitting(true)
    // Simulate submission — replace with real API call if needed
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSubmitted(true)
    setSubmitting(false)
    setForm({ title: "", url: "", description: "" })
    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">

        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Educational Resources
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn about lung health, respiratory conditions, and self-care
            strategies from trusted medical sources.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setActiveCategory(category.value)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                activeCategory === category.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              {category.label}
              <span className="ml-1.5 opacity-70">
                ({category.value === "all" ? resources.length : resources.filter(r => r.type === category.value).length})
              </span>
            </button>
          ))}
        </div>

        {/* Resource List */}
        <div className="grid gap-4 mb-12">
          {filtered.map((resource, index) => (
            <a
              key={resource.title}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-300",
                "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Icon */}
              <div className={cn(
                "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
                resource.type === "video" ? "bg-rose-500/10" : resource.type === "pdf" ? "bg-amber-500/10" : "bg-primary/10"
              )}>
                {resource.type === "video"
                  ? <Play className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  : resource.type === "pdf"
                  ? <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  : <BookOpen className="h-5 w-5 text-primary" />
                }
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {resource.title}
                  </h3>
                  <ResourceBadge type={resource.type} />
                </div>
                <p className="text-sm text-muted-foreground truncate">{resource.description}</p>
              </div>

              {/* Meta */}
              <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-sm text-muted-foreground">{resource.meta}</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          ))}
        </div>

        {/* Contribute Section */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Suggest a Resource</h3>
              <p className="text-sm text-muted-foreground">Help us expand our resource library</p>
            </div>
          </div>

          {submitted ? (
            <div className="flex items-center gap-3 rounded-xl bg-green-500/10 border border-green-500/20 p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
                <Check className="h-4 w-4" />
              </div>
              <p className="text-green-700 dark:text-green-400 font-medium">
                Thank you! Your suggestion has been submitted.
              </p>
            </div>
          ) : (
            <form onSubmit={handleContribute} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Resource Title *</label>
                  <input
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. COPD Management Guide"
                    required
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">URL *</label>
                  <input
                    value={form.url}
                    onChange={e => setForm({ ...form, url: e.target.value })}
                    placeholder="https://..."
                    type="url"
                    required
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Description</label>
                <input
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of the resource..."
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting
                  ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />Submitting...</>
                  : <><Send className="h-4 w-4" />Submit Resource</>
                }
              </button>
            </form>
          )}
        </div>

      </main>
    </div>
  )
}
