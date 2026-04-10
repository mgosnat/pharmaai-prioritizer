import { useState } from 'react'
import { jsPDF } from 'jspdf'
import styles from './GovernancePage.module.css'

const DATA = {
  en: {
    orgTypes: ['Pharmaceutical (large group)', 'Biotech / Mid-size pharma', 'CRO / CMO', 'MedTech', 'Hospital / Academic centre'],
    orgSizes: ['< 50 employees', '50-200', '200-1,000', '1,000-5,000', '> 5,000'],
    aiSystems: [
      'Pharmacovigilance (signal detection, ICSR processing)',
      'Clinical trial management (recruitment, monitoring)',
      'Drug discovery / R&D (ADMET, de novo design)',
      'Regulatory affairs (document drafting, submissions)',
      'Medical affairs / MSL support',
      'Quality assurance (deviation detection, audit support)',
      'Medical writing / content generation',
      'HR / Training (AI literacy, onboarding)',
      'Finance / Operations',
      'Customer-facing / Patient interaction',
    ],
    dimensions: [
      { id: 'policy', label: 'AI Usage Policy', icon: '📋', color: '#185FA5', bg: '#E6F1FB' },
      { id: 'risk', label: 'Risk Classification', icon: '⚖️', color: '#854F0B', bg: '#FAEEDA' },
      { id: 'data', label: 'Data Governance', icon: '🗄️', color: '#533AB7', bg: '#EEEDFE' },
      { id: 'oversight', label: 'Human Oversight', icon: '👁️', color: '#0F6E56', bg: '#E1F5EE' },
      { id: 'culture', label: 'Training & Culture', icon: '🎓', color: '#993556', bg: '#FBEAF0' },
    ],
    questions: [
      { dim: 0, text: 'Does your organisation have a documented AI usage policy accessible to all employees?', weight: 3 },
      { dim: 0, text: 'Are there clear rules about which AI tools are approved for use in regulated activities?', weight: 3 },
      { dim: 0, text: 'Is there a defined process for requesting and approving new AI tools before deployment?', weight: 2 },
      { dim: 0, text: 'Does your organisation have a designated AI governance owner or committee?', weight: 2 },
      { dim: 1, text: 'Have your AI systems been classified by risk level according to EU AI Act criteria?', weight: 3 },
      { dim: 1, text: 'Is there an AI risk register that is regularly reviewed and updated?', weight: 3 },
      { dim: 1, text: 'Are high-risk AI systems subject to documented conformity assessment before deployment?', weight: 3 },
      { dim: 1, text: 'Is there a process to reassess risk classification when AI systems are updated?', weight: 2 },
      { dim: 2, text: 'Are there documented rules about which data types can be used with external AI tools?', weight: 3 },
      { dim: 2, text: 'Have AI tool vendors been validated for GDPR data processing compliance?', weight: 3 },
      { dim: 2, text: 'Are AI-generated outputs stored and traceable for audit purposes?', weight: 2 },
      { dim: 2, text: 'Is there a data anonymisation process before using patient data with AI tools?', weight: 3 },
      { dim: 3, text: 'Are there documented human review requirements before AI outputs are acted upon in regulated processes?', weight: 3 },
      { dim: 3, text: 'Do employees understand when AI assistance is allowed versus when human judgment is mandatory?', weight: 2 },
      { dim: 3, text: 'Is there an incident reporting process for AI errors or unexpected outputs?', weight: 3 },
      { dim: 3, text: 'Are AI system performance metrics monitored on an ongoing basis?', weight: 2 },
      { dim: 4, text: 'Have all employees who use AI tools received appropriate training on their limitations and risks?', weight: 3 },
      { dim: 4, text: 'Does your organisation track AI literacy levels and update training accordingly? (EU AI Act Art. 4)', weight: 3 },
      { dim: 4, text: 'Are there clear channels for employees to raise concerns about AI tool behaviour?', weight: 2 },
      { dim: 4, text: 'Does leadership visibly champion responsible AI use within the organisation?', weight: 1 },
    ],
    maturityLevels: [
      { min: 0, max: 30, label: 'Initial', desc: 'Ad hoc AI usage with minimal governance. Significant regulatory and operational risk.', color: '#E24B4A' },
      { min: 31, max: 55, label: 'Developing', desc: 'Some governance elements in place but gaps remain. A structured programme is required.', color: '#EF9F27' },
      { min: 56, max: 75, label: 'Defined', desc: 'Governance framework exists but implementation is inconsistent. Focus on operationalisation.', color: '#185FA5' },
      { min: 76, max: 100, label: 'Advanced', desc: 'Mature governance with strong policy, oversight and culture. Optimise and maintain.', color: '#1D9E75' },
    ],
    T: {
      langToggle: 'FR', eyebrow: 'Pharma & Biotech · EU AI Act aligned',
      problem: 'Problem', problemText: 'Organisations deploy AI without a governance framework. No policy, no risk classification, no oversight rules. The EU AI Act (Article 4, in force February 2025) legally requires AI literacy and governance across the workforce.',
      approach: 'Approach', approachText: '20-question assessment across 5 dimensions: AI Usage Policy / Risk Classification (EU AI Act) / Data Governance / Human Oversight / Training & Culture. Generates a personalised framework adapted to your organisation\'s profile and identified gaps.',
      result: 'Result', resultText: 'A structured, actionable AI governance framework with policy statement, risk register, data rules, oversight requirements, and a 90-day priority action plan — ready to present to leadership.',
      heroTitle1: 'AI Governance', heroTitle2: 'Framework Builder',
      cta: 'Start assessment →', stepProfile: 'Organisation profile — Step 1/3',
      profileTitle: 'Tell us about your organisation', orgName: 'Organisation name',
      orgNamePlaceholder: 'e.g. Roche Basel', orgType: 'Organisation type', orgTypeDefault: 'Select…',
      orgSize: 'Size', orgSizeDefault: 'Select…',
      systemsLabel: 'AI systems currently in use or planned', systemsHint: '(select all that apply)',
      back: '← Back', nextProfile: 'Start assessment →',
      question: 'Question', of: '/',
      weightCritical: 'Weight: Critical', weightImportant: 'Weight: Important', weightStandard: 'Weight: Standard',
      ansYes: '✓ Yes — fully in place', ansPartial: '~ Partially in place', ansNo: '✗ Not in place',
      prev: '← Previous', nextQ: 'Next →', generate: 'Generate framework →',
      tagMaturity: 'Governance maturity', tagAssessment: 'Your personalised framework',
      generating: 'Generating…', generatingText: 'Claude is generating your governance framework…',
      generatingHint: 'Tailored to your organisation profile and assessment gaps · ~15 seconds',
      aiSystems: 'AI systems in scope', gapSuffix: 'gap(s) to address',
      download: 'Download PDF framework ↓', newAssessment: '← New assessment', newAssessmentBtn: 'New assessment',
      pdfTitle: 'AI Governance Framework', pdfConfidential: 'Confidential',
      pdfOrgProfile: 'Organisation profile', pdfMaturity: 'Governance maturity',
      pdfDimensions: 'Governance assessment by dimension', pdfFramework: 'Personalised governance framework',
      promptLang: 'English',
    }
  },
  fr: {
    orgTypes: ['Pharmaceutique (grand groupe)', 'Biotech / Pharma mid-size', 'CRO / CMO', 'MedTech', 'Hôpital / Académique'],
    orgSizes: ['< 50 collaborateurs', '50-200', '200-1 000', '1 000-5 000', '> 5 000'],
    aiSystems: [
      'Pharmacovigilance (détection de signaux, traitement ICSR)',
      'Gestion des essais cliniques (recrutement, monitoring)',
      'R&D / Discovery (ADMET, conception de novo)',
      'Affaires réglementaires (rédaction, soumissions)',
      'Affaires médicales / MSL',
      'Assurance qualité (détection d\'écarts, audits)',
      'Medical writing / génération de contenu',
      'RH / Formation (littératie IA, onboarding)',
      'Finance / Opérations',
      'Interaction patient / grand public',
    ],
    dimensions: [
      { id: 'policy', label: 'Politique d\'usage IA', icon: '📋', color: '#185FA5', bg: '#E6F1FB' },
      { id: 'risk', label: 'Classification des risques', icon: '⚖️', color: '#854F0B', bg: '#FAEEDA' },
      { id: 'data', label: 'Gouvernance des données', icon: '🗄️', color: '#533AB7', bg: '#EEEDFE' },
      { id: 'oversight', label: 'Supervision humaine', icon: '👁️', color: '#0F6E56', bg: '#E1F5EE' },
      { id: 'culture', label: 'Formation & Culture', icon: '🎓', color: '#993556', bg: '#FBEAF0' },
    ],
    questions: [
      { dim: 0, text: 'Votre organisation dispose-t-elle d\'une politique d\'usage IA documentée et accessible à tous les collaborateurs ?', weight: 3 },
      { dim: 0, text: 'Existe-t-il des règles claires sur les outils IA approuvés pour les activités réglementées ?', weight: 3 },
      { dim: 0, text: 'Y a-t-il un processus défini pour demander et approuver de nouveaux outils IA avant déploiement ?', weight: 2 },
      { dim: 0, text: 'Votre organisation dispose-t-elle d\'un responsable ou d\'un comité de gouvernance IA désigné ?', weight: 2 },
      { dim: 1, text: 'Vos systèmes IA ont-ils été classifiés par niveau de risque selon les critères de l\'EU AI Act ?', weight: 3 },
      { dim: 1, text: 'Existe-t-il un registre des risques IA régulièrement revu et mis à jour ?', weight: 3 },
      { dim: 1, text: 'Les systèmes IA à risque élevé font-ils l\'objet d\'une évaluation de conformité documentée avant déploiement ?', weight: 3 },
      { dim: 1, text: 'Existe-t-il un processus pour réévaluer la classification des risques lorsque les systèmes IA sont mis à jour ?', weight: 2 },
      { dim: 2, text: 'Existe-t-il des règles documentées sur les types de données pouvant être utilisés avec des outils IA externes ?', weight: 3 },
      { dim: 2, text: 'La conformité RGPD des fournisseurs d\'outils IA a-t-elle été vérifiée et documentée ?', weight: 3 },
      { dim: 2, text: 'Les outputs générés par IA sont-ils stockés et traçables à des fins d\'audit ?', weight: 2 },
      { dim: 2, text: 'Existe-t-il un processus d\'anonymisation des données patients avant leur utilisation avec des outils IA ?', weight: 3 },
      { dim: 3, text: 'Existe-t-il des exigences documentées de revue humaine avant d\'agir sur les outputs IA dans les processus réglementés ?', weight: 3 },
      { dim: 3, text: 'Les collaborateurs comprennent-ils clairement quand l\'assistance IA est autorisée vs quand le jugement humain est obligatoire ?', weight: 2 },
      { dim: 3, text: 'Existe-t-il un processus de signalement des erreurs ou comportements inattendus des outils IA ?', weight: 3 },
      { dim: 3, text: 'Les indicateurs de performance des systèmes IA sont-ils suivis de façon continue ?', weight: 2 },
      { dim: 4, text: 'Tous les collaborateurs utilisant des outils IA ont-ils reçu une formation adaptée sur leurs limites et risques ?', weight: 3 },
      { dim: 4, text: 'Votre organisation suit-elle les niveaux de littératie IA et met-elle à jour les formations en conséquence ? (EU AI Act Art. 4)', weight: 3 },
      { dim: 4, text: 'Existe-t-il des canaux clairs permettant aux collaborateurs de signaler des préoccupations sur le comportement des outils IA ?', weight: 2 },
      { dim: 4, text: 'La direction promeut-elle visiblement un usage responsable de l\'IA au sein de l\'organisation ?', weight: 1 },
    ],
    maturityLevels: [
      { min: 0, max: 30, label: 'Initial', desc: 'Usage IA ad hoc avec une gouvernance minimale. Risque réglementaire et opérationnel significatif.', color: '#E24B4A' },
      { min: 31, max: 55, label: 'En développement', desc: 'Certains éléments de gouvernance en place mais des lacunes subsistent. Un programme structuré est nécessaire.', color: '#EF9F27' },
      { min: 56, max: 75, label: 'Défini', desc: 'Le cadre de gouvernance existe mais la mise en oeuvre est incohérente. Priorité à l\'opérationnalisation.', color: '#185FA5' },
      { min: 76, max: 100, label: 'Avancé', desc: 'Gouvernance mature avec une politique, une supervision et une culture solides. Optimiser et maintenir.', color: '#1D9E75' },
    ],
    T: {
      langToggle: 'EN', eyebrow: 'Pharma & Biotech · EU AI Act aligné',
      problem: 'Problème', problemText: 'Les organisations déploient l\'IA sans cadre de gouvernance. Pas de politique, pas de classification des risques, pas de règles de supervision. L\'EU AI Act (Article 4, en vigueur depuis février 2025) impose légalement la littératie IA et la gouvernance à l\'ensemble des collaborateurs.',
      approach: 'Approche', approachText: 'Évaluation de 20 questions sur 5 dimensions : Politique d\'usage IA / Classification des risques (EU AI Act) / Gouvernance des données / Supervision humaine / Formation & Culture. Génère un cadre personnalisé adapté au profil et aux lacunes identifiées.',
      result: 'Résultat', resultText: 'Un cadre de gouvernance IA structuré et actionnable — politique d\'usage, registre des risques, règles de données, exigences de supervision et plan d\'action prioritaire sur 90 jours — prêt à présenter à la direction.',
      heroTitle1: 'Cadre de gouvernance', heroTitle2: 'IA — Builder',
      cta: 'Démarrer l\'évaluation →', stepProfile: 'Profil organisation — Étape 1/3',
      profileTitle: 'Parlez-nous de votre organisation', orgName: 'Nom de l\'organisation',
      orgNamePlaceholder: 'ex. Sanofi France', orgType: 'Type d\'organisation', orgTypeDefault: 'Choisir…',
      orgSize: 'Taille', orgSizeDefault: 'Choisir…',
      systemsLabel: 'Systèmes IA actuellement utilisés ou planifiés', systemsHint: '(sélectionnez tout ce qui s\'applique)',
      back: '← Retour', nextProfile: 'Démarrer l\'évaluation →',
      question: 'Question', of: '/',
      weightCritical: 'Importance : Critique', weightImportant: 'Importance : Élevée', weightStandard: 'Importance : Standard',
      ansYes: '✓ Oui — entièrement en place', ansPartial: '~ Partiellement en place', ansNo: '✗ Pas en place',
      prev: '← Précédent', nextQ: 'Suivant →', generate: 'Générer le cadre →',
      tagMaturity: 'Maturité de gouvernance', tagAssessment: 'Votre cadre de gouvernance personnalisé',
      generating: 'Génération…', generatingText: 'Claude génère votre cadre de gouvernance IA…',
      generatingHint: 'Adapté au profil et aux lacunes identifiées · ~15 secondes',
      aiSystems: 'Systèmes IA en scope', gapSuffix: 'lacune(s) à combler',
      download: 'Télécharger le PDF ↓', newAssessment: '← Nouvelle évaluation', newAssessmentBtn: 'Nouvelle évaluation',
      pdfTitle: 'Cadre de Gouvernance IA', pdfConfidential: 'Confidentiel',
      pdfOrgProfile: 'Profil organisation', pdfMaturity: 'Maturité de gouvernance',
      pdfDimensions: 'Évaluation par dimension', pdfFramework: 'Cadre de gouvernance personnalisé',
      promptLang: 'French',
    }
  }
}

