import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  ShieldCheck, Users, Bell, FileText, Settings, LogOut,
  Menu, X, TrendingUp, AlertTriangle, CheckCircle2,
  Plus, ArrowRight, Clock
} from 'lucide-react'
import styles from './Dashboard.module.css'

const donutData = [
  { name: 'Conformes',    value: 58, color: '#4A7C59' },
  { name: 'À surveiller', value: 27, color: '#D97706' },
  { name: 'Suspects',     value: 15, color: '#DC2626' },
]

const barData = [
  { nom: 'Omar Sy',      score: 23 },
  { nom: 'L. Petit',    score: 41 },
  { nom: 'T. Garnier',  score: 49 },
  { nom: 'A. Diallo',   score: 58 },
  { nom: 'Y. Bernard',  score: 66 },
]

const alertes = [
  { nom:'Omar Sy',      type:'Non conforme',   time:'Il y a 5h', color:'#7C3AED' },
  { nom:'Lucas Petit',  type:'Profil suspect',  time:'Il y a 2h', color:'#DC2626' },
  { nom:'T. Garnier',   type:'Profil suspect',  time:'Hier',      color:'#DC2626' },
  { nom:'Amara Diallo', type:'À surveiller',    time:'Hier',      color:'#D97706' },
]

const evals = [
  { av:'SM', nom:'Sophie Martin',  poste:'Dev Senior',       score:92, statut:'Excellent',    color:'#4A7C59', date:'08/06/2026' },
  { av:'KD', nom:'Kevin Dubois',   poste:'Chef de projet',   score:74, statut:'Conforme',     color:'#2563EB', date:'07/06/2026' },
  { av:'AD', nom:'Amara Diallo',   poste:'Analyste données', score:58, statut:'À surveiller', color:'#D97706', date:'06/06/2026' },
  { av:'LP', nom:'Lucas Petit',    poste:'DevOps',           score:41, statut:'Suspect',      color:'#DC2626', date:'05/06/2026' },
  { av:'IF', nom:'Inès Fontaine',  poste:'Designer UX',      score:87, statut:'Conforme',     color:'#2563EB', date:'04/06/2026' },
]

