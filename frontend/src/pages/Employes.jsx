import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShieldCheck, Users, Bell, FileText, Settings, LogOut,
  Search, Filter, ChevronRight, Plus, TrendingUp,
  CheckCircle2, AlertCircle, XCircle, Download
} from 'lucide-react'
import styles from './Employes.module.css'

const employes = [
  { id:1, nom:'Sophie Martin',   poste:'Dev Senior',        dept:'Tech',    score:92, statut:'excellent',   date:'08/06/2026', avatar:'SM' },
  { id:2, nom:'Kevin Dubois',    poste:'Chef de projet',    dept:'Tech',    score:74, statut:'conforme',    date:'07/06/2026', avatar:'KD' },
  { id:3, nom:'Amara Diallo',    poste:'Analyste données',  dept:'Data',    score:58, statut:'surveiller',  date:'06/06/2026', avatar:'AD' },
  { id:4, nom:'Lucas Petit',     poste:'DevOps',            dept:'Infra',   score:41, statut:'suspect',     date:'05/06/2026', avatar:'LP' },
  { id:5, nom:'Inès Fontaine',   poste:'Designer UX',       dept:'Design',  score:87, statut:'conforme',    date:'04/06/2026', avatar:'IF' },
  { id:6, nom:'Omar Sy',         poste:'Comptable',         dept:'Finance', score:23, statut:'nonconforme', date:'03/06/2026', avatar:'OS' },
  { id:7, nom:'Camille Leroux',  poste:'RH Manager',        dept:'RH',      score:81, statut:'conforme',    date:'02/06/2026', avatar:'CL' },
  { id:8, nom:'Yann Bernard',    poste:'Data Engineer',     dept:'Data',    score:66, statut:'surveiller',  date:'01/06/2026', avatar:'YB' },
  { id:9, nom:'Fatou Ndiaye',    poste:'Product Manager',   dept:'Produit', score:95, statut:'excellent',   date:'30/05/2026', avatar:'FN' },
  { id:10,nom:'Thomas Garnier',  poste:'Développeur Java',  dept:'Tech',    score:49, statut:'suspect',     date:'29/05/2026', avatar:'TG' },
]

const statutCfg = {
  excellent:   { label:'Excellent',    color:'#4A7C59', bg:'#E6F4EC', icon:CheckCircle2 },
  conforme:    { label:'Conforme',     color:'#2563EB', bg:'#EFF6FF', icon:CheckCircle2 },
  surveiller:  { label:'À surveiller', color:'#D97706', bg:'#FEF3C7', icon:AlertCircle  },
  suspect:     { label:'Suspect',      color:'#DC2626', bg:'#FEE2E2', icon:AlertCircle  },
  nonconforme: { label:'Non conforme', color:'#7C3AED', bg:'#F3E8FF', icon:XCircle      },
}

const depts = ['Tous', 'Tech', 'Data', 'Design', 'Finance', 'RH', 'Infra', 'Produit']
const statuts = ['Tous', 'excellent', 'conforme', 'surveiller', 'suspect', 'nonconforme']