function getMaturity(score, levels) {
  return levels.find(m => score >= m.min && score <= m.max) || levels[0]
}

function computeScores(answers, questions) {
  const dims = 5
  const dimScores = Array.from({ length: dims }, (_, di) => {
    const qs = questions.filter(q => q.dim === di)
    const totalWeight = qs.reduce((a, q) => a + q.weight, 0)
    const earned = qs.reduce((a, q) => {
      const qi = questions.indexOf(q)
      const ans = answers[qi]
      return a + (ans === 'yes' ? q.weight : ans === 'partial' ? q.weight * 0.5 : 0)
    }, 0)
    return Math.round((earned / totalWeight) * 100)
  })
  const overall = Math.round(dimScores.reduce((a, b) => a + b, 0) / dims)
  return { dimScores, overall }
}

function exportPDF(org, answers, dimScores, overall, framework, dimensions, maturityLevels, T) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const date = new Date().toLocaleDateString(T.promptLang === 'French' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const maturity = getMaturity(overall, maturityLevels)
  const C = {
    blue: [24, 95, 165], bluePale: [230, 241, 251],
    teal: [15, 110, 86], tealPale: [225, 245, 238],
    ink: [26, 26, 24], slate: [95, 94, 90],
    slatePale: [241, 239, 232], white: [255, 255, 255],
    bg: [250, 250, 248],
    matCol: maturity.color === '#E24B4A' ? [226,75,74] : maturity.color === '#EF9F27' ? [239,159,39] : maturity.color === '#185FA5' ? [24,95,165] : [29,158,117],
  }
  const matBg = maturity.color === '#E24B4A' ? [252,235,235] : maturity.color === '#EF9F27' ? [250,238,218] : maturity.color === '#185FA5' ? [230,241,251] : [225,245,238]

  doc.setFillColor(...C.blue); doc.rect(0, 0, 210, 34, 'F')
  doc.setTextColor(...C.white)
  doc.setFontSize(7); doc.setFont('helvetica', 'normal')
  doc.text('PharmaAI Governance Framework Builder', 14, 9)
  doc.setFontSize(18); doc.setFont('helvetica', 'bold')
  doc.text(T.pdfTitle, 14, 21)
  doc.setFontSize(8); doc.setFont('helvetica', 'normal')
  doc.text(org.name || '', 14, 28)
  doc.text(date, 196, 21, { align: 'right' })
  doc.text(T.pdfConfidential, 196, 28, { align: 'right' })

  let y = 40
  doc.setFillColor(...C.slatePale); doc.roundedRect(14, y, 88, 20, 2, 2, 'F')
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...C.slate)
  doc.text(T.pdfOrgProfile, 18, y + 6)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...C.ink)
  doc.text(org.type || '', 18, y + 12)
  doc.text((org.size || '') + '  |  ' + (org.systems?.length || 0) + ' ' + T.aiSystems, 18, y + 17)

  doc.setFillColor(...matBg); doc.roundedRect(106, y, 90, 20, 2, 2, 'F')
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...C.slate)
  doc.text(T.pdfMaturity, 110, y + 6)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.setTextColor(...C.matCol)
  doc.text(String(overall) + '%', 110, y + 17)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...C.matCol)
  doc.text(maturity.label, 140, y + 13)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...C.slate)
  const mLines = doc.splitTextToSize(maturity.desc, 48)
  doc.text(mLines[0] || '', 140, y + 17)

  y += 26
  doc.setDrawColor(...C.blue); doc.setLineWidth(0.3); doc.line(14, y, 196, y)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...C.blue)
  doc.text(T.pdfDimensions, 14, y + 6)
  y += 10

  dimensions.forEach((dim, i) => {
    const score = dimScores[i]
    const barW = 80
    const filled = (score / 100) * barW
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...C.ink)
    doc.text(dim.label, 14, y + 4)
    doc.setFillColor(...C.slatePale); doc.roundedRect(75, y, barW, 5, 1, 1, 'F')
    const barCol = score >= 75 ? C.teal : score >= 50 ? C.blue : score >= 30 ? [186,117,23] : [226,75,74]
    doc.setFillColor(...barCol); if (filled > 0) doc.roundedRect(75, y, filled, 5, 1, 1, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...barCol)
    doc.text(score + '%', 162, y + 4)
    y += 8
  })

  y += 4
  doc.setDrawColor(...C.blue); doc.line(14, y, 196, y)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...C.blue)
  doc.text(T.pdfFramework, 14, y + 6)
  y += 12

  if (framework) {
    framework.split('\n\n').filter(s => s.trim()).forEach(section => {
      const lines = section.split('\n')
      const heading = lines[0].replace(/^#+\s*|\*\*/g, '').trim()
      const body = lines.slice(1).join(' ').replace(/\*\*/g, '').trim()
      if (y > 255) { doc.addPage(); y = 14 }
      doc.setFillColor(...C.bluePale); doc.roundedRect(14, y - 2, 182, 8, 1, 1, 'F')
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...C.blue)
      doc.text(heading.slice(0, 80), 17, y + 4)
      y += 10
      if (body) {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...C.ink)
        const bodyLines = doc.splitTextToSize(body, 172)
        bodyLines.slice(0, 8).forEach(line => {
          if (y > 270) { doc.addPage(); y = 14 }
          doc.text(line, 14, y); y += 4.5
        })
        y += 2
      }
    })
  }

  const np = doc.getNumberOfPages()
  for (let p = 1; p <= np; p++) {
    doc.setPage(p)
    doc.setFillColor(...C.slatePale); doc.rect(0, 284, 210, 13, 'F')
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...C.slate)
    doc.text('PharmaAI Governance Framework Builder  |  pharmaai-governance.vercel.app  |  EU AI Act', 14, 291)
    doc.text(date + '  |  Page ' + p + ' of ' + np, 196, 291, { align: 'right' })
  }
  doc.save('PharmaAI-Governance-Framework.pdf')
}

