import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShieldCheck, Users, Bell, FileText, Settings, LogOut,
  Search, ChevronRight, Plus, CheckCircle2, AlertCircle,
  XCircle, Loader2, Building2
} from 'lucide-react'
import { employeesApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import styles from './Employes.module.css'

// Map statuts backend → config affichage
const statutCfg = {
  CONFORME:     { label:'Conforme',     color:'#2563EB', bg:'#EFF6FF', icon:CheckCircle2 },
  A_SURVEILLER: { label:'À surveiller', color:'#D97706', bg:'#FEF3C7', icon:AlertCircle  },
  SUSPECT:      { label:'Suspect',      color:'#DC2626', bg:'#FEE2E2', icon:AlertCircle  },
  NON_CONFORME: { label:'Non conforme', color:'#7C3AED', bg:'#F3E8FF', icon:XCircle      },
  // fallback pour données mockées éventuelles
  conforme:     { label:'Conforme',     color:'#2563EB', bg:'#EFF6FF', icon:CheckCircle2 },
  surveiller:   { label:'À surveiller', color:'#D97706', bg:'#FEF3C7', icon:AlertCircle  },
  suspect:      { label:'Suspect',      color:'#DC2626', bg:'#FEE2E2', icon:AlertCircle  },
  nonconforme:  { label:'Non conforme', color:'#7C3AED', bg:'#F3E8FF', icon:XCircle      },
  excellent:    { label:'Excellent',    color:'#4A7C59', bg:'#E6F4EC', icon:CheckCircle2 },
}

const statuts = ['Tous', 'CONFORME', 'A_SURVEILLER', 'SUSPECT', 'NON_CONFORME']

export default function Employes() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [employes, setEmployes] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  const [search, setSearch]         = useState('')
  const [statutFilter, setStatut]   = useState('Tous')
  const [sortBy, setSortBy]         = useState('nom')
  const [sortDir, setSortDir]       = useState('asc')

  useEffect(() => {
    const params = {}
    if (statutFilter !== 'Tous') params.statut = statutFilter

    employeesApi.list(params)
      .then(setEmployes)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [statutFilter])

  const toggleSort = col => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('desc') }
  }

  const filtered = employes
    .filter(e => {
      const q = search.toLowerCase()
      return (
        (e.nom?.toLowerCase().includes(q) ||
         e.prenom?.toLowerCase().includes(q) ||
         e.departmentName?.toLowerCase().includes(q))
      )
    })
    .sort((a, b) => {
      let va = a[sortBy] ?? ''; let vb = b[sortBy] ?? ''
      if (typeof va === 'string') va = va.toLowerCase()
      if (typeof vb === 'string') vb = vb.toLowerCase()
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
    })

  const stats = {
    total:     employes.length,
    conformes: employes.filter(e => e.statut === 'CONFORME').length,
    alertes:   employes.filter(e => ['SUSPECT','NON_CONFORME'].includes(e.statut)).length,
  }

  const getInitials = (e) => `${e.prenom?.[0] ?? ''}${e.nom?.[0] ?? ''}`.toUpperCase()

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}><ShieldCheck size={20}/><span>ProfilCheck</span></div>
        <nav className={styles.nav}>
          {[
            { icon:ShieldCheck, label:'Dashboard',   path:'/dashboard' },
            { icon:Users,       label:'Employés',    path:'/employes', active:true },
            { icon:Bell,        label:'Alertes',     path:'/alertes' },
            { icon:FileText,    label:'Rapports',    path:'/rapport' },
            { icon:Building2,   label:'Départements',path:'/departement' },
            { icon:Settings,    label:'Mon profil',  path:'/profil' },
          ].map(({ icon:Icon, label, path, active }) => (
            <button key={label} className={`${styles.navItem} ${active?styles.navActive:''}`}
              onClick={() => navigate(path)}>
              <Icon size={18}/><span>{label}</span>
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
            <p className={styles.headerLabel}>RH</p>
            <h2 className={styles.pageTitle}>Liste des employés</h2>
          </div>
          <motion.button className={styles.addBtn} onClick={() => navigate('/test')}
            whileHover={{scale:1.02}} whileTap={{scale:.97}}>
            <Plus size={15}/> Lancer un test
          </motion.button>
        </header>

        <div className={styles.content}>
          {/* Stats */}
          <div className={styles.statsRow}>
            {[
              { label:'Total', value: stats.total },
              { label:'Conformes', value: stats.conformes, color:'var(--success)' },
              { label:'Alertes', value: stats.alertes, color:'var(--danger)' },
              { label:'Filtrés', value: filtered.length },
            ].map(s => (
              <div key={s.label} className={styles.statCard}>
                <span className={styles.statVal} style={{color: s.color||'var(--bordeaux)'}}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Filtres */}
          <div className={styles.filters}>
            <div className={styles.searchWrap}>
              <Search size={15} className={styles.searchIcon}/>
              <input placeholder="Rechercher par nom, prénom, département…"
                value={search} onChange={e => setSearch(e.target.value)}
                className={styles.searchInput}/>
            </div>
            <div className={styles.statutFilters}>
              {statuts.map(s => (
                <button key={s}
                  className={`${styles.statutPill} ${statutFilter===s?styles.statutActive:''}`}
                  onClick={() => setStatut(s)}>
                  {s === 'Tous' ? 'Tous' : (statutCfg[s]?.label ?? s)}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className={styles.tableWrap}>
            {loading ? (
              <div className={styles.loadingBox}>
                <Loader2 size={24} className={styles.spin}/> Chargement…
              </div>
            ) : error ? (
              <div className={styles.errorBox}>⚠️ {error}</div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    {[
                      { key:'nom',   label:'Employé' },
                      { key:'departmentName', label:'Département' },
                      { key:'statut', label:'Statut' },
                      { key:'',      label:'' },
                    ].map(h => (
                      <th key={h.key} onClick={() => h.key && toggleSort(h.key)}
                        style={{cursor: h.key ? 'pointer' : 'default'}}>
                        {h.label} {h.key && sortBy===h.key ? (sortDir==='asc'?'↑':'↓') : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e, i) => {
                    const cfg = statutCfg[e.statut] ?? statutCfg.CONFORME
                    const Icon = cfg.icon
                    return (
                      <motion.tr key={e.id}
                        initial={{opacity:0, y:6}} animate={{opacity:1, y:0}}
                        transition={{delay: i * .03}}
                        onClick={() => navigate(`/employe/${e.id}`)}
                        style={{cursor:'pointer'}}>
                        <td>
                          <div className={styles.empCell}>
                            <div className={styles.avatar}>{getInitials(e)}</div>
                            <div>
                              <div className={styles.empNom}>{e.prenom} {e.nom}</div>
                            </div>
                          </div>
                        </td>
                        <td className={styles.empDept}>{e.departmentName ?? '—'}</td>
                        <td>
                          <span className={styles.statutBadge}
                            style={{color:cfg.color, background:cfg.bg}}>
                            <Icon size={12}/> {cfg.label}
                          </span>
                        </td>
                        <td>
                          <button className={styles.viewBtn}
                            onClick={ev => { ev.stopPropagation(); navigate(`/employe/${e.id}`) }}>
                            Voir <ChevronRight size={13}/>
                          </button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            )}
            {!loading && !error && filtered.length === 0 && (
              <p className={styles.empty}>Aucun employé trouvé.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
