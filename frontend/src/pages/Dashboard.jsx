import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  ShieldCheck, Users, Bell, FileText, Settings, LogOut,
  Menu, X, TrendingUp, AlertTriangle, CheckCircle2,
  Plus, ArrowRight, Clock, Loader2, Building2
} from 'lucide-react'
import { dashboardApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import styles from './Dashboard.module.css'

const COLORS = { CONFORME:'#4A7C59', A_SURVEILLER:'#D97706', SUSPECT:'#DC2626', NON_CONFORME:'#7C3AED' }
const LABELS = { CONFORME:'Conformes', A_SURVEILLER:'À surveiller', SUSPECT:'Suspects', NON_CONFORME:'Non conformes' }

const navItems = [
  { id:'dashboard',   label:'Tableau de bord', icon:ShieldCheck, path:'/dashboard' },
  { id:'employes',    label:'Employés',         icon:Users,       path:'/employes' },
  { id:'alertes',     label:'Alertes',          icon:Bell,        path:'/alertes', badge:'!' },
  { id:'rapports',    label:'Rapports',         icon:FileText,    path:'/rapport' },
  { id:'departement', label:'Départements',     icon:Building2,   path:'/departement' },
  { id:'parametres',  label:'Mon profil',       icon:Settings,    path:'/profil' },
]

export default function Dashboard() {
  const navigate    = useNavigate()
  const { user, logout } = useAuth()
  const [open, setOpen]   = useState(true)
  const [active, setActive] = useState('dashboard')
  const [data, setData]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fade = (d=0) => ({ initial:{opacity:0,y:16}, animate:{opacity:1,y:0}, transition:{delay:d,duration:.4} })

  useEffect(() => {
    dashboardApi.rh()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // ── Transformations données API → format graphiques ──
  const donutData = data?.statutsRepartition
    ? Object.entries(data.statutsRepartition).map(([key, val]) => ({
        name:  LABELS[key] || key,
        value: Number(val),
        color: COLORS[key] || '#999',
      }))
    : []

  const barData = data?.top5ScoresBas
    ? data.top5ScoresBas.map(e => ({
        nom:   e.nomFull?.split(' ').map(n => n[0]).join('. ') + '.',
        score: Math.round(e.sc ?? 0),
      }))
    : []

  const totalEmployes  = data?.totalEmployees ?? '—'
  const alertesActives = data?.alertesActives  ?? '—'
  const audits         = data?.auditsThisMonth ?? '—'
  const scoresMoy      = donutData.length
    ? Math.round(donutData.reduce((s, d) => s + d.value, 0) / donutData.length)
    : '—'

  const initiales = `${user?.prenom?.[0] ?? ''}${user?.nom?.[0] ?? ''}`

  return (
    <div className={styles.layout}>
      {/* ── Sidebar ── */}
      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <div className={styles.sidebarTop}>
          {open && <span className={styles.brandName}>ProfilCheck</span>}
          {!open && <ShieldCheck size={20} className={styles.brandIcon}/>}
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
                  {badge && alertesActives > 0 &&
                    <span className={styles.navBadge}>{alertesActives}</span>}
                </span>
              )}
            </button>
          ))}
        </nav>
        <button className={styles.logoutBtn} onClick={() => { logout(); navigate('/login') }}>
          <LogOut size={18}/>{open && <span>Déconnexion</span>}
        </button>
      </aside>

      {/* ── Main ── */}
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
              <Bell size={18}/>
              {alertesActives > 0 && <span className={styles.notifDot}/>}
            </button>
            <div className={styles.avatar}>{initiales || 'RH'}</div>
          </div>
        </header>

        <div className={styles.content}>
          {/* Loading */}
          {loading && (
            <div className={styles.loadingBox}>
              <Loader2 size={28} className={styles.spin}/> Chargement des données…
            </div>
          )}

          {/* Erreur */}
          {error && !loading && (
            <div className={styles.errorBox}>
              ⚠️ {error} — Les données affichées sont indicatives.
            </div>
          )}

          {/* Stats */}
          <div className={styles.statsGrid}>
            {[
              { icon:Users,         label:'Employés évalués',  value: totalEmployes,  delta:'+12', pos:true  },
              { icon:TrendingUp,    label:'Alertes actives',    value: alertesActives, delta:'',    pos:false },
              { icon:AlertTriangle, label:'Tests ce mois',      value: audits,         delta:'+9',  pos:true  },
              { icon:CheckCircle2,  label:'Profils conformes',  value: donutData.find(d=>d.name==='Conformes')?.value ?? '—', delta:'+4', pos:true },
            ].map(({ icon:Icon, label, value, delta, pos }, i) => (
              <motion.div key={i} className={styles.statCard} {...fade(i*.07)}>
                <div className={styles.statTop}>
                  <div className={styles.statIcon}><Icon size={18}/></div>
                  {delta && <span className={`${styles.statDelta} ${pos ? styles.deltaPos : styles.deltaNeg}`}>{delta}</span>}
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
              {donutData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={52} outerRadius={78}
                      dataKey="value" paddingAngle={3}>
                      {donutData.map((d,i) => <Cell key={i} fill={d.color}/>)}
                    </Pie>
                    <Tooltip formatter={(v,n) => [`${v}`,n]}
                      contentStyle={{background:'#fff',border:'1px solid var(--border)',borderRadius:9,fontSize:12}}/>
                    <Legend iconType="circle" iconSize={8}
                      formatter={v => <span style={{fontSize:12,color:'var(--text-mid)'}}>{v}</span>}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className={styles.noData}>Aucune donnée disponible</div>
              )}
            </motion.div>

            <motion.div className={styles.chartCard} {...fade(.32)}>
              <div className={styles.chartTitle}>Top 5 — Profils à surveiller</div>
              <div className={styles.chartSub}>Scores les plus bas</div>
              {barData.length > 0 ? (
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
              ) : (
                <div className={styles.noData}>Aucun profil à risque détecté</div>
              )}
            </motion.div>
          </div>

          {/* Bottom */}
          <div className={styles.bottomRow}>
            <motion.div className={styles.chartCard} {...fade(.36)}>
              <div className={styles.sectionHeader}>
                <div className={styles.chartTitle}>Alertes récentes</div>
                <button className={styles.seeAll} onClick={() => navigate('/alertes')}>
                  Voir tout <ArrowRight size={12}/>
                </button>
              </div>
              {alertesActives > 0 ? (
                <div className={styles.alertsList}>
                  <div className={styles.alertItem} onClick={() => navigate('/alertes')}>
                    <div className={styles.alertDot} style={{background:'#DC2626'}}/>
                    <div className={styles.alertInfo}>
                      <div className={styles.alertNom}>{alertesActives} alerte{alertesActives > 1 ? 's' : ''} active{alertesActives > 1 ? 's' : ''}</div>
                      <div className={styles.alertType}>Nécessite votre attention</div>
                    </div>
                    <div className={styles.alertTime}><Clock size={11}/> Maintenant</div>
                  </div>
                </div>
              ) : (
                <div className={styles.noData}>Aucune alerte active</div>
              )}
            </motion.div>

            <motion.div className={styles.chartCard} {...fade(.40)}>
              <div className={styles.sectionHeader}>
                <div className={styles.chartTitle}>Accès rapide</div>
              </div>
              <div className={styles.quickLinks}>
                {[
                  { label:'Voir tous les employés', path:'/employes', icon:Users },
                  { label:'Lancer une évaluation',  path:'/test',     icon:Plus },
                  { label:'Vue départements',        path:'/departement', icon:Building2 },
                  { label:'Fiches de postes',        path:'/fiches-postes', icon:FileText },
                ].map(({ label, path, icon:Icon }) => (
                  <button key={path} className={styles.quickLink} onClick={() => navigate(path)}>
                    <Icon size={15}/> {label} <ArrowRight size={12}/>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