export default function GovernancePage() {
  const [lang, setLang] = useState('en')
  const [step, setStep] = useState('landing')
  const [org, setOrg] = useState({ name: '', type: '', size: '', systems: [] })
  const [answers, setAnswers] = useState(new Array(20).fill(null))
  const [current, setCurrent] = useState(0)
  const [dimScores, setDimScores] = useState([])
  const [overall, setOverall] = useState(0)
  const [framework, setFramework] = useState(null)
  const [loading, setLoading] = useState(false)

  const d = DATA[lang]
  const T = d.T

  function toggleLang() {
    setLang(l => l === 'en' ? 'fr' : 'en')
    setStep('landing')
    setOrg({ name: '', type: '', size: '', systems: [] })
    setAnswers(new Array(20).fill(null))
    setCurrent(0); setDimScores([]); setOverall(0); setFramework(null)
  }

  function toggleSystem(s) {
    setOrg(o => ({ ...o, systems: o.systems.includes(s) ? o.systems.filter(x => x !== s) : [...o.systems, s] }))
  }

  function answer(val) {
    const next = [...answers]; next[current] = val; setAnswers(next)
  }

  function goNext() {
    if (current < d.questions.length - 1) setCurrent(c => c + 1)
    else computeResults()
  }

  function computeResults() {
    const { dimScores: ds, overall: ov } = computeScores(answers, d.questions)
    setDimScores(ds); setOverall(ov); setStep('results')
    fetchFramework(ds, ov)
  }

  async function fetchFramework(ds, ov) {
    setLoading(true)
    const maturity = getMaturity(ov, d.maturityLevels)
    const dimSummary = d.dimensions.map((dim, i) => `${dim.label}: ${ds[i]}%`).join(', ')
    const gaps = d.questions.filter((q, i) => answers[i] !== 'yes')
      .map(q => d.dimensions[q.dim].label + ': ' + q.text).slice(0, 10).join('\n')

    const prompt = `You are an expert in AI governance for the pharmaceutical and biotech industry, specialising in EU AI Act compliance and ISO 42001.
Organisation: ${org.type}, ${org.size}. AI systems: ${org.systems.join(', ') || 'general AI tools'}.
Overall governance maturity: ${ov}% (${maturity.label}). Scores: ${dimSummary}.
Key gaps:
${gaps}

Generate a concise, practical AI governance framework in ${T.promptLang} with exactly 6 sections:
1. AI Governance Policy Statement
2. Risk Classification Framework (EU AI Act aligned)
3. Data Governance Rules
4. Human Oversight Requirements
5. AI Literacy & Training Obligations (EU AI Act Article 4)
6. Priority Action Plan (next 90 days)

Each section: 1 heading line, then 3-5 concrete actionable points specific to this organisation. Be direct. No generic statements. ${T.promptLang} only.`

    try {
      const res = await fetch('/api/claude', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
      })
      const data = await res.json()
      setFramework(data.content?.find(b => b.type === 'text')?.text || '')
    } catch { setFramework(lang === 'fr' ? 'Génération indisponible.' : 'Generation unavailable.') }
    finally { setLoading(false) }
  }

  function reset() {
    setStep('landing'); setOrg({ name: '', type: '', size: '', systems: [] })
    setAnswers(new Array(20).fill(null)); setCurrent(0)
    setDimScores([]); setOverall(0); setFramework(null)
  }

  const progress = Math.round((current / d.questions.length) * 100)
  const currentDim = d.questions[current]?.dim
  const dim = d.dimensions[currentDim]
  const maturity = getMaturity(overall, d.maturityLevels)
  const weightLabel = d.questions[current]?.weight === 3 ? T.weightCritical : d.questions[current]?.weight === 2 ? T.weightImportant : T.weightStandard

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.navBrand}>
          <span className={styles.navLogo}>PharmaAI</span>
          <span className={styles.navSub}>{lang === 'fr' ? 'Governance Framework Builder' : 'Governance Framework Builder'}</span>
        </div>
        <div className={styles.navRight}>
          <button className={styles.navBtnLang} onClick={toggleLang}>{T.langToggle}</button>
          {step === 'results' && <button className={styles.navBtn} onClick={reset}>{T.newAssessment}</button>}
        </div>
      </nav>

      <main className={styles.main}>

        {/* LANDING */}
        {step === 'landing' && (
          <div className={styles.landingCard}>
            <div className={styles.eyebrow}><span className={styles.dot} />{T.eyebrow}</div>
            <h1 className={styles.heroTitle}>{T.heroTitle1}<br /><em>{T.heroTitle2}</em></h1>

            <div className={styles.pabGrid}>
              <div className={styles.pabBlock}>
                <span className={styles.pabLabel} style={{ color: '#E24B4A' }}>{T.problem}</span>
                <p className={styles.pabText}>{T.problemText}</p>
              </div>
              <div className={styles.pabBlock}>
                <span className={styles.pabLabel} style={{ color: '#185FA5' }}>{T.approach}</span>
                <p className={styles.pabText}>{T.approachText}</p>
              </div>
              <div className={styles.pabBlock}>
                <span className={styles.pabLabel} style={{ color: '#1D9E75' }}>{T.result}</span>
                <p className={styles.pabText}>{T.resultText}</p>
              </div>
            </div>

            <div className={styles.dimPills}>
              {d.dimensions.map(dim => (
                <div key={dim.id} className={styles.dimPill} style={{ background: dim.bg, color: dim.color }}>
                  <span>{dim.icon}</span><span>{dim.label}</span>
                </div>
              ))}
            </div>
            <button className={styles.btnPrimary} onClick={() => setStep('profile')}>{T.cta}</button>
          </div>
        )}

        {/* PROFILE */}
        {step === 'profile' && (
          <div className={styles.card}>
            <p className={styles.tag}>{T.stepProfile}</p>
            <h2 className={styles.cardTitle}>{T.profileTitle}</h2>
            <div className={styles.formStack}>
              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>{T.orgName}</label>
                  <input className={styles.formInput} value={org.name}
                    onChange={e => setOrg(o => ({ ...o, name: e.target.value }))}
                    placeholder={T.orgNamePlaceholder} />
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>{T.orgType}</label>
                  <select className={styles.formInput} value={org.type}
                    onChange={e => setOrg(o => ({ ...o, type: e.target.value }))}>
                    <option value="">{T.orgTypeDefault}</option>
                    {d.orgTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>{T.orgSize}</label>
                  <select className={styles.formInput} value={org.size}
                    onChange={e => setOrg(o => ({ ...o, size: e.target.value }))}>
                    <option value="">{T.orgSizeDefault}</option>
                    {d.orgSizes.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>{T.systemsLabel} <span className={styles.formHint}>{T.systemsHint}</span></label>
                <div className={styles.checkGrid}>
                  {d.aiSystems.map(s => (
                    <label key={s} className={`${styles.checkItem} ${org.systems.includes(s) ? styles.checkItemSelected : ''}`}>
                      <input type="checkbox" checked={org.systems.includes(s)} onChange={() => toggleSystem(s)} style={{ display: 'none' }} />
                      <span className={styles.checkBox}>{org.systems.includes(s) ? '✓' : ''}</span>
                      <span>{s}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.navRow}>
              <button className={styles.btnGhost} onClick={() => setStep('landing')}>{T.back}</button>
              <button className={styles.btnPrimary} onClick={() => setStep('questions')} disabled={!org.type || !org.size}>
                {T.nextProfile}
              </button>
            </div>
          </div>
        )}

        {/* QUESTIONS */}
        {step === 'questions' && (
          <div className={styles.card}>
            <div className={styles.qMeta}>
              <span className={styles.tag} style={{ color: dim?.color, marginBottom: 0 }}>
                {dim?.icon} {dim?.label}
              </span>
              <span className={styles.qCounter}>{T.question} {current + 1} {T.of} {d.questions.length}</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%`, background: dim?.color }} />
            </div>
            <p className={styles.qText}>{d.questions[current].text}</p>
            <p className={styles.qWeight}>{weightLabel}</p>
            <div className={styles.answerBtns}>
              {[
                { val: 'yes', label: T.ansYes, color: '#1D9E75', bg: '#E1F5EE' },
                { val: 'partial', label: T.ansPartial, color: '#BA7517', bg: '#FAEEDA' },
                { val: 'no', label: T.ansNo, color: '#E24B4A', bg: '#FCEBEB' },
              ].map(opt => (
                <button key={opt.val} className={styles.answerBtn}
                  style={answers[current] === opt.val ? { border: `2px solid ${opt.color}`, background: opt.bg, color: opt.color } : {}}
                  onClick={() => answer(opt.val)}>
                  {opt.label}
                </button>
              ))}
            </div>
            <div className={styles.navRow}>
              <button className={styles.btnGhost} onClick={() => current > 0 ? setCurrent(c => c - 1) : setStep('profile')} disabled={current === 0}>{T.prev}</button>
              <button className={styles.btnPrimary} onClick={goNext} disabled={answers[current] === null}>
                {current === d.questions.length - 1 ? T.generate : T.nextQ}
              </button>
            </div>
          </div>
        )}

        {/* RESULTS */}
        {step === 'results' && (
          <div className={styles.resultsWrap}>
            <div className={styles.maturityCard} style={{ borderColor: maturity.color }}>
              <div className={styles.maturityLeft}>
                <p className={styles.tag}>{T.tagMaturity}</p>
                <div className={styles.maturityScore}>
                  <span className={styles.maturityNum} style={{ color: maturity.color }}>{overall}%</span>
                  <span className={styles.maturityLabel} style={{ color: maturity.color }}>{maturity.label}</span>
                </div>
                <p className={styles.maturityDesc}>{maturity.desc}</p>
              </div>
              <div className={styles.maturityRight}>
                <p className={styles.maturityOrgName}>{org.name || org.type}</p>
                <p className={styles.maturityOrgMeta}>{org.type} · {org.size}</p>
                <p className={styles.maturityOrgMeta}>{org.systems.length} {T.aiSystems}</p>
              </div>
            </div>

            <div className={styles.dimBars}>
              {d.dimensions.map((dim, i) => {
                const score = dimScores[i] || 0
                const gapCount = d.questions.filter((q, qi) => q.dim === i && answers[qi] !== 'yes').length
                return (
                  <div key={dim.id} className={styles.dimBar}>
                    <div className={styles.dimBarLabel}>
                      <span style={{ color: dim.color }}>{dim.icon} {dim.label}</span>
                      <span className={styles.dimBarScore} style={{ color: score >= 75 ? '#1D9E75' : score >= 50 ? '#185FA5' : score >= 30 ? '#BA7517' : '#E24B4A' }}>
                        {score}%
                      </span>
                    </div>
                    <div className={styles.dimBarTrack}>
                      <div className={styles.dimBarFill} style={{ width: `${score}%`, background: score >= 75 ? '#1D9E75' : score >= 50 ? '#185FA5' : score >= 30 ? '#BA7517' : '#E24B4A' }} />
                    </div>
                    {gapCount > 0 && <p className={styles.dimGap}>{gapCount} {T.gapSuffix}</p>}
                  </div>
                )
              })}
            </div>

            <div className={styles.frameworkCard}>
              <div className={styles.frameworkHeader}>
                <p className={styles.tag} style={{ marginBottom: 0 }}>{T.tagAssessment}</p>
                {loading && <span className={styles.loadingBadge}>{T.generating}</span>}
              </div>
              {loading ? (
                <div className={styles.frameworkLoading}>
                  <p className={styles.loadingText}>{T.generatingText}</p>
                  <p className={styles.loadingHint}>{T.generatingHint}</p>
                </div>
              ) : framework ? (
                <div className={styles.frameworkContent}>
                  {framework.split('\n\n').filter(s => s.trim()).map((section, i) => {
                    const lines = section.split('\n')
                    const heading = lines[0].replace(/^#+\s*|\*\*/g, '').trim()
                    const body = lines.slice(1).join('\n').trim()
                    const fdim = d.dimensions[Math.min(i, d.dimensions.length - 1)]
                    return (
                      <div key={i} className={styles.frameworkSection}>
                        <div className={styles.frameworkSectionHeader} style={{ background: fdim.bg }}>
                          <span className={styles.frameworkSectionNum} style={{ color: fdim.color }}>{i + 1}</span>
                          <span className={styles.frameworkSectionTitle} style={{ color: fdim.color }}>{heading}</span>
                        </div>
                        <div className={styles.frameworkSectionBody}>
                          {body.split('\n').filter(l => l.trim()).map((line, li) => (
                            <div key={li} className={styles.frameworkLine}>
                              <span className={styles.frameworkBullet}>→</span>
                              <span>{line.replace(/^[-•*]\s*/, '').replace(/\*\*/g, '')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : null}
            </div>

            <div className={styles.actions}>
              <button className={styles.btnPrimary}
                onClick={() => exportPDF(org, answers, dimScores, overall, framework, d.dimensions, d.maturityLevels, T)}
                disabled={loading || !framework}>
                {T.download}
              </button>
              <button className={styles.btnGhost} onClick={reset}>{T.newAssessmentBtn}</button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
