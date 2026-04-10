import { useState, useRef } from 'react'
import { Bubble } from 'react-chartjs-2'
import { Chart as ChartJS, LinearScale, PointElement, Tooltip, Legend } from 'chart.js'
import { jsPDF } from 'jspdf'
import styles from './PrioritizerPage.module.css'

ChartJS.register(LinearScale, PointElement, Tooltip, Legend)

const FUNCTIONS = ['Pharmacovigilance', 'Regulatory Affairs', 'R&D / Discovery', 'Clinical Operations', 'Medical Affairs', 'Quality Assurance', 'Data & IT', 'HR / Training', 'Finance / Operations']

const RISK_LEVELS = [
  { value: 1, label: 'Minimal risk', desc: 'No direct impact on patient safety or critical decisions', color: '#1D9E75' },
  { value: 2, label: 'Limited risk', desc: 'Transparency obligations only (chatbots, content generation)', color: '#BA7517' },
  { value: 3, label: 'High risk', desc: 'Clinical decision support, patient data, safety-critical (Annex III)', color: '#E24B4A' },
]

const SCORING_CRITERIA = {
  business_value: {
    label: 'Business value', icon: '📈',
    description: 'Expected impact on productivity, quality, cost or competitive advantage',
    options: [
      { value: 1, label: 'Low', desc: 'Marginal efficiency gain' },
      { value: 2, label: 'Moderate', desc: 'Meaningful time or cost savings' },
      { value: 3, label: 'High', desc: 'Significant competitive or operational impact' },
      { value: 4, label: 'Transformative', desc: 'Core business differentiator' },
    ]
  },
  feasibility: {
    label: 'Technical feasibility', icon: '⚙️',
    description: 'Data availability, technical maturity, integration complexity',
    options: [
      { value: 1, label: 'Very complex', desc: 'Missing data, high integration effort' },
      { value: 2, label: 'Complex', desc: 'Significant technical work required' },
      { value: 3, label: 'Feasible', desc: 'Achievable with current capabilities' },
      { value: 4, label: 'Ready now', desc: 'Data and infrastructure in place' },
    ]
  },
  org_maturity: {
    label: 'Organisational readiness', icon: '🏢',
    description: 'Team AI literacy, change management capacity, sponsor support',
    options: [
      { value: 1, label: 'Not ready', desc: 'Low literacy, no sponsor, high resistance' },
      { value: 2, label: 'Emerging', desc: 'Some readiness, moderate support' },
      { value: 3, label: 'Ready', desc: 'Good literacy, active sponsor' },
      { value: 4, label: 'Advanced', desc: 'High maturity, strong culture of adoption' },
    ]
  },
  eu_ai_risk: {
    label: 'EU AI Act risk', icon: '⚖️',
    description: 'Regulatory classification under EU AI Act',
    options: RISK_LEVELS.map(r => ({ value: r.value, label: r.label, desc: r.desc }))
  }
}

const PRIORITY_MATRIX = [
  { min: 11, max: 15, label: 'Prioritise now', color: '#1D9E75', bg: '#E1F5EE', action: 'High value, high feasibility. Put this at the top of your AI roadmap. Define a project owner and timeline within 30 days.' },
  { min: 8, max: 10, label: 'Plan & prepare', color: '#BA7517', bg: '#FAEEDA', action: 'Strong potential but requires preparation. Address readiness gaps first, then schedule for next quarter.' },
  { min: 5, max: 7, label: 'Monitor', color: '#185FA5', bg: '#E6F1FB', action: 'Value exists but significant barriers remain. Keep on the radar, revisit when feasibility or readiness improves.' },
  { min: 0, max: 4, label: 'Deprioritise', color: '#888780', bg: '#F1EFE8', action: 'Low value or too many blockers. Park for now and focus resources elsewhere.' },
]

function getPriority(score) {
  return PRIORITY_MATRIX.find(p => score >= p.min && score <= p.max) || PRIORITY_MATRIX[PRIORITY_MATRIX.length - 1]
}

function getRiskLabel(val) {
  return RISK_LEVELS.find(r => r.value === val) || RISK_LEVELS[0]
}

function computeScore(uc) {
  // Score = business_value + feasibility + org_maturity - eu_ai_risk (higher risk = penalty)
  const riskPenalty = uc.eu_ai_risk === 3 ? 2 : uc.eu_ai_risk === 2 ? 1 : 0
  return (uc.business_value || 0) + (uc.feasibility || 0) + (uc.org_maturity || 0) - riskPenalty
}

