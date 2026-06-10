import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts'
import {
  ShieldCheck, ArrowLeft, Mail, Building2, Briefcase,
  GraduationCap, Award, CheckCircle2, FileText, Loader2
} from 'lucide-react'
import { employeesApi } from '../services/api'
import styles from './EmployeDetail.module.css'

const statutCfg = {
  CONFORME:     { label:'Conforme',     color:'#2563EB', bg:'#EFF6FF' },
  A_SURVEILLER: { label:'À surveiller', color:'#D97706', bg:'#FEF3C7' },
  SUSPECT:      { label:'Suspect',      color:'#DC2626', bg:'#FEE2E2' },
  NON_CONFORME: { label:'Non conforme', color:'#7C3AED', bg:'#F3E8FF' },
  // fallbacks
  conforme:     { label:'Conforme',     color:'#2563EB', bg:'#EFF6FF' },
  surveiller:   { label:'À surveiller', color:'#D97706', bg:'#FEF3C7' },
  suspect:      { label:'Suspect',      color:'#DC2626', bg:'#FEE2E2' },
}

const fadeUp = (d=0) => ({ initial:{opacity:0,y:20}, animate:{opacity:1,y:0}, transition:{duration:.45,delay:d} })

export default function EmployeDetail() {
  const navigate = useNavigate()
  const { id }   = useParams()

  const [employe, setEmploye] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (!id) { setLoading(false); return }
    employeesApi.getById(id)
      .then(setEmploye)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className={styles.page}>
      <div className={styles.loadingFull}><Loader2 size={32} className={styles.spin}/> Chargement…</div>
    </div>
  )

  if (error || !employe) return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/employes')}>
          <ArrowLeft size={18}/> Retour à la liste
        </button>
        <div className={styles.brand}><ShieldCheck size={20}/><span>ProfilCheck</span></div>
      </header>
      <div className={styles.errorFull}>⚠️ {error || 'Employé introuvable.'}</div>
    </div>
  )

  const cfg       = statutCfg[employe.statut] ?? statutCfg.CONFORME
  const initiales = `${employe.prenom?.[0]??''}${employe.nom?.[0]??''}`.toUpperCase()

  // Construction des données radar depuis les skills
  const radarData = employe.skills?.length > 0
    ? employe.skills.slice(0,5).map(s => ({
        domaine: s.name,
        score:   Math.min(100, Math.round((s.yearsXp ?? 1) * 15)),
      }))
    : [
        { domaine:'Technique',   score:70 },
        { domaine:'Expérience',  score:60 },
        { domaine:'Diplômes',    score:80 },
        { domaine:'Cohérence',   score:65 },
        { domaine:'Soft Skills', score:55 },
      ]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/employes')}>
          <ArrowLeft size={18}/> Retour à la liste
        </button>
        <div className={styles.brand}><ShieldCheck size={20}/><span>ProfilCheck</span></div>
      </header>

      <div className={styles.content}>
        {/* Hero */}
        <motion.div className={styles.hero} {...fadeUp(0)}>
          <div className={styles.heroLeft}>
            <div className={styles.avatar}>{initiales}</div>
            <div>
              <h1 className={styles.nom}>{employe.prenom} {employe.nom}</h1>
              <p className={styles.poste}>{employe.departmentName ?? '—'}</p>
              <span className={styles.badge} style={{color:cfg.color, background:cfg.bg}}>
                {cfg.label}
              </span>
            </div>
          </div>
          <div className={styles.heroRight}>
            <button className={styles.testBtn} onClick={() => navigate('/test', { state: { employeeId: employe.id } })}>
              <FileText size={16}/> Lancer un test
            </button>
            <button className={styles.rapportBtn} onClick={() => navigate('/rapport', { state: { employeeId: employe.id } })}>
              <Award size={16}/> Voir le rapport
            </button>
          </div>
        </motion.div>

        <div className={styles.grid}>
          {/* Infos */}
          <motion.div className={styles.card} {...fadeUp(0.1)}>
            <h3>Informations</h3>
            <div className={styles.infoList}>
              {[
                { icon:Mail,      val: employe.email ?? '—' },
                { icon:Building2, val: employe.departmentName ?? '—' },
                { icon:Briefcase, val: `Statut : ${cfg.label}` },
              ].map(({ icon:Icon, val }, i) => (
                <div key={i} className={styles.infoRow}>
                  <Icon size={16} className={styles.infoIcon}/>
                  <span>{val}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Score (statut seulement, score SC à venir depuis les rapports) */}
          <motion.div className={styles.card} {...fadeUp(0.15)}>
            <h3>Profil de conformité</h3>
            <div className={styles.scoreCenter}>
              <div className={styles.statutBig} style={{background:cfg.bg, color:cfg.color}}>
                {cfg.label}
              </div>
              <p className={styles.statutNote}>Le Score de Conformité (SC) est calculé après chaque évaluation.</p>
            </div>
            {employe.skills && employe.skills.length > 0 && (
              <div className={styles.scoreDetails}>
                {employe.skills.slice(0,4).map((s,i) => (
                  <div key={i} className={styles.scoreRow}>
                    <span>{s.name}</span>
                    <div className={styles.scoreBar}>
                      <div className={styles.scoreFill}
                        style={{width:`${Math.min(100, (s.yearsXp??1)*15)}%`, background:cfg.color}}/>
                    </div>
                    <span className={styles.scoreVal}>{s.yearsXp ?? '?'} ans</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Radar */}
          <motion.div className={styles.card} {...fadeUp(0.2)}>
            <h3>Profil de compétences</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E7E2DA"/>
                <PolarAngleAxis dataKey="domaine" tick={{fontSize:11, fill:'#78716C'}}/>
                <PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false}/>
                <Radar dataKey="score" stroke="#8B1A2F" fill="#8B1A2F" fillOpacity={0.12} strokeWidth={2}/>
                <Tooltip contentStyle={{background:'#fff',border:'1px solid #E7E2DA',borderRadius:8,fontSize:12}}
                  formatter={v => [`${v}%`]}/>
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Diplômes & Compétences */}
          <motion.div className={styles.card} {...fadeUp(0.25)}>
            <h3><GraduationCap size={16}/> Diplômes</h3>
            {employe.diplomas && employe.diplomas.length > 0 ? (
              <ul className={styles.tagList}>
                {employe.diplomas.map((d, i) => (
                  <li key={i} className={styles.tagItem}>
                    <CheckCircle2 size={14} color="#4A7C59"/>
                    {d.titre} — {d.institution} ({d.annee})
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.noData}>Aucun diplôme enregistré</p>
            )}

            <h3 style={{marginTop:'1.2rem'}}><Award size={16}/> Compétences</h3>
            {employe.skills && employe.skills.length > 0 ? (
              <div className={styles.chips}>
                {employe.skills.map((s, i) => (
                  <span key={i} className={styles.chip}>{s.name}</span>
                ))}
              </div>
            ) : (
              <p className={styles.noData}>Aucune compétence enregistrée</p>
            )}
          </motion.div>

          {/* Boutons d'action */}
          <motion.div className={`${styles.card} ${styles.fullWidth}`} {...fadeUp(0.3)}>
            <h3>Actions</h3>
            <div className={styles.actionsRow}>
              <button className={styles.testBtn}
                onClick={() => navigate('/test', { state: { employeeId: employe.id } })}>
                <FileText size={16}/> Lancer une évaluation
              </button>
              <button className={styles.rapportBtn}
                onClick={() => navigate('/rapport', { state: { employeeId: employe.id } })}>
                <Award size={16}/> Accéder aux rapports
              </button>
              <button className={styles.backBtn2} onClick={() => navigate('/employes')}>
                <ArrowLeft size={16}/> Retour à la liste
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