export default function Employes() {
  const navigate = useNavigate()
  const [search, setSearch]     = useState('')
  const [deptFilter, setDept]   = useState('Tous')
  const [statutFilter, setStatut] = useState('Tous')
  const [sortBy, setSortBy]     = useState('score')
  const [sortDir, setSortDir]   = useState('desc')

  const toggleSort = col => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('desc') }
  }

  const filtered = employes
    .filter(e => {
      const q = search.toLowerCase()
      return (
        (e.nom.toLowerCase().includes(q) || e.poste.toLowerCase().includes(q)) &&
        (deptFilter === 'Tous' || e.dept === deptFilter) &&
        (statutFilter === 'Tous' || e.statut === statutFilter)
      )
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortBy === 'score') return (a.score - b.score) * dir
      if (sortBy === 'nom')   return a.nom.localeCompare(b.nom) * dir
      if (sortBy === 'date')  return a.date.localeCompare(b.date) * dir
      return 0
    })

  const stats = {
    total:    employes.length,
    alertes:  employes.filter(e => ['suspect','nonconforme'].includes(e.statut)).length,
    conformes:employes.filter(e => ['conforme','excellent'].includes(e.statut)).length,
    moy:      Math.round(employes.reduce((s,e)=>s+e.score,0)/employes.length),
  }

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}><ShieldCheck size={20}/><span>ProfilCheck</span></div>
        <nav className={styles.nav}>
          {[
            { icon:ShieldCheck, label:'Dashboard',  path:'/dashboard' },
            { icon:Users,       label:'Employés',   path:'/employes', active:true },
            { icon:Bell,        label:'Alertes',    path:'/alertes', badge:8 },
            { icon:FileText,    label:'Rapports',   path:'/rapport' },
            { icon:Settings,    label:'Mon profil',  path:'/profil' },
          ].map(({ icon:Icon, label, path, active, badge }) => (
            <button key={label} className={`${styles.navItem} ${active?styles.navActive:''}`} onClick={()=>navigate(path)}>
              <Icon size={18}/>
              <span>{label}</span>
              {badge && <span className={styles.badge}>{badge}</span>}
            </button>
          ))}
        </nav>
        <button className={styles.logoutBtn} onClick={()=>navigate('/login')}>
          <LogOut size={18}/><span>Déconnexion</span>
        </button>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h2 className={styles.title}>Gestion des employés</h2>
            <p className={styles.sub}>{employes.length} employés enregistrés</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.exportBtn}><Download size={15}/> Exporter</button>
            <button className={styles.addBtn} onClick={()=>navigate('/test')}><Plus size={15}/> Lancer un test</button>
          </div>
        </header>

        <div className={styles.content}>
          {/* Mini stats */}
          <div className={styles.miniStats}>
            {[
              { label:'Total employés',   value:stats.total,    color:'var(--bordeaux)' },
              { label:'Conformes',         value:stats.conformes,color:'#4A7C59' },
              { label:'À surveiller / suspects', value:stats.alertes, color:'#DC2626' },
              { label:'Score moyen',       value:`${stats.moy}%`, color:'#D97706' },
            ].map((s,i)=>(
              <motion.div key={i} className={styles.miniStat}
                initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}>
                <span className={styles.miniVal} style={{color:s.color}}>{s.value}</span>
                <span className={styles.miniLabel}>{s.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Filtres */}
          <div className={styles.filters}>
            <div className={styles.searchBox}>
              <Search size={15}/>
              <input placeholder="Rechercher un employé..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <div className={styles.filterGroup}>
              <Filter size={14} color="var(--text-mid)"/>
              <select value={deptFilter} onChange={e=>setDept(e.target.value)} className={styles.select}>
                {depts.map(d=><option key={d}>{d}</option>)}
              </select>
              <select value={statutFilter} onChange={e=>setStatut(e.target.value)} className={styles.select}>
                {statuts.map(s=><option key={s} value={s}>{s==='Tous'?'Tous statuts':statutCfg[s]?.label}</option>)}
              </select>
            </div>
          </div>

          {/* Table */}
          <motion.div className={styles.tableCard}
            initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}}>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th onClick={()=>toggleSort('nom')} className={styles.sortable}>
                      Employé {sortBy==='nom' ? (sortDir==='asc'?'↑':'↓') : ''}
                    </th>
                    <th>Poste</th>
                    <th>Département</th>
                    <th onClick={()=>toggleSort('score')} className={styles.sortable}>
                      Score {sortBy==='score' ? (sortDir==='asc'?'↑':'↓') : ''}
                    </th>
                    <th>Statut</th>
                    <th onClick={()=>toggleSort('date')} className={styles.sortable}>
                      Date {sortBy==='date' ? (sortDir==='asc'?'↑':'↓') : ''}
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e,i)=>{
                    const cfg = statutCfg[e.statut]
                    const Icon = cfg.icon
                    return (
                      <motion.tr key={e.id}
                        initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.04}}>
                        <td>
                          <div className={styles.empCell}>
                            <div className={styles.avatar}>{e.avatar}</div>
                            <span className={styles.empNom}>{e.nom}</span>
                          </div>
                        </td>
                        <td className={styles.poste}>{e.poste}</td>
                        <td><span className={styles.deptChip}>{e.dept}</span></td>
                        <td>
                          <div className={styles.scoreCell}>
                            <div className={styles.scoreBar}>
                              <div className={styles.scoreFill} style={{width:`${e.score}%`,background:cfg.color}}/>
                            </div>
                            <span className={styles.scoreNum}>{e.score}%</span>
                          </div>
                        </td>
                        <td>
                          <span className={styles.statutBadge} style={{color:cfg.color,background:cfg.bg}}>
                            <Icon size={13}/>{cfg.label}
                          </span>
                        </td>
                        <td className={styles.dateCell}>{e.date}</td>
                        <td>
                          <button className={styles.viewBtn} onClick={()=>navigate('/employe')}>
                            Voir <ChevronRight size={13}/>
                          </button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className={styles.empty}>Aucun employé trouvé.</div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
