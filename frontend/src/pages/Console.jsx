import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { ShieldCheck, Users, Bell, FileText, Settings, LogOut, Zap, Database, CheckCircle2 } from 'lucide-react'
import styles from './Console.module.css'

const profils = [
  { label:'Profil Suspect',          desc:'Score faible, incohérences CV détectées', color:'#DC2626', data:{ st:22, se:30, sd:45, sc:28 } },
  { label:'Développeur Senior Java', desc:'Profil expert, très fort en technique',   color:'#4A7C59', data:{ st:91, se:85, sd:92, sc:88 } },
  { label:'Analyste Données Junior', desc:'Bon potentiel, expérience limitée',        color:'#D97706', data:{ st:68, se:55, sd:72, sc:70 } },
  { label:'Non conforme',            desc:'Score critique, procédure disciplinaire',  color:'#7C3AED', data:{ st:18, se:22, sd:38, sc:20 } },
]

const getStatut = sc => {
  if (sc >= 90) return { label:'Excellent',    color:'#4A7C59', bg:'#E6F4EC' }
  if (sc >= 70) return { label:'Conforme',     color:'#2563EB', bg:'#EFF6FF' }
  if (sc >= 50) return { label:'À surveiller', color:'#D97706', bg:'#FEF3C7' }
  if (sc >= 30) return { label:'Suspect',      color:'#DC2626', bg:'#FEE2E2' }
  return             { label:'Non conforme',   color:'#7C3AED', bg:'#F3E8FF' }
}

