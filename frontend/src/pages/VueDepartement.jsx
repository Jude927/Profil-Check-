import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck, Users, Bell, FileText, Settings, LogOut,
  Building2, TrendingUp, AlertTriangle, CheckCircle2, Clock, Activity, ChevronRight
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import styles from './VueDepartement.module.css'

const depts = ['Tous', 'Tech', 'Data', 'Finance', 'Infra', 'RH']

const employesParDept = {
  Tech:    [
    { nom:'Alice Morin',    score:88, statut:'conforme',    poste:'Développeur Senior' },
    { nom:'Kevin Torres',   score:72, statut:'conforme',    poste:'DevOps Engineer' },
    { nom:'Léa Blanc',      score:56, statut:'surveiller',  poste:'Développeur Junior' },
    { nom:'Nathan Roy',     score:91, statut:'conforme',    poste:'Lead Architect' },
  ],
  Data:    [
    { nom:'Marc Dupont',    score:65, statut:'surveiller',  poste:'Data Analyst' },
    { nom:'Sofia Leroy',    score:78, statut:'conforme',    poste:'Data Scientist' },
    { nom:'Hugo Petit',     score:42, statut:'suspect',     poste:'Data Engineer' },
  ],
  Finance: [
    { nom:'Clara Marin',    score:80, statut:'conforme',    poste:'Contrôleur de gestion' },
    { nom:'Pierre Faure',   score:35, statut:'suspect',     poste:'Analyste financier' },
    { nom:'Nadia Blanc',    score:74, statut:'conforme',    poste:'Comptable senior' },
  ],
  Infra:   [
    { nom:'Julien Simon',   score:55, statut:'surveiller',  poste:'Admin Système' },
    { nom:'Yasmine Karim',  score:68, statut:'surveiller',  poste:'Network Engineer' },
    { nom:'Eric Morel',     score:82, statut:'conforme',    poste:'Cloud Architect' },
  ],
  RH:      [
    { nom:'Sophie Renard',  score:90, statut:'conforme',    poste:'Gestionnaire RH' },
    { nom:'Thomas Bernard', score:48, statut:'suspect',     poste:'Chargé de recrutement' },
  ],
}

const allEmployes = Object.entries(employesParDept).flatMap(([dept, emps]) =>
  emps.map(e => ({ ...e, dept }))
)

const statutCfg = {
  conforme:   { color:'var(--success)', bg:'#E6F4EC', label:'Conforme' },
  surveiller: { color:'var(--warning)', bg:'#FEF3C7', label:'À surveiller' },
  suspect:    { color:'var(--danger)',  bg:'#FEE2E2', label:'Suspect' },
}

const liveEvents = [
  { msg:'Test terminé — Alice Morin (Tech) · 88%', type:'ok' },
  { msg:'Alerte déclenchée — Hugo Petit (Data) · Score < 50', type:'warn' },
  { msg:'Profil mis à jour — Clara Marin (Finance)', type:'info' },
  { msg:'Nouvelle connexion — Julien Simon (Infra)', type:'info' },
  { msg:'Rapport exporté — Sophie Renard (RH)', type:'ok' },
  { msg:'Score critique — Thomas Bernard (RH) · 48%', type:'warn' },
  { msg:'Test lancé — Marc Dupont (Data)', type:'info' },
  { msg:'Directive appliquée — Plan formation SQL (Infra)', type:'ok' },
]

