import { useState, useRef } from 'react'
import { Bubble } from 'react-chartjs-2'
import { Chart as ChartJS, LinearScale, PointElement, Tooltip, Legend } from 'chart.js'
import { jsPDF } from 'jspdf'
import styles from './PrioritizerPage.module.css'

ChartJS.register(LinearScale, PointElement, Tooltip, Legend)

const FUNCTIONS = ['Pharmacovigilance', 'Affaires réglementaires', 'R&D / Discovery', 'Opérations cliniques', 'Affaires médicales', 'Assurance qualité', 'Data & IT', 'RH / Formation', 'Finance / Opérations']

const RISK_LEVELS = [
  { value: 1, label: 'Risque minimal', desc: 'Pas d\'impact direct sur la sécurité des patients ou les décisions critiques', color: '#1D9E75' },
  { value: 2, label: 'Risque limité', desc: 'Obligations de transparence uniquement (chatbots, génération de contenu)', color: '#BA7517' },
  { value: 3, label: 'Risque élevé', desc: 'Aide à la décision clinique, données patients, sécurité critique (Annexe III)', color: '#E24B4A' },
]

const SCORING_CRITERIA = {
  business_value: {
    label: 'Valeur métier', icon: '📈',
    description: 'Impact attendu sur la productivité, la qualité, les coûts ou l\'avantage concurrentiel',
    options: [
      { value: 1, label: 'Faible', desc: 'Gain d\'efficacité marginal' },
      { value: 2, label: 'Modéré', desc: 'Économies de temps ou de coûts significatives' },
      { value: 3, label: 'Élevé', desc: 'Impact opérationnel ou concurrentiel important' },
      { value: 4, label: 'Transformateur', desc: 'Différenciateur business central' },
    ]
  },
  feasibility: {
    label: 'Faisabilité technique', icon: '⚙️',
    description: 'Disponibilité des données, maturité technique, complexité d\'intégration',
    options: [
      { value: 1, label: 'Très complexe', desc: 'Données manquantes, effort d\'intégration élevé' },
      { value: 2, label: 'Complexe', desc: 'Travail technique important nécessaire' },
      { value: 3, label: 'Faisable', desc: 'Réalisable avec les capacités actuelles' },
      { value: 4, label: 'Prêt maintenant', desc: 'Données et infrastructure en place' },
    ]
  },
  org_maturity: {
    label: 'Maturité organisationnelle', icon: '🏢',
    description: 'Littératie IA des équipes, capacité de conduite du changement, soutien des sponsors',
    options: [
      { value: 1, label: 'Pas prêt', desc: 'Faible littératie, pas de sponsor, forte résistance' },
      { value: 2, label: 'Émergent', desc: 'Quelques prérequis, soutien modéré' },
      { value: 3, label: 'Prêt', desc: 'Bonne littératie, sponsor actif' },
      { value: 4, label: 'Avancé', desc: 'Haute maturité, culture d\'adoption solide' },
    ]
  },
  eu_ai_risk: {
    label: 'Risque EU AI Act', icon: '⚖️',
    description: 'Classification réglementaire selon l\'EU AI Act',
    options: RISK_LEVELS.map(r => ({ value: r.value, label: r.label, desc: r.desc }))
  }
}

const PRIORITY_MATRIX = [
  { min: 11, max: 15, label: 'Prioriser maintenant', color: '#1D9E75', bg: '#E1F5EE', action: 'Valeur élevée, haute faisabilité. Placez ce projet en tête de votre feuille de route IA. Désignez un responsable et fixez un calendrier sous 30 jours.' },
  { min: 8, max: 10, label: 'Planifier & préparer', color: '#BA7517', bg: '#FAEEDA', action: 'Fort potentiel mais nécessite une préparation. Adressez d\'abord les lacunes de maturité, puis programmez pour le prochain trimestre.' },
  { min: 5, max: 7, label: 'Surveiller', color: '#185FA5', bg: '#E6F1FB', action: 'La valeur existe mais des obstacles significatifs subsistent. À garder en vue, à réévaluer quand la faisabilité ou la maturité s\'améliore.' },
  { min: 0, max: 4, label: 'Déprioritiser', color: '#888780', bg: '#F1EFE8', action: 'Valeur faible ou trop d\'obstacles. À mettre en attente et concentrer les ressources ailleurs.' },
]

function getPriority(score) {
  return PRIORITY_MATRIX.find(p => score >= p.min && score <= p.max) || PRIORITY_MATRIX[PRIORITY_MATRIX.length - 1]
}