const navItems = [
  { id:'dashboard',    label:'Tableau de bord', icon:ShieldCheck, path:'/dashboard' },
  { id:'employes',     label:'Employés',         icon:Users,       path:'/employes'  },
  { id:'alertes',      label:'Alertes',          icon:Bell,        path:'/alertes',  badge:8 },
  { id:'rapports',     label:'Rapports',         icon:FileText,    path:'/rapport'   },
  { id:'departement',  label:'Départements',     icon:Settings,    path:'/departement' },
  { id:'parametres',   label:'Mon profil',       icon:Settings,    path:'/profil'    },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [open, setOpen]       = useState(true)
  const [active, setActive]   = useState('dashboard')

  const fade = (d=0) => ({ initial:{opacity:0,y:16}, animate:{opacity:1,y:0}, transition:{delay:d,duration:.4} })

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <div className={styles.sidebarTop}>
          {open && <span className={styles.brandName}>ProfilCheck</span>}
          {!open && <ShieldCheck size={20} className={styles.brandIcon} />}
          <button className={styles.toggleBtn} onClick={() => setOpen(o => !o)}>
            {open ? <X size={16}/> : <Menu size={16}/>}
          </button>
        </div>

        <nav className={styles.nav}>
          {navItems.map(({ id, label, icon:Icon, path, badge }) => (
            <button key={id}
              className={`${styles.navItem} ${active===id ? styles.navActive : ''}`}
              onClick={() => { setActive(id); navigate(path) }}>
              <Icon size={18}/>
              {open && (
                <span className={styles.navLabel}>
                  {label}
                  {badge && <span className={styles.navBadge}>{badge}</span>}
                </span>
              )}
            </button>
          ))}
        </nav>

        <button className={styles.logoutBtn} onClick={() => navigate('/login')}>
          <LogOut size={18}/>{open && <span>Déconnexion</span>}
        </button>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h2 className={styles.pageTitle}>Tableau de bord RH</h2>
            <p className={styles.pageDate}>
              {new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
            </p>
          </div>
          <div className={styles.headerRight}>
            <motion.button className={styles.launchBtn} onClick={() => navigate('/test')}
              whileHover={{scale:1.02}} whileTap={{scale:.97}}>
              <Plus size={15}/> Lancer un test
            </motion.button>
            <button className={styles.notifBtn} onClick={() => navigate('/alertes')}>
              <Bell size={18}/><span className={styles.notifDot}/>
            </button>
            <div className={styles.avatar}>SR</div>
          </div>
        </header>

        <div className={styles.content}>
          {/* Stats */}
          <div className={styles.statsGrid}>
            {[
              { icon:Users,         label:'Employés évalués',  value:'124', delta:'+12', pos:true  },
              { icon:TrendingUp,    label:'Score moyen',        value:'73%', delta:'+4%', pos:true  },
              { icon:AlertTriangle, label:'Alertes actives',    value:'8',   delta:'+3',  pos:false },
              { icon:CheckCircle2,  label:'Rapports générés',   value:'47',  delta:'+9',  pos:true  },
            ].map(({ icon:Icon, label, value, delta, pos }, i) => (
              <motion.div key={i} className={styles.statCard} {...fade(i*.07)}>
                <div className={styles.statTop}>
                  <div className={styles.statIcon}><Icon size={18}/></div>
                  <span className={`${styles.statDelta} ${pos ? styles.deltaPos : styles.deltaNeg}`}>{delta}</span>
                </div>
                <div>
                  <div className={styles.statValue}>{value}</div>
                  <div className={styles.statLabel}>{label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className={styles.chartsRow}>
            <motion.div className={styles.chartCard} {...fade(.28)}>
              <div className={styles.chartTitle}>Répartition des profils</div>
              <div className={styles.chartSub}>Par statut de conformité</div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={52} outerRadius={78}
                    dataKey="value" paddingAngle={3}>
                    {donutData.map((d,i) => <Cell key={i} fill={d.color}/>)}
                  </Pie>
                  <Tooltip formatter={(v,n) => [`${v}%`,n]}
                    contentStyle={{background:'#fff',border:'1px solid var(--border)',borderRadius:9,fontSize:12}}/>
                  <Legend iconType="circle" iconSize={8}
                    formatter={v => <span style={{fontSize:12,color:'var(--text-mid)'}}>{v}</span>}/>
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div className={styles.chartCard} {...fade(.32)}>
              <div className={styles.chartTitle}>Top 5 — Profils à surveiller</div>
              <div className={styles.chartSub}>Scores les plus bas</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} layout="vertical" barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE3" horizontal={false}/>
                  <XAxis type="number" domain={[0,100]} tick={{fontSize:11,fill:'#78716C'}} axisLine={false} tickLine={false}/>
                  <YAxis type="category" dataKey="nom" tick={{fontSize:12,fill:'#78716C'}} axisLine={false} tickLine={false} width={80}/>
                  <Tooltip formatter={v=>[`${v}%`]}
                    contentStyle={{background:'#fff',border:'1px solid var(--border)',borderRadius:9,fontSize:12}}/>
                  <Bar dataKey="score" fill="var(--bordeaux)" radius={[0,6,6,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Bottom */}
          <div className={styles.bottomRow}>
            {/* Alertes */}
            <motion.div className={styles.chartCard} {...fade(.36)}>
              <div className={styles.sectionHeader}>
                <div className={styles.chartTitle}>Alertes récentes</div>
                <button className={styles.seeAll} onClick={() => navigate('/alertes')}>
                  Voir tout <ArrowRight size={12}/>
                </button>
              </div>
              <div className={styles.alertsList}>
                {alertes.map((a,i) => (
                  <div key={i} className={styles.alertItem} onClick={() => navigate('/alertes')}>
                    <div className={styles.alertDot} style={{background:a.color}}/>
                    <div className={styles.alertInfo}>
                      <div className={styles.alertNom}>{a.nom}</div>
                      <div className={styles.alertType}>{a.type}</div>
                    </div>
                    <div className={styles.alertTime}><Clock size={11}/>{a.time}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Table */}
            <motion.div className={styles.chartCard} {...fade(.40)}>
              <div className={styles.sectionHeader}>
                <div className={styles.chartTitle}>Dernières évaluations</div>
              </div>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {['Employé','Poste','Score','Statut','Date',''].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {evals.map((e,i) => (
                    <tr key={i}>
                      <td>
                        <div className={styles.empCell}>
                          <div className={styles.empAvatar}>{e.av}</div>
                          <span className={styles.empNom}>{e.nom}</span>
                        </div>
                      </td>
                      <td className={styles.empPoste}>{e.poste}</td>
                      <td>
                        <div className={styles.scoreCell}>
                          <div className={styles.scoreBar}>
                            <div className={styles.scoreFill} style={{width:`${e.score}%`,background:e.color}}/>
                          </div>
                          <span className={styles.scoreNum}>{e.score}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.statutBadge} style={{color:e.color,background:e.color+'18'}}>
                          {e.statut}
                        </span>
                      </td>
                      <td style={{fontSize:'.78rem',color:'var(--text-mid)'}}>{e.date}</td>
                      <td>
                        <button className={styles.viewBtn} onClick={() => navigate('/employe')}>
                          Voir <ArrowRight size={11}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