export default function VueDepartement() {
  const navigate = useNavigate()
  const [deptSel, setDeptSel] = useState('Tous')
  const [feed, setFeed]       = useState(liveEvents.slice(0, 3))
  const [pulse, setPulse]     = useState(false)

  // Simule SSE live
  useEffect(() => {
    let i = 3
    const interval = setInterval(() => {
      const ev = liveEvents[i % liveEvents.length]
      setFeed(f => [ev, ...f].slice(0, 6))
      setPulse(true)
      setTimeout(() => setPulse(false), 600)
      i++
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  const employes = deptSel === 'Tous' ? allEmployes : employesParDept[deptSel] || []

  const avg     = Math.round(employes.reduce((s,e) => s + e.score, 0) / (employes.length || 1))
  const nConf   = employes.filter(e => e.statut === 'conforme').length
  const nAlert  = employes.filter(e => e.statut === 'suspect').length
  const nSurv   = employes.filter(e => e.statut === 'surveiller').length

  const chartData = depts.slice(1).map(d => {
    const emps = employesParDept[d] || []
    return {
      dept: d,
      moy: Math.round(emps.reduce((s,e) => s+e.score,0) / (emps.length||1)),
    }
  })

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}><ShieldCheck size={20}/><span>ProfilCheck</span></div>
        <nav className={styles.nav}>
          {[
            { icon:ShieldCheck, label:'Dashboard',     path:'/dashboard' },
            { icon:Building2,   label:'Départements',  path:'/departement', active:true },
            { icon:Users,       label:'Employés',      path:'/employes' },
            { icon:Bell,        label:'Alertes',       path:'/alertes', badge:8 },
            { icon:FileText,    label:'Rapports',      path:'/rapport' },
            { icon:Settings,    label:'Console',       path:'/console' },
          ].map(({ icon:Icon, label, path, active, badge }) => (
            <button key={label} className={`${styles.navItem} ${active?styles.navActive:''}`}
              onClick={() => navigate(path)}>
              <Icon size={18}/><span>{label}</span>
              {badge && <span className={styles.navBadge}>{badge}</span>}
            </button>
          ))}
        </nav>
        <button className={styles.logoutBtn} onClick={() => navigate('/login')}>
          <LogOut size={18}/><span>Déconnexion</span>
        </button>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <p className={styles.headerLabel}>Supervision</p>
            <h2 className={styles.pageTitle}>Vue par département</h2>
          </div>
          <div className={`${styles.liveDot} ${pulse ? styles.livePulse : ''}`}>
            <span className={styles.liveDotIcon}/> Live
          </div>
        </header>

        <div className={styles.content}>
          {/* Tabs depts */}
          <div className={styles.tabs}>
            {depts.map(d => (
              <button key={d} className={`${styles.tab} ${deptSel===d?styles.tabActive:''}`}
                onClick={() => setDeptSel(d)}>{d}</button>
            ))}
          </div>

          {/* KPIs */}
          <div className={styles.kpiRow}>
            {[
              { icon:Users,         label:'Employés',    value: employes.length,  color:'var(--bordeaux)' },
              { icon:CheckCircle2,  label:'Conformes',   value: nConf,            color:'var(--success)' },
              { icon:Clock,         label:'À surveiller',value: nSurv,            color:'var(--warning)' },
              { icon:AlertTriangle, label:'Suspects',    value: nAlert,           color:'var(--danger)' },
              { icon:TrendingUp,    label:'Score moyen', value: avg + '%',        color:'var(--bordeaux)' },
            ].map(k => {
              const Icon = k.icon
              return (
                <motion.div key={k.label} className={styles.kpiCard}
                  initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}>
                  <div className={styles.kpiIcon} style={{background: k.color + '18', color: k.color}}>
                    <Icon size={18}/>
                  </div>
                  <div>
                    <div className={styles.kpiVal} style={{color: k.color}}>{k.value}</div>
                    <div className={styles.kpiLabel}>{k.label}</div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className={styles.grid}>
            {/* Table employés */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <Users size={16} color="var(--bordeaux)"/>
                Employés — {deptSel}
              </h3>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Nom</th>
                      {deptSel === 'Tous' && <th>Dept</th>}
                      <th>Poste</th>
                      <th>Score SC</th>
                      <th>Statut</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {employes.map((e, i) => {
                        const cfg = statutCfg[e.statut]
                        return (
                          <motion.tr key={e.nom+i}
                            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                            transition={{delay: i * .04}}>
                            <td className={styles.nomCell}>
                              <div className={styles.avatar}>
                                {e.nom.split(' ').map(n=>n[0]).join('').slice(0,2)}
                              </div>
                              {e.nom}
                            </td>
                            {deptSel === 'Tous' && <td className={styles.deptBadge}>{e.dept}</td>}
                            <td>{e.poste}</td>
                            <td>
                              <div className={styles.scoreCell}>
                                <div className={styles.scoreBar}>
                                  <div className={styles.scoreFill}
                                    style={{width:`${e.score}%`, background: e.score>=70?'var(--success)':e.score>=50?'var(--warning)':'var(--danger)'}}/>
                                </div>
                                <span>{e.score}%</span>
                              </div>
                            </td>
                            <td>
                              <span className={styles.statBadge} style={{color:cfg.color, background:cfg.bg}}>
                                {cfg.label}
                              </span>
                            </td>
                            <td>
                              <button className={styles.viewBtn} onClick={() => navigate('/employe')}>
                                <ChevronRight size={14}/>
                              </button>
                            </td>
                          </motion.tr>
                        )
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right col */}
            <div className={styles.rightCol}>
              {/* Chart */}
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>
                  <TrendingUp size={16} color="var(--bordeaux)"/>
                  Score moyen par département
                </h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartData} barSize={24}>
                    <XAxis dataKey="dept" tick={{fontSize:11, fill:'var(--text-mid)'}} axisLine={false} tickLine={false}/>
                    <YAxis domain={[0,100]} tick={{fontSize:10, fill:'var(--text-light)'}} axisLine={false} tickLine={false}/>
                    <Tooltip
                      contentStyle={{background:'#fff', border:'1px solid var(--border)', borderRadius:8, fontSize:12}}
                      formatter={v => [`${v}%`, 'Score moy.']}
                    />
                    <Bar dataKey="moy" radius={[5,5,0,0]}>
                      {chartData.map((e,i) => (
                        <Cell key={i} fill={e.moy>=70?'#4A7C59':e.moy>=50?'#D97706':'#DC2626'}/>
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Live feed */}
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>
                  <Activity size={16} color="var(--bordeaux)"/>
                  Activité en direct
                  <span className={styles.liveTag}>LIVE</span>
                </h3>
                <div className={styles.feed}>
                  <AnimatePresence>
                    {feed.map((ev, i) => (
                      <motion.div key={ev.msg+i} className={`${styles.feedItem} ${styles['feed_'+ev.type]}`}
                        initial={{opacity:0, x: -12}} animate={{opacity:1, x:0}} exit={{opacity:0}}
                        transition={{duration:.3}}>
                        <span className={styles.feedDot}/>
                        <span>{ev.msg}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