function getRiskLabel(val) {
  return RISK_LEVELS.find(r => r.value === val) || RISK_LEVELS[0]
}

function computeScore(uc) {
  const riskPenalty = uc.eu_ai_risk === 3 ? 2 : uc.eu_ai_risk === 2 ? 1 : 0
  return (uc.business_value || 0) + (uc.feasibility || 0) + (uc.org_maturity || 0) - riskPenalty
}

function exportPDF(useCases) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const sorted = [...useCases].sort((a, b) => computeScore(b) - computeScore(a))

  const C = {
    blue: [24, 95, 165], bluePale: [230, 241, 251],
    teal: [15, 110, 86], tealPale: [225, 245, 238],
    amber: [186, 117, 23], amberPale: [250, 238, 218],
    slate: [136, 135, 128], slatePale: [241, 239, 232],
    red: [162, 45, 45], redPale: [252, 235, 235],
    ink: [26, 26, 24], white: [255, 255, 255], bg: [250, 250, 248],
  }

  const PC = {
    'Prioriser maintenant': { t: C.teal, p: C.tealPale },
    'Planifier & préparer': { t: C.amber, p: C.amberPale },
    'Surveiller': { t: C.blue, p: C.bluePale },
    'Déprioritiser': { t: C.slate, p: C.slatePale },
  }

  const RC = { 1: { t: C.teal, p: C.tealPale, s: 'Minimal' }, 2: { t: C.amber, p: C.amberPale, s: 'Limité' }, 3: { t: C.red, p: C.redPale, s: 'Élevé' } }

  doc.setFillColor(...C.blue); doc.rect(0, 0, 210, 30, 'F')
  doc.setTextColor(...C.white)
  doc.setFontSize(7); doc.setFont('helvetica', 'normal')
  doc.text('PharmaAI Use Case Prioritizer', 14, 9)
  doc.setFontSize(20); doc.setFont('helvetica', 'bold')
  doc.text('Feuille de Route IA', 14, 22)
  doc.setFontSize(8); doc.setFont('helvetica', 'normal')
  doc.text(date, 196, 15, { align: 'right' })
  doc.text(useCases.length + ' cas d\'usage', 196, 22, { align: 'right' })

  let y = 36
  const groups = PRIORITY_MATRIX.map(p => ({ ...p, n: useCases.filter(u => getPriority(computeScore(u)).label === p.label).length }))
  groups.forEach((g, i) => {
    const pc = PC[g.label]
    const x = 14 + i * 46
    doc.setFillColor(...pc.p); doc.roundedRect(x, y, 42, 14, 2, 2, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(...pc.t)
    doc.text(String(g.n), x + 6, y + 10)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...C.slate)
    doc.text(g.label, x + 16, y + 6)
    doc.text('cas', x + 16, y + 11)
  })

  y += 20
  doc.setDrawColor(...C.blue); doc.setLineWidth(0.3); doc.line(14, y, 196, y)
  y += 5
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...C.blue)
  doc.text('Cas d\'usage priorisés', 14, y)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...C.slate)
  doc.text('Score (0-13) = Valeur + Faisabilite + Maturite, ajuste pour le risque EU AI Act', 196, y, { align: 'right' })
  y += 6

  sorted.forEach((uc, i) => {
    const score = computeScore(uc)
    const pr = getPriority(score)
    const riskN = uc.eu_ai_risk || 1
    const rc = RC[riskN] || RC[1]
    const pc = PC[pr.label]
    const hasReco = !!uc.recommendation
    const h = hasReco ? 48 : 35

    if (y + h > 277) { doc.addPage(); y = 14 }

    doc.setFillColor(...C.bg); doc.roundedRect(14, y, 182, h, 2, 2, 'F')
    doc.setDrawColor(...C.slatePale); doc.setLineWidth(0.4); doc.roundedRect(14, y, 182, h, 2, 2, 'S')
    doc.setFillColor(...pc.t); doc.rect(14, y, 3, h, 'F')

    doc.setFillColor(...pc.p); doc.roundedRect(20, y+3, 12, 12, 2, 2, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...pc.t)
    doc.text(String(i+1), 26, y+11, { align: 'center' })

    const name = uc.name.length > 50 ? uc.name.slice(0,47)+'...' : uc.name
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(...C.ink)
    doc.text(name, 36, y+10)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...C.slate)
    doc.text(uc.function || '', 36, y+16)

    doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.setTextColor(...pc.t)
    doc.text(String(score), 175, y+13, { align: 'right' })
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...C.slate)
    doc.text('/13', 182, y+13)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...pc.t)
    doc.text(pr.label.toUpperCase(), 182, y+7, { align: 'right' })

    const py = y + 22
    const pillData = [
      { l: 'Valeur', v: String(uc.business_value)+'/4', tc: C.ink, bg: C.slatePale },
      { l: 'Faisabilité', v: String(uc.feasibility)+'/4', tc: C.ink, bg: C.slatePale },
      { l: 'Maturité', v: String(uc.org_maturity)+'/4', tc: C.ink, bg: C.slatePale },
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

    if (hasReco) {
      const ry = py + 13
      doc.setFillColor(...C.bluePale); doc.roundedRect(19, ry, 172, 12, 1, 1, 'F')
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...C.blue)
      doc.text('Prochaine etape:', 22, ry+5)
      doc.setFont('helvetica', 'normal'); doc.setTextColor(...C.ink)
      const lines = doc.splitTextToSize(uc.recommendation, 145)
      doc.text(lines[0] || '', 55, ry+5)
      if (lines[1]) doc.text(lines[1], 55, ry+9)
    }
    y += h + 4
  })

  const np = doc.getNumberOfPages()
  for (let p = 1; p <= np; p++) {
    doc.setPage(p)
    doc.setFillColor(...C.slatePale); doc.rect(0, 284, 210, 13, 'F')
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...C.slate)
    doc.text('PharmaAI Use Case Prioritizer  |  pharmaai-prioritizer.vercel.app', 14, 291)
    doc.text(date + '  |  Page ' + p + ' de ' + np, 196, 291, { align: 'right' })
  }
  doc.save('PharmaAI-Feuille-de-Route.pdf')
}

