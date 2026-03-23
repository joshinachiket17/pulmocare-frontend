"use client"

import { useState, useEffect, useRef } from "react"
import { Header } from "@/components/header"
import {
  Phone, Calendar, MapPin, Star, Clock, Stethoscope,
  FileText, MessageCircle, X, Check, Plus, Upload,
  AlertCircle, User
} from "lucide-react"
import { cn } from "@/lib/utils"

const QUEST_FIELDS = [
  { key: "age",               label: "Age",                       format: (v: number) => `${v} years` },
  { key: "gender",            label: "Gender",                    format: (v: number) => v === 1 ? "Male" : "Female" },
  { key: "bmi",               label: "BMI Category",              format: (v: number) => v === 0 ? "Below 21" : v === 1 ? "21–25" : "Above 25" },
  { key: "height",            label: "Height",                    format: (v: number) => `${v} m` },
  { key: "heart_failure",     label: "Heart Failure History",     format: (v: number) => v === 1 ? "Yes" : "No" },
  { key: "smoking_status",    label: "Smoking Status",            format: (v: number) => v === 0 ? "Never smoked" : v === 1 ? "Former smoker" : "Current smoker" },
  { key: "pack_history",      label: "Pack-Years Smoked",         format: (v: number) => v === 0 ? "None" : `${v} pack-years` },
  { key: "vaccination",       label: "Respiratory Vaccination",   format: (v: number) => v === 1 ? "Yes" : "No" },
  { key: "depression",        label: "Depression",                format: (v: number) => v === 1 ? "Yes" : "No" },
  { key: "temperature",       label: "Body Temperature",          format: (v: number) => v === 0 ? "Normal" : "High / Fever" },
  { key: "respiratory_rate",  label: "Respiratory Rate",          format: (v: number) => `${v} breaths/min` },
  { key: "heart_rate",        label: "Heart Rate",                format: (v: number) => v === 0 ? "Lower than normal" : v === 1 ? "Normal" : "Higher than normal" },
  { key: "oxygen_saturation", label: "Oxygen Saturation (SpO2)",  format: (v: number) => `${v}` },
  { key: "sputum",            label: "Sputum Production",         format: (v: number) => v === 0 ? "None" : v === 1 ? "Normal amount" : "Excessive" },
]

const DEFAULT_DOCTORS = [
  {
    _id: "default1",
    name: "Dr. Rajesh Sharma",
    specialty: "Pulmonologist & Respiratory Specialist",
    hospital: "Ruby Hall Clinic, Pune",
    address: "40, Sassoon Road, Pune - 411001",
    experience: "18 years",
    rating: 4.9,
    reviews: 312,
    phone: "+912066455100",
    phoneDisplay: "+91 20 6645 5100",
    available: "Mon - Sat, 10 AM - 6 PM",
    image: "RS",
    color: "bg-blue-500",
    bookingUrl: "https://rubyhall.com/contact-us",
    whatsapp: "918035240555",
    photo_url: null,
  },
  {
    _id: "default2",
    name: "Dr. Priya Joshi",
    specialty: "Chest Physician & COPD Specialist",
    hospital: "Jehangir Hospital (Apollo), Pune",
    address: "32, Sassoon Road, Pune - 411001",
    experience: "14 years",
    rating: 4.8,
    reviews: 248,
    phone: "+912066814444",
    phoneDisplay: "+91 20 6681 4444",
    available: "Mon - Fri, 9 AM - 5 PM",
    image: "PJ",
    color: "bg-rose-500",
    bookingUrl: "https://www.practo.com/pune/hospital/jehangir-hospital-vadgaon-peer",
    whatsapp: "918377805564",
    photo_url: null,
  },
]

async function fetchApprovedDoctors() {
  try {
    const res = await fetch("http://127.0.0.1:5000/api/doctors/")
    const data = await res.json()
    return data.doctors || []
  } catch { return [] }
}

