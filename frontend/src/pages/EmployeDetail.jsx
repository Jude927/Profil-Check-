import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts'
import {
  ShieldCheck, ArrowLeft, Mail, Phone, MapPin, Calendar,
  Briefcase, GraduationCap, Award, AlertCircle, CheckCircle2, FileText
} from 'lucide-react'
import styles from './EmployeDetail.module.css'

const radarData = [
  { domaine: 'Technique',   score: 82 },
  { domaine: 'Expérience',  score: 68 },
  { domaine: 'Diplômes',    score: 90 },
  { domaine: 'Cohérence',   score: 74 },
  { domaine: 'Soft Skills', score: 61 },
]

const histoData = [
  { date: 'Jan', score: 62 }, { date: 'Mar', score: 67 },
  { date: 'Mai', score: 58 }, { date: 'Jun', score: 71 },
]

const tests = [
  { date: '06/06/2026', domaine: 'SQL + Java', score: 71, statut: 'conforme' },
  { date: '01/03/2026', domaine: 'Architecture', score: 67, statut: 'surveiller' },
  { date: '10/01/2026', domaine: 'Python + Data', score: 62, statut: 'surveiller' },
]

const employe = {
  nom: 'Amara Diallo', poste: 'Analyste de données',
  email: 'amara.diallo@entreprise.com', telephone: '+33 6 12 34 56 78',
  localisation: 'Paris, France', dateEmbauche: '15 mars 2022',
  score: 71, statut: 'surveiller',
  diplomes: ['Master Data Science — Université Paris-Saclay (2021)', 'Licence Informatique — UPEC (2019)'],
  competences: ['Python', 'SQL', 'Tableau', 'Machine Learning', 'Power BI'],
  experience: '3 ans en analyse de données',
}

const statutCfg = {
  conforme:   { label: 'Conforme',     color: '#2563EB', bg: '#EFF6FF' },
  surveiller: { label: 'À surveiller', color: '#D97706', bg: '#FEF3C7' },
  suspect:    { label: 'Suspect',      color: '#DC2626', bg: '#FEE2E2' },
}

const fadeUp = (d = 0) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, delay: d } })

