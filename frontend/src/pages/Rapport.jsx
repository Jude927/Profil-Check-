import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import {
  ShieldCheck, ArrowLeft, Download, AlertTriangle,
  CheckCircle2, XCircle, AlertCircle, Calendar, User, Briefcase, Loader2
} from 'lucide-react'
import { pdfApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import styles from './Rapport.module.css'

const radarData = [
  { domaine: 'Technique',   score: 71 },
  { domaine: 'Expérience',  score: 68 },
  { domaine: 'Diplômes',    score: 90 },
  { domaine: 'Cohérence',   score: 74 },
  { domaine: 'Soft Skills', score: 61 },
]

const barData = [
  { name: 'Test IA',       score: 71, poids: '40%' },
  { name: 'Expérience',    score: 68, poids: '25%' },
  { name: 'Diplômes',      score: 90, poids: '20%' },
  { name: 'Cohérence',     score: 74, poids: '15%' },
]

const barColors = ['#8B1A2F','#C4714A','#4A7C59','#2563EB']

const recommandations = [
  { type: 'warning', text: 'Score en Soft Skills insuffisant (61%) — Formation en communication recommandée.' },
  { type: 'warning', text: 'Écart détecté entre expérience déclarée et niveau des réponses — Entretien de vérification suggéré.' },
  { type: 'ok',      text: 'Diplômes cohérents avec le niveau des réponses (90%).' },
  { type: 'ok',      text: 'Résultats stables sur les 3 dernières évaluations.' },
]

const SC = (0.40*71 + 0.25*68 + 0.20*90 + 0.15*74).toFixed(1)

const fadeUp = (d=0) => ({ initial:{opacity:0,y:20}, animate:{opacity:1,y:0}, transition:{duration:0.45,delay:d} })

export default function Rapport() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { logout } = useAuth()

  // reportId passé via navigate state ou depuis l'URL
  const reportId = location.state?.reportId ?? null
  const employeeId = location.state?.employeeId ?? null

  const [downloading, setDownloading] = useState(false)
  const [dlError, setDlError]         = useState('')

  const handleDownload = async () => {
    setDlError('')

    // Si le backend est dispo, on tente d'abord le vrai PDF
    if (reportId) {
      setDownloading(true)
      try {
        await pdfApi.downloadReport(reportId)
        setDownloading(false)
        return
      } catch {
        // Fallback : impression navigateur
      }
      setDownloading(false)
    }

    // Génération PDF côté navigateur (window.print)
    window.print()
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => employeeId ? navigate(`/employe/${employeeId}`) : navigate('/employes')}>
          <ArrowLeft size={18}/> Retour à la fiche
        </button>
        <div className={styles.brand}><ShieldCheck size={20}/><span>ProfilCheck</span></div>
        <div>
          {dlError && <p className={styles.dlError}>⚠️ {dlError}</p>}
          <button className={styles.downloadBtn} onClick={handleDownload} disabled={downloading}>
            {downloading ? <><Loader2 size={14} className={styles.spin}/> Export…</> : <><Download size={16}/> Télécharger PDF</>}
          </button>
        </div>
      </header>

      <div className={styles.content}>
        {/* Titre rapport */}
        <motion.div className={styles.rapportHeader} {...fadeUp(0)}>
          <div>
            <p className={styles.rapportLabel}>Rapport de conformité</p>
            <h1 className={styles.rapportTitre}>Amara Diallo — Analyste de données</h1>
            <div className={styles.rapportMeta}>
              <span><User size={13}/> Généré par : Sophie Renard (RH)</span>
              <span><Calendar size={13}/> 06 juin 2026</span>
              <span><Briefcase size={13}/> Poste requis : Analyste Senior</span>
            </div>
          </div>
          <div className={styles.scoreGlobal}>
            <svg viewBox="0 0 130 130" className={styles.scoreRing}>
              <circle cx="65" cy="65" r="54" fill="none" stroke="#F0EBE3" strokeWidth="12"/>
              <circle cx="65" cy="65" r="54" fill="none"
                stroke="#D97706" strokeWidth="12"
                strokeDasharray={`${2*Math.PI*54}`}
                strokeDashoffset={`${2*Math.PI*54*(1-Number(SC)/100)}`}
                strokeLinecap="round" transform="rotate(-90 65 65)"
                style={{transition:'stroke-dashoffset 1.2s ease'}}
              />
              <text x="65" y="60" textAnchor="middle" fontSize="22" fontWeight="700" fill="#1C1917" fontFamily="Playfair Display">{SC}%</text>
              <text x="65" y="78" textAnchor="middle" fontSize="11" fill="#D97706" fontWeight="600">À surveiller</text>
            </svg>
            <p className={styles.scoreFormule}>SC = 0.40×Test + 0.25×Exp + 0.20×Dipl + 0.15×Coh</p>
          </div>
        </motion.div>

        <div className={styles.grid}>
          {/* Composantes */}
          <motion.div className={styles.card} {...fadeUp(0.1)}>
            <h3>Composantes du score</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE3" vertical={false}/>
                <XAxis dataKey="name" tick={{ fontSize:12, fill:'#78716C' }} axisLine={false} tickLine={false}/>
                <YAxis domain={[0,100]} tick={{ fontSize:11, fill:'#78716C' }} axisLine={false} tickLine={false}/>
                <Tooltip
                  contentStyle={{ background:'#fff', border:'1px solid #E7E2DA', borderRadius:8, fontSize:12 }}
                  formatter={(v,n,p) => [`${v}% (poids ${p.payload.poids})`]}
                />
                {barData.map((_, i) => null)}
                <Bar dataKey="score" radius={[6,6,0,0]}>
                  {barData.map((_, i) => <Cell key={i} fill={barColors[i]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Radar */}
          <motion.div className={styles.card} {...fadeUp(0.15)}>
            <h3>Profil de compétences</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E7E2DA"/>
                <PolarAngleAxis dataKey="domaine" tick={{ fontSize:11, fill:'#78716C' }}/>
                <PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false}/>
                <Radar dataKey="score" stroke="#8B1A2F" fill="#8B1A2F" fillOpacity={0.12} strokeWidth={2}/>
                <Tooltip contentStyle={{ background:'#fff', border:'1px solid #E7E2DA', borderRadius:8, fontSize:12 }} formatter={v=>[`${v}%`]}/>
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Interprétation */}
          <motion.div className={styles.card} {...fadeUp(0.2)}>
            <h3>Interprétation</h3>
            <div className={styles.interpretGrid}>
              {[
                { range:'90–100%', label:'Excellent',    color:'#4A7C59', bg:'#E6F4EC', icon:CheckCircle2, actif: false },
                { range:'70–89%',  label:'Conforme',     color:'#2563EB', bg:'#EFF6FF', icon:CheckCircle2, actif: false },
                { range:'50–69%',  label:'À surveiller', color:'#D97706', bg:'#FEF3C7', icon:AlertCircle,  actif: true  },
                { range:'30–49%',  label:'Suspect',      color:'#DC2626', bg:'#FEE2E2', icon:AlertTriangle,actif: false },
                { range:'0–29%',   label:'Non conforme', color:'#7C3AED', bg:'#F3E8FF', icon:XCircle,      actif: false },
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <div key={i} className={`${styles.interpretItem} ${item.actif ? styles.interpretActif : ''}`}
                    style={item.actif ? { borderColor: item.color, background: item.bg } : {}}>
                    <Icon size={16} color={item.color}/>
                    <div>
                      <span className={styles.interpretRange}>{item.range}</span>
                      <span className={styles.interpretLabel} style={{ color: item.color }}>{item.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className={styles.actionBox}>
              <AlertCircle size={16} color="#D97706"/>
              <p>Action déclenchée : <strong>Alerte RH — Réévaluation dans 3 mois</strong></p>
            </div>
          </motion.div>

          {/* Recommandations */}
          <motion.div className={`${styles.card} ${styles.fullWidth}`} {...fadeUp(0.25)}>
            <h3>Recommandations</h3>
            <div className={styles.recoList}>
              {recommandations.map((r, i) => (
                <div key={i} className={`${styles.recoItem} ${r.type === 'warning' ? styles.recoWarning : styles.recoOk}`}>
                  {r.type === 'warning'
                    ? <AlertTriangle size={16} color="#D97706"/>
                    : <CheckCircle2  size={16} color="#4A7C59"/>}
                  <span>{r.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