async function fetchHistory() {
  const token = localStorage.getItem("token")
  const res = await fetch("http://127.0.0.1:5000/api/predict/history", {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  return data.predictions || []
}

async function generateAndDownloadPDF(record: any) {
  const jsPDFModule = await import("jspdf")
  const jsPDF = jsPDFModule.default || (jsPDFModule as any).jsPDF
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

  const pageW    = 210
  const margin   = 15
  const contentW = pageW - margin * 2
  let y          = 20

  const checkPage = (needed = 15) => { if (y + needed > 275) { doc.addPage(); y = 20 } }
  const drawLine  = () => { doc.setDrawColor(220,220,220); doc.line(margin,y,pageW-margin,y); y+=6 }
  const sectionTitle = (text: string) => {
    checkPage(12)
    doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(100,116,139)
    doc.text(text.toUpperCase(), margin, y); y+=7
  }

  // ── Blue Header ────────────────────────────────────────────────────────────
  doc.setFillColor(37,99,235); doc.rect(0,0,pageW,28,"F")
  doc.setFontSize(18); doc.setFont("helvetica","bold"); doc.setTextColor(255,255,255)
  doc.text("PulmoCare", margin, 12)
  doc.setFontSize(9); doc.setFont("helvetica","normal")
  doc.text("AI-Powered Lung Diagnostic Report", margin, 21)
  const dateStr = new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"})
  doc.text(`Date: ${dateStr}`, pageW-margin, 21, {align:"right"})
  y = 38

  // ── Patient Info (if available) ────────────────────────────────────────────
  if (record.patient_name || record.patient_age || record.patient_phone) {
    doc.setFillColor(239,246,255); doc.setDrawColor(191,219,254)
    doc.roundedRect(margin, y, contentW, 22, 3, 3, "FD")
    doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(100,116,139)
    doc.text("PATIENT INFORMATION", margin+5, y+7)
    doc.setFontSize(10); doc.setFont("helvetica","bold"); doc.setTextColor(15,23,42)
    const patientLine = [
      record.patient_name  && `${record.patient_name}`,
      record.patient_age   && `Age: ${record.patient_age}`,
      record.patient_phone && `Phone: ${record.patient_phone}`,
    ].filter(Boolean).join("   |   ")
    doc.text(patientLine, margin+5, y+16)
    y += 28
  }

  // ── Diagnosis Result ───────────────────────────────────────────────────────
  const disease    = record.disease || "Unknown"
  const confidence = Math.round((record.confidence || 0) * 100)
  const dColor: [number,number,number] =
    disease==="NORMAL" ? [22,163,74] : disease==="COPD" ? [217,119,6] : [220,38,38]

  doc.setFillColor(248,250,252); doc.setDrawColor(226,232,240)
  doc.roundedRect(margin, y, contentW, 35, 3, 3, "FD")
  doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(100,116,139)
  doc.text("AI DIAGNOSIS RESULT", margin+5, y+8)
  doc.setFontSize(22); doc.setFont("helvetica","bold"); doc.setTextColor(...dColor)
  doc.text(disease, margin+5, y+21)
  doc.setFontSize(11); doc.setFont("helvetica","normal"); doc.setTextColor(37,99,235)
  doc.text(`Confidence: ${confidence}%`, margin+80, y+21)
  if (record.copd_stage) {
    doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(180,83,9)
    doc.text(`COPD Stage: ${record.copd_stage}`, margin+5, y+30)
  }
  y += 42

  // ── Modalities ─────────────────────────────────────────────────────────────
  sectionTitle("Analysis Based On")
  const modalities: string[] = record.modalities_used || []
  if (modalities.length > 0) {
    doc.setFontSize(9); doc.setFont("helvetica","normal"); doc.setTextColor(37,99,235)
    doc.text(modalities.join("   |   "), margin, y); y+=8
  }
  y+=2; drawLine()

  // ── Questionnaire ──────────────────────────────────────────────────────────
  const questionnaire = record.questionnaire
  if (questionnaire) {
    sectionTitle("Patient Questionnaire Answers")
    QUEST_FIELDS.forEach((field, idx) => {
      const rawValue = questionnaire[field.key]
      if (rawValue===undefined||rawValue===null) return
      checkPage(9)
      if (idx%2===0) { doc.setFillColor(248,250,252); doc.rect(margin,y-4.5,contentW,9,"F") }
      doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(71,85,105)
      doc.text(`${field.label}:`, margin+2, y)
      doc.setFont("helvetica","normal"); doc.setTextColor(15,23,42)
      doc.text(field.format(Number(rawValue)), margin+75, y)
      y+=9
    })
    y+=4; drawLine()
  }

  // ── Confidence Breakdown ───────────────────────────────────────────────────
  sectionTitle("Confidence Breakdown")
  const cv = record.confidence_vector || {}
  const breakdown = [
    { label:"COPD",      value:cv.COPD||0,      color:[217,119,6]  as [number,number,number] },
    { label:"Normal",    value:cv.NORMAL||0,    color:[22,163,74]  as [number,number,number] },
    { label:"Pneumonia", value:cv.PNEUMONIA||0, color:[220,38,38]  as [number,number,number] },
  ]
  breakdown.forEach(item => {
    checkPage(12)
    const pct  = Math.round(Math.max(item.value,0)*100)
    const barX = margin+40; const barW = contentW-42
    const fillW = Math.max((barW*pct)/100,0)
    doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(...item.color)
    doc.text(`${item.label}:`, margin, y)
    doc.setFont("helvetica","normal"); doc.setTextColor(30,30,30)
    doc.text(`${pct}%`, barX-8, y, {align:"right"})
    doc.setFillColor(226,232,240); doc.rect(barX,y-3.5,barW,5,"F")
    if (fillW>0) { doc.setFillColor(...item.color); doc.rect(barX,y-3.5,fillW,5,"F") }
    y+=10
  })
  drawLine()

  // ── Files ──────────────────────────────────────────────────────────────────
  if (record.xray_url||record.ct_url||record.audio_url) {
    sectionTitle("Uploaded Files")
    const addFileRow = (label: string, url: string) => {
      checkPage(10)
      doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(71,85,105)
      doc.text(`${label}:`, margin, y)
      doc.setFont("helvetica","normal"); doc.setTextColor(37,99,235)
      const shortUrl = url.length>65 ? url.substring(0,65)+"..." : url
      doc.textWithLink(shortUrl, margin+32, y, {url}); y+=8
    }
    if (record.xray_url)  addFileRow("X-Ray Image", record.xray_url)
    if (record.ct_url)    addFileRow("CT Scan",     record.ct_url)
    if (record.audio_url) addFileRow("Audio File", `${record.audio_url}.wav`)
    y+=3; drawLine()
  }

  // ── Disclaimer ─────────────────────────────────────────────────────────────
  checkPage(22)
  doc.setFillColor(254,242,242); doc.setDrawColor(254,202,202)
  doc.roundedRect(margin,y,contentW,20,3,3,"FD")
  doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(127,29,29)
  doc.text("Medical Disclaimer:", margin+4, y+7)
  doc.setFont("helvetica","normal")
  const lines = doc.splitTextToSize("This report is AI-generated for clinical decision support only. NOT a substitute for professional medical diagnosis. Please consult a qualified pulmonologist.", contentW-8)
  doc.text(lines, margin+4, y+13); y+=24

  doc.setFontSize(8); doc.setFont("helvetica","normal"); doc.setTextColor(148,163,184)
  doc.text("PulmoCare AI Diagnostic Platform", pageW/2, 287, {align:"center"})

  doc.save(`PulmoCare_Report_${new Date().toISOString().slice(0,10)}.pdf`)
}

// ── Doctor Registration Form ──────────────────────────────────────────────────
function DoctorRegistrationForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name:"",specialty:"",hospital:"",address:"",phone:"",experience:"",available:"",license_number:"" })
  const [photo, setPhoto] = useState<File|null>(null)
  const [photoPreview, setPhotoPreview] = useState<string|null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const photoRef = useRef<HTMLInputElement>(null)

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onload = () => setPhotoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true); setError("")
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k,v]) => formData.append(k,v))
      if (photo) formData.append("photo", photo)
      const res  = await fetch("http://127.0.0.1:5000/api/doctors/register", { method:"POST", body:formData })
      const data = await res.json()
      if (res.ok) setSuccess(true)
      else setError(data.error||"Registration failed.")
    } catch { setError("Something went wrong.") }
    setSubmitting(false)
  }

  if (success) return (
    <div className="text-center py-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
        <Check className="h-8 w-8 text-green-600" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">Registration Submitted!</h3>
      <p className="text-sm text-muted-foreground mb-6">You will be verified and added within <strong>24-48 hours</strong>.</p>
      <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Close</button>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3">
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 border border-border">
          {photoPreview ? <img src={photoPreview} alt="preview" className="h-full w-full object-cover" /> : <Upload className="h-6 w-6 text-muted-foreground" />}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground mb-1">Profile Photo</p>
          <button type="button" onClick={() => photoRef.current?.click()} className="text-sm text-primary hover:underline">{photoPreview?"Change photo":"Upload photo"}</button>
          <p className="text-xs text-muted-foreground">JPG or PNG, max 5MB</p>
          <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { name:"name",           label:"Full Name *",           placeholder:"Dr. John Smith" },
          { name:"specialty",      label:"Specialty *",           placeholder:"Pulmonologist" },
          { name:"hospital",       label:"Hospital / Clinic *",   placeholder:"Ruby Hall Clinic, Pune" },
          { name:"address",        label:"Address",               placeholder:"40, Sassoon Road, Pune" },
          { name:"phone",          label:"Phone Number *",        placeholder:"+91 98765 43210" },
          { name:"experience",     label:"Experience *",          placeholder:"10 years" },
          { name:"available",      label:"Availability",          placeholder:"Mon-Sat, 9AM-5PM" },
          { name:"license_number", label:"Medical License No. *", placeholder:"MH-12345-2010" },
        ].map(field => (
          <div key={field.name} className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{field.label}</label>
            <input name={field.name} value={(form as any)[field.name]}
              onChange={e => setForm({...form, [e.target.name]:e.target.value})}
              placeholder={field.placeholder} required={field.label.includes("*")}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3">
        <p className="text-xs text-amber-700 dark:text-amber-400">⚠️ Your registration will be reviewed before being listed. Valid medical license number is mandatory.</p>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
        <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {submitting ? <span className="flex items-center justify-center gap-2"><div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"/>Submitting...</span> : "Submit for Verification"}
        </button>
      </div>
    </form>
  )
}

// ── Doctor Card ───────────────────────────────────────────────────────────────
function DoctorCard({ doctor, onWhatsApp }: { doctor: any, onWhatsApp: (doctor: any) => void }) {
  const initials = doctor.name.split(" ").map((n: string) => n[0]).join("").substring(0,2)
  const colors   = ["bg-blue-500","bg-rose-500","bg-emerald-500","bg-purple-500","bg-amber-500"]
  const color    = doctor.color || colors[doctor.name.length % colors.length]
  return (
    <div className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        {doctor.photo_url
          ? <img src={doctor.photo_url} alt={doctor.name} className="h-14 w-14 rounded-2xl object-cover flex-shrink-0" />
          : <div className={cn("flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-white font-bold text-lg", color)}>{doctor.image||initials}</div>
        }
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-1">
            <div>
              <h3 className="font-bold text-foreground text-lg">{doctor.name}</h3>
              <p className="text-sm text-primary font-medium">{doctor.specialty}</p>
            </div>
            {doctor.rating>0 && (
              <div className="flex items-center gap-1 text-amber-500 flex-shrink-0">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm font-semibold text-foreground">{doctor.rating}</span>
                {doctor.reviews>0 && <span className="text-xs text-muted-foreground">({doctor.reviews})</span>}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1"><MapPin className="h-4 w-4"/>{doctor.hospital}</div>
            {doctor.experience && <div className="flex items-center gap-1"><Clock className="h-4 w-4"/>{doctor.experience} experience</div>}
            {doctor.available  && <div className="flex items-center gap-1"><Calendar className="h-4 w-4"/>{doctor.available}</div>}
          </div>
          {doctor.address && <p className="text-xs text-muted-foreground mt-1">{doctor.address}</p>}
          <div className="flex flex-wrap gap-2 mt-4">
            <a href={`tel:${doctor.phone}`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              <Phone className="h-4 w-4"/>Call {doctor.phoneDisplay||doctor.phone}
            </a>
            {doctor.bookingUrl && (
              <a href={doctor.bookingUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
                <Calendar className="h-4 w-4"/>Book Appointment
              </a>
            )}
            {doctor.whatsapp && (
              <button onClick={() => onWhatsApp(doctor)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors">
                <MessageCircle className="h-4 w-4"/>WhatsApp
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DoctorPage() {
  const [doctors, setDoctors]               = useState<any[]>(DEFAULT_DOCTORS)
  const [history, setHistory]               = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [showPicker, setShowPicker]         = useState(false)
  const [generating, setGenerating]         = useState(false)
  const [showRegister, setShowRegister]     = useState(false)
  const [whatsappDoctor, setWhatsappDoctor] = useState<any>(null)

  useEffect(() => {
    fetchApprovedDoctors().then(approved => {
      if (approved.length>0) setDoctors([...DEFAULT_DOCTORS, ...approved])
    })
  }, [])

  const loadHistory = async () => {
    setLoadingHistory(true)
    try { const records = await fetchHistory(); setHistory(records) }
    catch { alert("Could not load history. Please make sure you are logged in.") }
    setLoadingHistory(false)
  }

  const handleOpenPicker = (doctor?: any) => {
    setWhatsappDoctor(doctor||null); setShowPicker(true); loadHistory()
  }

  const handleDownloadPDF = async () => {
    if (!selectedRecord) return
    setGenerating(true)
    try { await generateAndDownloadPDF(selectedRecord) }
    catch (e) { console.error(e); alert("Failed to generate PDF.") }
    setGenerating(false); setShowPicker(false); setSelectedRecord(null)
  }

  const handleWhatsApp = (doctor: any) => {
    if (!selectedRecord) return
    const confidence = Math.round((selectedRecord.confidence||0)*100)
    const patientInfo = selectedRecord.patient_name ? `Patient: ${selectedRecord.patient_name}\n` : ""
    const message =
      `Hello ${doctor.name},\n\n` +
      `${patientInfo}` +
      `PulmoCare AI Lung Analysis:\n\n` +
      `Diagnosis: ${selectedRecord.disease}\n` +
      `Confidence: ${confidence}%\n` +
      `${selectedRecord.copd_stage?`COPD Stage: ${selectedRecord.copd_stage}\n`:""}` +
      `Analysis based on: ${(selectedRecord.modalities_used||[]).join(", ")}\n` +
      `Date: ${new Date(selectedRecord.created_at).toLocaleDateString("en-IN")}\n\n` +
      `I would like to book an appointment for further evaluation.\n\n` +
      `Note: AI-generated report for clinical decision support only.`
    window.open(`https://wa.me/${doctor.whatsapp}?text=${encodeURIComponent(message)}`,"_blank")
    setShowPicker(false); setSelectedRecord(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">

        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Consult a Specialist</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Share your PulmoCare AI report with verified pulmonologists for expert diagnosis.</p>
        </div>

        <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-5 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-foreground">Download AI Report as PDF</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Select a past analysis to generate a complete PDF with patient details, questionnaire answers, diagnosis and file links.</p>
          <button onClick={() => handleOpenPicker()} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
            <FileText className="h-4 w-4"/>Select Report & Download PDF
          </button>
        </div>

        {/* History Picker Modal */}
        {showPicker && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-2xl border border-border w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h3 className="font-semibold text-foreground text-lg">Select Analysis Report</h3>
                <button onClick={() => { setShowPicker(false); setSelectedRecord(null); setWhatsappDoctor(null) }} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5"/>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingHistory ? (
                  <div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"/></div>
                ) : history.length===0 ? (
                  <p className="text-center text-muted-foreground py-8">No analysis history found.</p>
                ) : (
                  history.map((record, idx) => {
                    const disease    = record.disease || "Unknown"
                    const confidence = Math.round((record.confidence||0)*100)
                    const date       = new Date(record.created_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})
                    const isSelected = selectedRecord?._id===record._id
                    return (
                      <button key={record._id||idx} onClick={() => setSelectedRecord(record)}
                        className={cn("w-full text-left rounded-xl border p-4 transition-all",
                          isSelected?"border-primary bg-primary/5":"border-border hover:border-primary/50 hover:bg-muted/30")}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={cn("font-bold text-lg",
                              disease==="NORMAL"?"text-emerald-600":disease==="COPD"?"text-amber-600":
                              disease==="PNEUMONIA"?"text-rose-600":"text-muted-foreground")}>{disease}</span>
                            {/* ── Patient name shown here ── */}
                            {record.patient_name && (
                              <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                                <User className="h-3 w-3"/>{record.patient_name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {isSelected && <Check className="h-4 w-4 text-primary"/>}
                            <span className="text-sm font-medium text-primary">{confidence}%</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-1">
                          {(record.modalities_used||[]).map((m: string) => (
                            <span key={m} className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">{m}</span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-xs text-muted-foreground">{date}</p>
                          {record.questionnaire && <p className="text-xs text-green-600">✓ Questionnaire</p>}
                          {record.patient_age   && <p className="text-xs text-muted-foreground">Age: {record.patient_age}</p>}
                        </div>
                        {record.copd_stage && <p className="text-xs text-amber-600 font-medium mt-1">Stage: {record.copd_stage}</p>}
                      </button>
                    )
                  })
                )}
              </div>
              {selectedRecord && (
                <div className="p-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">Actions for selected report:</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={handleDownloadPDF} disabled={generating}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                      {generating ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"/>Generating...</> : <><FileText className="h-4 w-4"/>Download PDF</>}
                    </button>
                    {whatsappDoctor ? (
                      <button onClick={() => handleWhatsApp(whatsappDoctor)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors">
                        <MessageCircle className="h-4 w-4"/>Send to Dr. {whatsappDoctor.name.split(" ")[1]}
                      </button>
                    ) : (
                      doctors.filter(d => d.whatsapp).map(doctor => (
                        <button key={doctor._id} onClick={() => handleWhatsApp(doctor)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors">
                          <MessageCircle className="h-4 w-4"/>Dr. {doctor.name.split(" ")[1]}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Doctor Registration Modal */}
        {showRegister && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <div>
                  <h3 className="font-semibold text-foreground text-lg">Register as a Doctor</h3>
                  <p className="text-sm text-muted-foreground">Your profile will be verified before going live</p>
                </div>
                <button onClick={() => setShowRegister(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5"/></button>
              </div>
              <div className="p-5"><DoctorRegistrationForm onClose={() => setShowRegister(false)} /></div>
            </div>
          </div>
        )}

        {/* Doctors List */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary"/>Verified Pulmonologists
            </h2>
            <button onClick={() => setShowRegister(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary text-primary text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors">
              <Plus className="h-4 w-4"/>Register as Doctor
            </button>
          </div>
          <div className="space-y-4">
            {doctors.map(doctor => (
              <DoctorCard key={doctor._id} doctor={doctor} onWhatsApp={doc => handleOpenPicker(doc)} />
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-primary/5 border border-primary/20 p-5 text-center">
          <p className="text-foreground text-sm">
            <strong>Tip:</strong>{" "}
            <span className="text-muted-foreground">Download your AI report as PDF and share with your doctor before your appointment.</span>
          </p>
        </div>
      </main>
    </div>
  )
}