function exportPDF(useCases) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const sorted = [...useCases].sort((a, b) => computeScore(b) - computeScore(a))

  const C = {
    blue: [24, 95, 165], bluePale: [230, 241, 251],
    teal: [15, 110, 86], tealPale: [225, 245, 238],
    amber: [186, 117, 23], amberPale: [250, 238, 218],
    slate: [95, 94, 90], slatePale: [241, 239, 232],
    red: [162, 45, 45], redPale: [252, 235, 235],
    ink: [26, 26, 24], white: [255, 255, 255],
    bg: [250, 250, 248],
  }

  const PC = {
    'Prioritise now': { t: C.teal, p: C.tealPale },
    'Plan & prepare': { t: C.amber, p: C.amberPale },
    'Monitor': { t: C.blue, p: C.bluePale },
    'Deprioritise': { t: C.slate, p: C.slatePale },
  }

  const RC = {
    1: { t: C.teal, p: C.tealPale, s: 'Minimal' },
    2: { t: C.amber, p: C.amberPale, s: 'Limited' },
    3: { t: C.red, p: C.redPale, s: 'High' },
  }

  // HEADER
  doc.setFillColor(...C.blue); doc.rect(0, 0, 210, 30, 'F')
  doc.setTextColor(...C.white)
  doc.setFontSize(7); doc.setFont('helvetica', 'normal')
  doc.text('PharmaAI Use Case Prioritizer', 14, 9)
  doc.setFontSize(20); doc.setFont('helvetica', 'bold')
  doc.text('AI Roadmap', 14, 22)
  doc.setFontSize(8); doc.setFont('helvetica', 'normal')
  doc.text(date, 196, 15, { align: 'right' })
  doc.text(useCases.length + ' use cases', 196, 22, { align: 'right' })

  // SUMMARY TILES
  let y = 36
  const groups = PRIORITY_MATRIX.map(p => ({
    ...p, n: useCases.filter(u => getPriority(computeScore(u)).label === p.label).length
  }))
  groups.forEach((g, i) => {
    const pc = PC[g.label]
    const x = 14 + i * 46
    doc.setFillColor(...pc.p); doc.roundedRect(x, y, 42, 14, 2, 2, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(...pc.t)
    doc.text(String(g.n), x + 6, y + 10)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...C.slate)
    doc.text(g.label, x + 16, y + 6)
    doc.text('cases', x + 16, y + 11)
  })

  // SECTION TITLE
  y += 20
  doc.setDrawColor(...C.blue); doc.setLineWidth(0.3)
  doc.line(14, y, 196, y)
  y += 5
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...C.blue)
  doc.text('Prioritised use cases', 14, y)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...C.slate)
  doc.text('Ranked by score (0-13) = Value + Feasibility + Readiness, adjusted for EU AI Act risk', 196, y, { align: 'right' })
  y += 6

  // CARDS
  sorted.forEach((uc, i) => {
    const score = computeScore(uc)
    const pr = getPriority(score)
    const riskN = uc.eu_ai_risk || 1
    const rc = RC[riskN] || RC[1]
    const pc = PC[pr.label]
    const hasReco = !!uc.recommendation
    const h = hasReco ? 48 : 35

    if (y + h > 277) { doc.addPage(); y = 14 }

    // Card bg
    doc.setFillColor(...C.bg); doc.roundedRect(14, y, 182, h, 2, 2, 'F')
    // Left stripe
    doc.setFillColor(...pc.t); doc.rect(14, y, 3, h, 'F')

    // Rank badge
    doc.setFillColor(...pc.p); doc.roundedRect(20, y+3, 12, 12, 2, 2, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...pc.t)
    doc.text(String(i+1), 26, y+11, { align: 'center' })

    // Name
    const name = uc.name.length > 50 ? uc.name.slice(0,47)+'...' : uc.name
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(...C.ink)
    doc.text(name, 36, y+10)

    // Function
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...C.slate)
    doc.text(uc.function || '', 36, y+16)

    // Score — right
    doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.setTextColor(...pc.t)
    doc.text(String(score), 175, y+13, { align: 'right' })
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...C.slate)
    doc.text('/13', 182, y+13)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...pc.t)
    doc.text(pr.label.toUpperCase(), 182, y+7, { align: 'right' })

    // Score pills
    const py = y + 22
    const pillData = [
      { l: 'Value', v: String(uc.business_value)+'/4', tc: C.ink, bg: C.slatePale },
      { l: 'Feasibility', v: String(uc.feasibility)+'/4', tc: C.ink, bg: C.slatePale },
      { l: 'Readiness', v: String(uc.org_maturity)+'/4', tc: C.ink, bg: C.slatePale },
      { l: 'EU AI Act', v: rc.s, tc: rc.t, bg: rc.p },
    ]
    pillData.forEach((pill, pi) => {
      const px = 19 + pi * 42
      doc.setFillColor(...pill.bg); doc.roundedRect(px, py, 38, 9, 1, 1, 'F')
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...C.slate)
      doc.text(pill.l, px+3, py+4)
      doc.setFont('helvetica', 'bold'); doc.setTextColor(...pill.tc)
      doc.text(pill.v, px+3, py+8)
    })

    // Recommendation
    if (hasReco) {
      const ry = py + 13
      doc.setFillColor(...C.bluePale); doc.roundedRect(19, ry, 172, 12, 1, 1, 'F')
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...C.blue)
      doc.text('Next step:', 22, ry+5)
      doc.setFont('helvetica', 'normal'); doc.setTextColor(...C.ink)
      const lines = doc.splitTextToSize(uc.recommendation, 145)
      doc.text(lines[0] || '', 45, ry+5)
      if (lines[1]) doc.text(lines[1], 45, ry+9)
    }

    y += h + 4
  })

  // FOOTER
  const np = doc.getNumberOfPages()
  for (let p = 1; p <= np; p++) {
    doc.setPage(p)
    doc.setFillColor(...C.slatePale); doc.rect(0, 284, 210, 13, 'F')
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...C.slate)
    doc.text('PharmaAI Use Case Prioritizer  |  pharmaai-prioritizer.vercel.app', 14, 291)
    doc.text(date + '  |  Page ' + p + ' of ' + np, 196, 291, { align: 'right' })
  }

  doc.save('PharmaAI-Roadmap.pdf')
}