export default function Console() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [sliders, setSliders]   = useState({ st:70, se:68, sd:80, sc:74 })
  const [injected, setInjected] = useState(null)
  const [loading, setLoading]   = useState(null)

  const SC = parseFloat((0.40*sliders.st + 0.25*sliders.se + 0.20*sliders.sd + 0.15*sliders.sc).toFixed(1))
  const statut = getStatut(SC)

  const injecter = async (p, i) => {
    setLoading(i)
    await new Promise(r => setTimeout(r, 1000))
    setSliders(p.data)
    setInjected(i)
    setLoading(null)
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}><ShieldCheck size={20}/><span>ProfilCheck</span></div>
        <nav className={styles.nav}>
          {[
            { icon:ShieldCheck, label:'Dashboard',  path:'/dashboard' },
            { icon:Users,       label:'Employés',   path:'/employes' },
            { icon:Bell,        label:'Alertes',    path:'/alertes', badge:8 },
            { icon:FileText,    label:'Rapports',   path:'/rapport' },
            { icon:Settings,    label:'Console',    path:'/console', active:true },
          ].map(({ icon:Icon, label, path, active, badge }) => (
            <button key={label} className={`${styles.navItem} ${active?styles.navActive:''}`} onClick={() => navigate(path)}>
              <Icon size={18}/><span>{label}</span>
              {badge && <span className={styles.navBadge}>{badge}</span>}
            </button>
          ))}
        </nav>
        <button className={styles.logoutBtn} onClick={() => { logout(); navigate('/login') }}>
          <LogOut size={18}/><span>Déconnexion</span>
        </button>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <p className={styles.headerLabel}>Administration</p>
            <h2 className={styles.pageTitle}>Console technique</h2>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.grid}>
            {/* Bloc 1 — Injection de profils */}
            <motion.div className={styles.card} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:.1}}>
              <div className={styles.cardHeader}>
                <Database size={18} color="var(--bordeaux)"/>
                <h3>Injection de profils de test</h3>
              </div>
              <p className={styles.cardDesc}>Injectez instantanément un profil pré-configuré pour tester le moteur de conformité.</p>
              <div className={styles.profilGrid}>
                {profils.map((p, i) => (
                  <motion.button key={i} className={`${styles.profilBtn} ${injected===i?styles.profilActive:''}`}
                    onClick={() => injecter(p, i)}
                    whileHover={{scale:1.02}} whileTap={{scale:.97}}>
                    <div className={styles.profilDot} style={{background:p.color}}/>
                    <div className={styles.profilInfo}>
                      <span className={styles.profilLabel}>{p.label}</span>
                      <span className={styles.profilDesc}>{p.desc}</span>
                    </div>
                    {loading === i ? (
                      <span className={styles.spin}>⚙</span>
                    ) : injected === i ? (
                      <CheckCircle2 size={16} color="var(--success)"/>
                    ) : (
                      <Zap size={15} color="var(--text-light)"/>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Bloc 2 — Simulateur SC */}
            <motion.div className={styles.card} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:.2}}>
              <div className={styles.cardHeader}>
                <Zap size={18} color="var(--terracotta)"/>
                <h3>Simulateur du Score de Conformité</h3>
              </div>
              <p className={styles.cardDesc}>
                Ajustez les 4 composantes pour calculer le SC en temps réel.
                <br/><code className={styles.formula}>SC = 0.40×ST + 0.25×SE + 0.20×SD + 0.15×SCoh</code>
              </p>

              <div className={styles.slidersGrid}>
                {[
                  { key:'st', label:'Score Test IA',    poids:'40%' },
                  { key:'se', label:'Score Expérience', poids:'25%' },
                  { key:'sd', label:'Score Diplômes',   poids:'20%' },
                  { key:'sc', label:'Score Cohérence',  poids:'15%' },
                ].map(({ key, label, poids }) => (
                  <div key={key} className={styles.sliderRow}>
                    <div className={styles.sliderInfo}>
                      <span className={styles.sliderLabel}>{label}</span>
                      <div className={styles.sliderRight}>
                        <span className={styles.sliderPoids}>{poids}</span>
                        <span className={styles.sliderVal}>{sliders[key]}%</span>
                      </div>
                    </div>
                    <input type="range" min="0" max="100" value={sliders[key]}
                      onChange={e => setSliders(s => ({...s,[key]:Number(e.target.value)}))}
                      className={styles.slider}
                      style={{'--pct': `${sliders[key]}%`}}
                    />
                  </div>
                ))}
              </div>

              {/* Résultat */}
              <div className={styles.result}>
                <div className={styles.resultLeft}>
                  <div className={styles.resultLabel}>Score de Conformité calculé</div>
                  <motion.div className={styles.resultValue} key={SC}
                    initial={{scale:1.15,opacity:.5}} animate={{scale:1,opacity:1}} transition={{duration:.3}}>
                    {SC}%
                  </motion.div>
                </div>
                <div className={styles.resultRight}>
                  <svg viewBox="0 0 100 100" width="100" height="100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="10"/>
                    <circle cx="50" cy="50" r="40" fill="none"
                      stroke={statut.color} strokeWidth="10"
                      strokeDasharray={`${2*Math.PI*40}`}
                      strokeDashoffset={`${2*Math.PI*40*(1-SC/100)}`}
                      strokeLinecap="round" transform="rotate(-90 50 50)"
                      style={{transition:'stroke-dashoffset .5s ease, stroke .3s'}}
                    />
                  </svg>
                  <span className={styles.statutPill} style={{color:statut.color,background:statut.bg}}>
                    {statut.label}
                  </span>
                </div>
              </div>

              {/* Barres composantes */}
              <div className={styles.composantes}>
                {[
                  { key:'st', label:'Test',        val:sliders.st, poids:.40 },
                  { key:'se', label:'Expérience',  val:sliders.se, poids:.25 },
                  { key:'sd', label:'Diplômes',    val:sliders.sd, poids:.20 },
                  { key:'sc', label:'Cohérence',   val:sliders.sc, poids:.15 },
                ].map(c => (
                  <div key={c.key} className={styles.compRow}>
                    <span className={styles.compLabel}>{c.label}</span>
                    <div className={styles.compBar}>
                      <motion.div className={styles.compFill}
                        animate={{width:`${c.val}%`}} transition={{duration:.3}}
                        style={{background:`color-mix(in srgb, var(--bordeaux) ${c.val}%, var(--border))`}}
                      />
                    </div>
                    <span className={styles.compContrib}>{(c.val*c.poids).toFixed(1)} pts</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