const EMPTY_UC = { name: '', function: '', description: '', business_value: null, feasibility: null, org_maturity: null, eu_ai_risk: null }

export default function PrioritizerPageFR() {
  const [useCases, setUseCases] = useState([])
  const [form, setForm] = useState({ ...EMPTY_UC })
  const [step, setStep] = useState('landing')
  const [editingId, setEditingId] = useState(null)
  const [scoreStep, setScoreStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [activeView, setActiveView] = useState('matrix')

  const CRITERIA_KEYS = ['business_value', 'feasibility', 'org_maturity', 'eu_ai_risk']
  const currentCriterion = CRITERIA_KEYS[scoreStep]

  function startAdd() { setForm({ ...EMPTY_UC }); setEditingId(null); setScoreStep(0); setStep('add') }

  function submitBasic() { if (!form.name || !form.function) return; setStep('score') }

  function selectScore(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function nextCriterion() {
    if (scoreStep < CRITERIA_KEYS.length - 1) { setScoreStep(s => s + 1) } else { saveUseCase() }
  }

  async function saveUseCase() {
    const id = editingId || Date.now()
    const newUC = { ...form, id }
    const updated = editingId ? useCases.map(u => u.id === editingId ? newUC : u) : [...useCases, newUC]
    setUseCases(updated); setStep('dashboard'); fetchRecommendations(updated)
  }

  async function fetchRecommendations(ucs) {
    setLoading(true)
    const summary = ucs.map(u => {
      const score = computeScore(u)
      const priority = getPriority(score)
      const risk = getRiskLabel(u.eu_ai_risk)
      return `"${u.name}" (${u.function}): score ${score}/13, priorité ${priority.label}, EU AI Act: ${risk.label}, valeur ${u.business_value}/4, faisabilité ${u.feasibility}/4, maturité ${u.org_maturity}/4`
    }).join('\n')

    const prompt = `Tu es un expert en stratégie IA pour l'industrie pharmaceutique. Voici ${ucs.length} cas d'usage IA scorés pour priorisation:\n\n${summary}\n\nPour chaque cas d'usage, fournis une seule recommandation actionnable (1 phrase max, concrète et spécifique). Format JSON uniquement: [{"name": "...", "recommendation": "..."}, ...]. Réponds en français.`

    try {
      const res = await fetch('/api/claude', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
      })
      const data = await res.json()
      const text = data.content?.find(b => b.type === 'text')?.text || '[]'
      const recs = JSON.parse(text.replace(/```json|```/g, '').trim())
      setUseCases(prev => prev.map(u => {
        const rec = recs.find(r => r.name === u.name)
        return rec ? { ...u, recommendation: rec.recommendation } : u
      }))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  function deleteUC(id) { setUseCases(prev => prev.filter(u => u.id !== id)) }

  const sorted = [...useCases].sort((a, b) => computeScore(b) - computeScore(a))

  const bubbleData = {
    datasets: useCases.map((uc) => {
      const priority = getPriority(computeScore(uc))
      return {
        label: uc.name,
        data: [{ x: uc.feasibility || 0, y: uc.business_value || 0, r: (uc.eu_ai_risk || 1) * 6 + 4 }],
        backgroundColor: priority.color + '80', borderColor: priority.color, borderWidth: 2,
      }
    })
  }

  const bubbleOptions = {
    responsive: true, maintainAspectRatio: false,
    scales: {
      x: { min: 0, max: 4.5, title: { display: true, text: 'Faisabilité technique →', font: { size: 11 } }, ticks: { stepSize: 1 }, grid: { color: 'rgba(0,0,0,0.05)' } },
      y: { min: 0, max: 4.5, title: { display: true, text: 'Valeur métier →', font: { size: 11 } }, ticks: { stepSize: 1 }, grid: { color: 'rgba(0,0,0,0.05)' } },
    },
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => { const uc = useCases[ctx.datasetIndex]; const risk = getRiskLabel(uc.eu_ai_risk); return [`${uc.name}`, `Score: ${computeScore(uc)}/13`, `EU AI Act: ${risk.label}`] } } } }
  }

  const quadrantPlugin = {
    id: 'quadrants',
    beforeDraw(chart) {
      const { ctx, chartArea: { left, right, top, bottom, width, height } } = chart
      const midX = left + width / 2, midY = top + height / 2
      ctx.save()
      ctx.fillStyle = 'rgba(29,158,117,0.04)'; ctx.fillRect(midX, top, right - midX, midY - top)
      ctx.fillStyle = 'rgba(186,117,23,0.04)'; ctx.fillRect(left, top, midX - left, midY - top)
      ctx.fillStyle = 'rgba(136,135,128,0.04)'; ctx.fillRect(midX, midY, right - midX, bottom - midY)
      ctx.fillStyle = 'rgba(136,135,128,0.06)'; ctx.fillRect(left, midY, midX - left, bottom - midY)
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
          <a href="/" className={styles.navLangLink}>EN</a>
          {step === 'dashboard' && useCases.length > 0 && (
            <>
              <button className={styles.navBtn} onClick={startAdd}>+ Ajouter</button>
              <button className={styles.navBtnSec} onClick={() => exportPDF(useCases)} disabled={loading}>PDF</button>
            </>
          )}
        </div>
      </nav>

      <main className={styles.main}>

        {step === 'landing' && (
          <div className={styles.landingWrap}>
            <div className={styles.landingCard}>
              <div className={styles.eyebrow}><span className={styles.dot} />Pharma & Biotech · Aligné EU AI Act</div>
              <h1 className={styles.heroTitle}>Priorisez vos<br /><em>cas d'usage IA</em></h1>
              <p className={styles.heroSub}>Scorez et classez vos projets IA sur 4 dimensions — valeur métier, faisabilité technique, maturité organisationnelle et niveau de risque EU AI Act. Obtenez une feuille de route priorisée avec des recommandations générées par IA.</p>
              <div className={styles.pillars}>
                {[
                  { icon: '📈', label: 'Valeur métier', color: '#1D9E75' },
                  { icon: '⚙️', label: 'Faisabilité', color: '#185FA5' },
                  { icon: '🏢', label: 'Maturité org.', color: '#854F0B' },
                  { icon: '⚖️', label: 'Risque EU AI Act', color: '#993556' },
                ].map(p => (
                  <div key={p.label} className={styles.pillar}>
                    <span className={styles.pillarIcon}>{p.icon}</span>
                    <span className={styles.pillarLabel} style={{ color: p.color }}>{p.label}</span>
                  </div>
                ))}
              </div>
              <button className={styles.btnPrimary} onClick={() => setStep('add')}>Démarrer →</button>
            </div>
          </div>
        )}

        {step === 'add' && (
          <div className={styles.card}>
            <p className={styles.tag}>Nouveau cas d'usage — 1/2</p>
            <h2 className={styles.cardTitle}>Décrivez le cas d'usage</h2>
            <div className={styles.formStack}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Nom *</label>
                <input className={styles.formInput} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="ex. Codage MedDRA assisté par IA" />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Fonction métier *</label>
                <select className={styles.formInput} value={form.function} onChange={e => setForm(f => ({ ...f, function: e.target.value }))}>
                  <option value="">Sélectionner une fonction…</option>
                  {FUNCTIONS.map(fn => <option key={fn} value={fn}>{fn}</option>)}
                </select>
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Description courte</label>
                <textarea className={styles.formTextarea} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Que fera cette IA ? Quel problème résout-elle ?" rows={3} />
              </div>
            </div>
            <div className={styles.navRow}>
              <button className={styles.btnGhost} onClick={() => setStep(useCases.length > 0 ? 'dashboard' : 'landing')}>← Annuler</button>
              <button className={styles.btnPrimary} onClick={submitBasic} disabled={!form.name || !form.function}>Scorer ce cas d'usage →</button>
            </div>
          </div>
        )}

        {step === 'score' && (
          <div className={styles.card}>
            <p className={styles.tag}>Scoring — {scoreStep + 1}/{CRITERIA_KEYS.length}</p>
            <h2 className={styles.cardTitle}>{form.name}</h2>
            <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: `${(scoreStep / CRITERIA_KEYS.length) * 100}%` }} /></div>
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
                    <div className={styles.riskNote}>⚖️ Selon l'EU AI Act, les systèmes à risque élevé (Annexe III) nécessitent une évaluation de conformité, une documentation technique et une supervision humaine obligatoire.</div>
                  )}
                  <div className={styles.navRow}>
                    <button className={styles.btnGhost} onClick={() => scoreStep > 0 ? setScoreStep(s => s - 1) : setStep('add')}>← Retour</button>
                    <button className={styles.btnPrimary} onClick={nextCriterion} disabled={form[currentCriterion] === null}>
                      {scoreStep === CRITERIA_KEYS.length - 1 ? 'Enregistrer →' : 'Suivant →'}
                    </button>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {step === 'dashboard' && (
          <div className={styles.dashWrap}>
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
                <span className={styles.summaryLabel} style={{ color: '#888780' }}>Total cas d'usage</span>
              </div>
            </div>

            <div className={styles.viewToggle}>
              <button className={`${styles.viewBtn} ${activeView === 'matrix' ? styles.viewBtnActive : ''}`} onClick={() => setActiveView('matrix')}>Matrice de priorité</button>
              <button className={`${styles.viewBtn} ${activeView === 'list' ? styles.viewBtnActive : ''}`} onClick={() => setActiveView('list')}>Liste classée</button>
            </div>

            {activeView === 'matrix' && (
              <div className={styles.chartCard}>
                <p className={styles.chartTitle}>Matrice de priorité — Faisabilité vs Valeur métier</p>
                <p className={styles.chartSub}>Taille des bulles = niveau de risque EU AI Act · Couleur = quadrant de priorité</p>
                <div className={styles.quadrantLabels}>
                  <span style={{ color: '#BA7517' }}>Planifier & préparer</span>
                  <span style={{ color: '#1D9E75' }}>Prioriser maintenant ✓</span>
                  <span style={{ color: '#888780' }}>Déprioritiser</span>
                  <span style={{ color: '#888780' }}>Surveiller</span>
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
                          { key: 'business_value', label: 'Valeur', max: 4 },
                          { key: 'feasibility', label: 'Faisabilité', max: 4 },
                          { key: 'org_maturity', label: 'Maturité', max: 4 },
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
                          <span className={styles.ucRecoLabel}>Recommandation — </span>
                          <span className={styles.ucRecoText}>{uc.recommendation}</span>
                        </div>
                      )}
                      {loading && !uc.recommendation && (
                        <div className={styles.ucReco} style={{ borderLeftColor: '#E8E6E0' }}>
                          <span className={styles.recoLoading}>Génération de la recommandation…</span>
                        </div>
                      )}
                    </div>
                  )
                })}
                <button className={styles.addMoreBtn} onClick={startAdd}>+ Ajouter un cas d'usage</button>
              </div>
            )}

            <div className={styles.dashActions}>
              <button className={styles.btnPrimary} onClick={() => exportPDF(useCases)} disabled={loading || useCases.length === 0}>
                Télécharger la feuille de route PDF ↓
              </button>
              <button className={styles.btnGhost} onClick={startAdd}>+ Ajouter</button>
              <button className={styles.btnGhost} onClick={() => { setUseCases([]); setStep('landing') }}>Réinitialiser</button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