export default function EmployeDetail() {
  const navigate = useNavigate()
  const cfg = statutCfg[employe.statut]

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/employes')}>
          <ArrowLeft size={18} /> Retour à la liste
        </button>
        <div className={styles.brand}><ShieldCheck size={20} /><span>ProfilCheck</span></div>
      </header>

      <div className={styles.content}>
        {/* Profil hero */}
        <motion.div className={styles.hero} {...fadeUp(0)}>
          <div className={styles.heroLeft}>
            <div className={styles.avatar}>AD</div>
            <div>
              <h1 className={styles.nom}>{employe.nom}</h1>
              <p className={styles.poste}>{employe.poste}</p>
              <span className={styles.badge} style={{ color: cfg.color, background: cfg.bg }}>
                {cfg.label}
              </span>
            </div>
          </div>
          <div className={styles.heroRight}>
            <button className={styles.testBtn} onClick={() => navigate('/test')}>
              <FileText size={16} /> Lancer un test
            </button>
            <button className={styles.rapportBtn} onClick={() => navigate('/rapport')}>
              <Award size={16} /> Voir le rapport
            </button>
          </div>
        </motion.div>

        <div className={styles.grid}>
          {/* Infos */}
          <motion.div className={styles.card} {...fadeUp(0.1)}>
            <h3>Informations</h3>
            <div className={styles.infoList}>
              {[
                { icon: Mail,      val: employe.email },
                { icon: Phone,     val: employe.telephone },
                { icon: MapPin,    val: employe.localisation },
                { icon: Calendar,  val: `Embauché le ${employe.dateEmbauche}` },
                { icon: Briefcase, val: employe.experience },
              ].map(({ icon: Icon, val }, i) => (
                <div key={i} className={styles.infoRow}>
                  <Icon size={16} className={styles.infoIcon} />
                  <span>{val}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Score global */}
          <motion.div className={styles.card} {...fadeUp(0.15)}>
            <h3>Score de conformité</h3>
            <div className={styles.scoreCenter}>
              <svg viewBox="0 0 120 120" className={styles.scoreRing}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="#F0EBE3" strokeWidth="10"/>
                <circle cx="60" cy="60" r="50" fill="none"
                  stroke={cfg.color} strokeWidth="10"
                  strokeDasharray={`${2*Math.PI*50}`}
                  strokeDashoffset={`${2*Math.PI*50*(1-employe.score/100)}`}
                  strokeLinecap="round" transform="rotate(-90 60 60)"
                  style={{ transition: 'stroke-dashoffset 1.2s ease' }}
                />
                <text x="60" y="58" textAnchor="middle" fontSize="20" fontWeight="700" fill="#1C1917" fontFamily="Playfair Display">{employe.score}%</text>
                <text x="60" y="74" textAnchor="middle" fontSize="10" fill="#78716C">{cfg.label}</text>
              </svg>
            </div>
            <div className={styles.scoreDetails}>
              {[
                { label: 'Test technique', val: 71 },
                { label: 'Expérience',     val: 68 },
                { label: 'Diplômes',       val: 90 },
                { label: 'Cohérence',      val: 74 },
              ].map((s, i) => (
                <div key={i} className={styles.scoreRow}>
                  <span>{s.label}</span>
                  <div className={styles.scoreBar}>
                    <div className={styles.scoreFill} style={{ width: `${s.val}%`, background: cfg.color }} />
                  </div>
                  <span className={styles.scoreVal}>{s.val}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Radar */}
          <motion.div className={styles.card} {...fadeUp(0.2)}>
            <h3>Profil de compétences</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E7E2DA" />
                <PolarAngleAxis dataKey="domaine" tick={{ fontSize: 11, fill: '#78716C' }} />
                <PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false} />
                <Radar dataKey="score" stroke="#8B1A2F" fill="#8B1A2F" fillOpacity={0.12} strokeWidth={2} />
                <Tooltip contentStyle={{ background:'#fff', border:'1px solid #E7E2DA', borderRadius:8, fontSize:12 }} formatter={v => [`${v}%`]} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Diplômes & Compétences */}
          <motion.div className={styles.card} {...fadeUp(0.25)}>
            <h3><GraduationCap size={16}/> Diplômes déclarés</h3>
            <ul className={styles.tagList}>
              {employe.diplomes.map((d, i) => (
                <li key={i} className={styles.tagItem}><CheckCircle2 size={14} color="#4A7C59"/>{d}</li>
              ))}
            </ul>
            <h3 style={{ marginTop: '1.2rem' }}><Award size={16}/> Compétences déclarées</h3>
            <div className={styles.chips}>
              {employe.competences.map((c, i) => (
                <span key={i} className={styles.chip}>{c}</span>
              ))}
            </div>
          </motion.div>

          {/* Historique score */}
          <motion.div className={styles.card} {...fadeUp(0.3)}>
            <h3>Évolution du score</h3>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={histoData}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#8B1A2F" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#8B1A2F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE3"/>
                <XAxis dataKey="date" tick={{ fontSize:11, fill:'#78716C' }} axisLine={false} tickLine={false}/>
                <YAxis domain={[40,100]} tick={{ fontSize:11, fill:'#78716C' }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:'#fff', border:'1px solid #E7E2DA', borderRadius:8, fontSize:12 }} formatter={v=>[`${v}%`]}/>
                <Area type="monotone" dataKey="score" stroke="#8B1A2F" strokeWidth={2.5} fill="url(#g)" dot={{ fill:'#8B1A2F', r:4 }}/>
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Historique tests */}
          <motion.div className={`${styles.card} ${styles.fullWidth}`} {...fadeUp(0.35)}>
            <h3>Historique des tests</h3>
            <table className={styles.table}>
              <thead>
                <tr><th>Date</th><th>Domaines</th><th>Score</th><th>Statut</th><th></th></tr>
              </thead>
              <tbody>
                {tests.map((t, i) => {
                  const c = statutCfg[t.statut]
                  return (
                    <tr key={i}>
                      <td>{t.date}</td>
                      <td>{t.domaine}</td>
                      <td><strong>{t.score}%</strong></td>
                      <td><span className={styles.badge} style={{ color: c.color, background: c.bg }}>{c.label}</span></td>
                      <td>
                        <button className={styles.viewBtn} onClick={() => navigate('/rapport')}>
                          Rapport <ArrowLeft size={13} style={{ transform:'rotate(180deg)' }}/>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