const EMPTY_UC = { name: '', function: '', description: '', business_value: null, feasibility: null, org_maturity: null, eu_ai_risk: null }

export default function PrioritizerPage() {
  const [lang, setLang] = useState('en')
  const [useCases, setUseCases] = useState([])
  const [form, setForm] = useState({ ...EMPTY_UC })
  const [step, setStep] = useState('landing') // landing | add | score | dashboard
  const [editingId, setEditingId] = useState(null)
  const [scoreStep, setScoreStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [activeView, setActiveView] = useState('matrix') // matrix | list

  const CRITERIA_KEYS = ['business_value', 'feasibility', 'org_maturity', 'eu_ai_risk']
  const currentCriterion = CRITERIA_KEYS[scoreStep]

  function startAdd() {
    setForm({ ...EMPTY_UC })
    setEditingId(null)
    setScoreStep(0)
    setStep('add')
  }

  function submitBasic() {
    if (!form.name || !form.function) return
    setStep('score')
  }

  function selectScore(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function nextCriterion() {
    if (scoreStep < CRITERIA_KEYS.length - 1) {
      setScoreStep(s => s + 1)
    } else {
      saveUseCase()
    }
  }

  async function saveUseCase() {
    const id = editingId || Date.now()
    const newUC = { ...form, id }
    const updated = editingId
      ? useCases.map(u => u.id === editingId ? newUC : u)
      : [...useCases, newUC]
    setUseCases(updated)
    setStep('dashboard')
    // Fetch recommendations for all use cases
    fetchRecommendations(updated)
  }

  async function fetchRecommendations(ucs) {
    setLoading(true)
    const summary = ucs.map(u => {
      const score = computeScore(u)
      const priority = getPriority(score)
      const risk = getRiskLabel(u.eu_ai_risk)
      return `"${u.name}" (${u.function}): score ${score}/13, priority ${priority.label}, EU AI Act: ${risk.label}, value ${u.business_value}/4, feasibility ${u.feasibility}/4, readiness ${u.org_maturity}/4`
    }).join('\n')

    const prompt = `You are an AI strategy expert for the pharmaceutical industry. Here are ${ucs.length} AI use cases scored for prioritisation:\n\n${summary}\n\nFor each use case, provide a single actionable recommendation (1 sentence max, specific and concrete). Format as JSON array: [{"name": "...", "recommendation": "..."}, ...]. JSON only, no markdown.`

    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
      })
      const data = await res.json()
      const text = data.content?.find(b => b.type === 'text')?.text || '[]'
      const clean = text.replace(/```json|```/g, '').trim()
      const recs = JSON.parse(clean)
      setUseCases(prev => prev.map(u => {
        const rec = recs.find(r => r.name === u.name)
        return rec ? { ...u, recommendation: rec.recommendation } : u
      }))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function deleteUC(id) {
    setUseCases(prev => prev.filter(u => u.id !== id))
  }

  const sorted = [...useCases].sort((a, b) => computeScore(b) - computeScore(a))

  // Bubble chart data
  const bubbleData = {
    datasets: useCases.map((uc, i) => {
      const priority = getPriority(computeScore(uc))
      const risk = getRiskLabel(uc.eu_ai_risk)
      return {
        label: uc.name,
        data: [{
          x: uc.feasibility || 0,
          y: uc.business_value || 0,
          r: (uc.eu_ai_risk || 1) * 6 + 4,
        }],
        backgroundColor: priority.color + '80',
        borderColor: priority.color,
        borderWidth: 2,
      }
    })
  }

  const bubbleOptions = {
    responsive: true, maintainAspectRatio: false,
    scales: {
      x: { min: 0, max: 4.5, title: { display: true, text: 'Technical feasibility →', font: { size: 11 } }, ticks: { stepSize: 1 }, grid: { color: 'rgba(0,0,0,0.05)' } },
      y: { min: 0, max: 4.5, title: { display: true, text: 'Business value →', font: { size: 11 } }, ticks: { stepSize: 1 }, grid: { color: 'rgba(0,0,0,0.05)' } },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const uc = useCases[ctx.datasetIndex]
            const risk = getRiskLabel(uc.eu_ai_risk)
            return [`${uc.name}`, `Score: ${computeScore(uc)}/13`, `EU AI Act: ${risk.label}`]
          }
        }
      }
    }
  }

  // Quadrant backgrounds via plugin
  const quadrantPlugin = {
    id: 'quadrants',
    beforeDraw(chart) {
      const { ctx, chartArea: { left, right, top, bottom, width, height } } = chart
      const midX = left + width / 2
      const midY = top + height / 2
      ctx.save()
      ctx.fillStyle = 'rgba(29,158,117,0.04)'; ctx.fillRect(midX, top, right - midX, midY - top) // top-right: prioritise
      ctx.fillStyle = 'rgba(186,117,23,0.04)'; ctx.fillRect(left, top, midX - left, midY - top) // top-left: plan
      ctx.fillStyle = 'rgba(136,135,128,0.04)'; ctx.fillRect(midX, midY, right - midX, bottom - midY) // bottom-right: monitor
      ctx.fillStyle = 'rgba(136,135,128,0.06)'; ctx.fillRect(left, midY, midX - left, bottom - midY) // bottom-left: deprioritise
      ctx.restore()
    }
  }

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.navBrand}>
          <span className={styles.navLogo}>PharmaAI</span>
          <span className={styles.navSub}>Use Case Prioritizer</span>
        </div>
        <div className={styles.navRight}>
          <a href="/fr" className={styles.navLangLink}>FR</a>
          {step === 'dashboard' && useCases.length > 0 && (
            <>
              <button className={styles.navBtn} onClick={startAdd}>+ Add use case</button>
              <button className={styles.navBtnSec} onClick={() => exportPDF(useCases)} disabled={loading}>PDF</button>
            </>
          )}
        </div>
      </nav>

      <main className={styles.main}>

        {/* LANDING */}
        {step === 'landing' && (
          <div className={styles.landingWrap}>
            <div className={styles.landingCard}>
              <div className={styles.eyebrow}><span className={styles.dot} />Pharma & Biotech · EU AI Act aligned</div>
              <h1 className={styles.heroTitle}>Prioritise your<br /><em>AI use cases</em></h1>
              <p className={styles.heroSub}>Score and rank AI projects across 4 dimensions — business value, technical feasibility, organisational readiness, and EU AI Act risk level. Get a prioritised roadmap with AI-generated recommendations.</p>

              <div className={styles.pillars}>
                {[
                  { icon: '📈', label: 'Business value', color: '#1D9E75' },
                  { icon: '⚙️', label: 'Feasibility', color: '#185FA5' },
                  { icon: '🏢', label: 'Org. readiness', color: '#854F0B' },
                  { icon: '⚖️', label: 'EU AI Act risk', color: '#993556' },
                ].map(p => (
                  <div key={p.label} className={styles.pillar}>
                    <span className={styles.pillarIcon}>{p.icon}</span>
                    <span className={styles.pillarLabel} style={{ color: p.color }}>{p.label}</span>
                  </div>
                ))}
              </div>

              <button className={styles.btnPrimary} onClick={() => { setStep('add') }}>
                Start prioritising →
              </button>
            </div>
          </div>
        )}

        {/* ADD USE CASE — basic info */}
        {step === 'add' && (
          <div className={styles.card}>
            <p className={styles.tag}>New use case — 1/2</p>
            <h2 className={styles.cardTitle}>Describe the use case</h2>
            <div className={styles.formStack}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Name *</label>
                <input className={styles.formInput} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. AI-assisted MedDRA coding" />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Business function *</label>
                <select className={styles.formInput} value={form.function} onChange={e => setForm(f => ({ ...f, function: e.target.value }))}>
                  <option value="">Select a function…</option>
                  {FUNCTIONS.map(fn => <option key={fn} value={fn}>{fn}</option>)}
                </select>
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Brief description</label>
                <textarea className={styles.formTextarea} value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="What will this AI do? What problem does it solve?" rows={3} />
              </div>
            </div>
            <div className={styles.navRow}>
              <button className={styles.btnGhost} onClick={() => setStep(useCases.length > 0 ? 'dashboard' : 'landing')}>← Cancel</button>
              <button className={styles.btnPrimary} onClick={submitBasic} disabled={!form.name || !form.function}>
                Score this use case →
              </button>
            </div>
          </div>
        )}

        {/* SCORING */}
        {step === 'score' && (
          <div className={styles.card}>
            <p className={styles.tag}>Scoring — {scoreStep + 1}/{CRITERIA_KEYS.length}</p>
            <h2 className={styles.cardTitle}>{form.name}</h2>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${((scoreStep) / CRITERIA_KEYS.length) * 100}%` }} />
            </div>

            {(() => {
              const criterion = SCORING_CRITERIA[currentCriterion]
              return (
                <div>
                  <div className={styles.criterionHeader}>
                    <span className={styles.criterionIcon}>{criterion.icon}</span>
                    <div>
                      <p className={styles.criterionLabel}>{criterion.label}</p>
                      <p className={styles.criterionDesc}>{criterion.description}</p>
                    </div>
                  </div>
                  <div className={styles.scoreOptions}>
                    {criterion.options.map(opt => (
                      <button key={opt.value}
                        className={`${styles.scoreOpt} ${form[currentCriterion] === opt.value ? styles.scoreOptSelected : ''}`}
                        onClick={() => selectScore(currentCriterion, opt.value)}>
                        <span className={styles.scoreOptNum}>{opt.value}</span>
                        <div>
                          <p className={styles.scoreOptLabel}>{opt.label}</p>
                          <p className={styles.scoreOptDesc}>{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  {currentCriterion === 'eu_ai_risk' && (
                    <div className={styles.riskNote}>
                      ⚖️ Under EU AI Act, high-risk systems (Annex III) require conformity assessment, technical documentation and mandatory human oversight.
                    </div>
                  )}
                  <div className={styles.navRow}>
                    <button className={styles.btnGhost} onClick={() => scoreStep > 0 ? setScoreStep(s => s - 1) : setStep('add')}>← Back</button>
                    <button className={styles.btnPrimary} onClick={nextCriterion} disabled={form[currentCriterion] === null}>
                      {scoreStep === CRITERIA_KEYS.length - 1 ? 'Save use case →' : 'Next →'}
                    </button>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* DASHBOARD */}
        {step === 'dashboard' && (
          <div className={styles.dashWrap}>
            {/* Summary tiles */}
            <div className={styles.summaryGrid}>
              {PRIORITY_MATRIX.map(p => {
                const count = useCases.filter(u => getPriority(computeScore(u)).label === p.label).length
                return (
                  <div key={p.label} className={styles.summaryTile} style={{ borderColor: p.color + '60' }}>
                    <span className={styles.summaryCount} style={{ color: p.color }}>{count}</span>
                    <span className={styles.summaryLabel} style={{ color: p.color }}>{p.label}</span>
                  </div>
                )
              })}
              <div className={styles.summaryTile} style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                <span className={styles.summaryCount} style={{ color: '#1a1a18' }}>{useCases.length}</span>
                <span className={styles.summaryLabel} style={{ color: '#888780' }}>Total use cases</span>
              </div>
            </div>

            {/* View toggle */}
            <div className={styles.viewToggle}>
              <button className={`${styles.viewBtn} ${activeView === 'matrix' ? styles.viewBtnActive : ''}`} onClick={() => setActiveView('matrix')}>Priority matrix</button>
              <button className={`${styles.viewBtn} ${activeView === 'list' ? styles.viewBtnActive : ''}`} onClick={() => setActiveView('list')}>Ranked list</button>
            </div>

            {/* BUBBLE CHART */}
            {activeView === 'matrix' && (
              <div className={styles.chartCard}>
                <p className={styles.chartTitle}>Priority matrix — Feasibility vs Business value</p>
                <p className={styles.chartSub}>Bubble size = EU AI Act risk level · Colour = priority quadrant</p>
                <div className={styles.quadrantLabels}>
                  <span style={{ color: '#BA7517' }}>Plan & prepare</span>
                  <span style={{ color: '#1D9E75' }}>Prioritise now ✓</span>
                  <span style={{ color: '#888780' }}>Deprioritise</span>
                  <span style={{ color: '#888780' }}>Monitor</span>
                </div>
                <div style={{ height: 320 }}>
                  <Bubble data={bubbleData} options={bubbleOptions} plugins={[quadrantPlugin]} />
                </div>
                <div className={styles.bubbleLegend}>
                  {RISK_LEVELS.map(r => (
                    <span key={r.value} className={styles.bubbleLegendItem}>
                      <span className={styles.bubbleDot} style={{ width: r.value * 8 + 8, height: r.value * 8 + 8, background: r.color + '40', border: `2px solid ${r.color}` }} />
                      {r.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* RANKED LIST */}
            {activeView === 'list' && (
              <div className={styles.listWrap}>
                {sorted.map((uc, i) => {
                  const score = computeScore(uc)
                  const priority = getPriority(score)
                  const risk = getRiskLabel(uc.eu_ai_risk)
                  return (
                    <div key={uc.id} className={styles.ucCard}>
                      <div className={styles.ucCardHeader}>
                        <div className={styles.ucRank} style={{ background: priority.bg, color: priority.color }}>#{i + 1}</div>
                        <div className={styles.ucInfo}>
                          <p className={styles.ucName}>{uc.name}</p>
                          <p className={styles.ucFunction}>{uc.function}</p>
                        </div>
                        <div className={styles.ucScore}>
                          <span className={styles.ucScoreNum} style={{ color: priority.color }}>{score}</span>
                          <span className={styles.ucScoreDen}>/13</span>
                        </div>
                        <span className={styles.ucPriorityBadge} style={{ background: priority.bg, color: priority.color }}>{priority.label}</span>
                        <button className={styles.ucDelete} onClick={() => deleteUC(uc.id)}>✕</button>
                      </div>

                      <div className={styles.ucScoreBreakdown}>
                        {[
                          { key: 'business_value', label: 'Value', max: 4 },
                          { key: 'feasibility', label: 'Feasibility', max: 4 },
                          { key: 'org_maturity', label: 'Readiness', max: 4 },
                        ].map(s => (
                          <div key={s.key} className={styles.ucScorePill}>
                            <span className={styles.ucScorePillLabel}>{s.label}</span>
                            <span className={styles.ucScorePillVal}>{uc[s.key]}/{s.max}</span>
                          </div>
                        ))}
                        <div className={styles.ucScorePill} style={{ background: risk.color + '15' }}>
                          <span className={styles.ucScorePillLabel}>⚖️ EU AI Act</span>
                          <span className={styles.ucScorePillVal} style={{ color: risk.color }}>{risk.label}</span>
                        </div>
                      </div>

                      {uc.recommendation && (
                        <div className={styles.ucReco} style={{ borderLeftColor: priority.color }}>
                          <span className={styles.ucRecoLabel}>Recommendation — </span>
                          <span className={styles.ucRecoText}>{uc.recommendation}</span>
                        </div>
                      )}
                      {loading && !uc.recommendation && (
                        <div className={styles.ucReco} style={{ borderLeftColor: '#E8E6E0' }}>
                          <span className={styles.recoLoading}>Generating recommendation…</span>
                        </div>
                      )}
                    </div>
                  )
                })}
                <button className={styles.addMoreBtn} onClick={startAdd}>+ Add another use case</button>
              </div>
            )}

            <div className={styles.dashActions}>
              <button className={styles.btnPrimary} onClick={() => exportPDF(useCases)} disabled={loading || useCases.length === 0}>
                Download PDF roadmap ↓
              </button>
              <button className={styles.btnGhost} onClick={startAdd}>+ Add use case</button>
              <button className={styles.btnGhost} onClick={() => { setUseCases([]); setStep('landing') }}>Reset</button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
