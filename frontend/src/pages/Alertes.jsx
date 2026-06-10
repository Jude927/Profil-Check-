import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck, Users, Bell, FileText, Settings, LogOut,
  AlertTriangle, XCircle, AlertCircle, CheckCircle2,
  Clock, ChevronRight, Filter, Search, X
} from 'lucide-react'
import styles from './Alertes.module.css'

const alertes = [
  { id:1, nom:'Omar Sy',        poste:'Comptable',         score:23, type:'Non conforme',  urgence:'critique', time:'Il y a 5h',   date:'10/06/2026', statut:'ouverte',  message:'Score de conformité critique (23%). Procédure disciplinaire recommandée.' },
  { id:2, nom:'Lucas Petit',    poste:'DevOps',            score:41, type:'Profil suspect', urgence:'haute',    time:'Il y a 2h',   date:'10/06/2026', statut:'ouverte',  message:'Incohérences détectées entre le profil déclaré et les réponses au test.' },
  { id:3, nom:'Thomas Garnier', poste:'Développeur Java',  score:49, type:'Profil suspect', urgence:'haute',    time:'Hier',        date:'09/06/2026', statut:'ouverte',  message:'Score suspect (49%). Entretien de vérification suggéré.' },
  { id:4, nom:'Amara Diallo',   poste:'Analyste données',  score:58, type:'À surveiller',   urgence:'moyenne',  time:'Hier',        date:'09/06/2026', statut:'ouverte',  message:'Score en dessous du seuil. Réévaluation dans 3 mois.' },
  { id:5, nom:'Yann Bernard',   poste:'Data Engineer',     score:66, type:'À surveiller',   urgence:'moyenne',  time:'Il y a 2j',   date:'08/06/2026', statut:'ouverte',  message:'Légère baisse du score détectée par rapport à l\'évaluation précédente.' },
  { id:6, nom:'Kevin Dubois',   poste:'Chef de projet',    score:74, type:'Info',           urgence:'info',     time:'Il y a 3j',   date:'07/06/2026', statut:'resolue',  message:'Réévaluation programmée dans 6 mois selon le calendrier standard.' },
  { id:7, nom:'Inès Fontaine',  poste:'Designer UX',       score:87, type:'Info',           urgence:'info',     time:'Il y a 5j',   date:'05/06/2026', statut:'resolue',  message:'Profil validé. Badge de conformité attribué.' },
  { id:8, nom:'Sophie Martin',  poste:'Dev Senior',        score:92, type:'Info',           urgence:'info',     time:'Il y a 7j',   date:'03/06/2026', statut:'resolue',  message:'Excellent profil confirmé. Aucune action requise.' },
]

const urgenceCfg = {
  critique: { color:'#7C3AED', bg:'#F3E8FF', icon:XCircle,       label:'Critique' },
  haute:    { color:'#DC2626', bg:'#FEE2E2', icon:AlertTriangle,  label:'Haute' },
  moyenne:  { color:'#D97706', bg:'#FEF3C7', icon:AlertCircle,    label:'Moyenne' },
  info:     { color:'#2563EB', bg:'#EFF6FF', icon:CheckCircle2,   label:'Info' },
}

export default function Alertes() {
  const navigate = useNavigate()
  const [search, setSearch]         = useState('')
  const [filtreUrgence, setFiltreU] = useState('Tous')
  const [filtreStatut, setFiltreS]  = useState('ouverte')
  const [selected, setSelected]     = useState(null)

  const filtered = alertes.filter(a => {
    const q = search.toLowerCase()
    return (
      (a.nom.toLowerCase().includes(q) || a.type.toLowerCase().includes(q)) &&
      (filtreUrgence === 'Tous' || a.urgence === filtreUrgence) &&
      (filtreStatut  === 'Tous' || a.statut  === filtreStatut)
    )
  })

  const ouvertes = alertes.filter(a => a.statut === 'ouverte').length
  const critiques = alertes.filter(a => a.urgence === 'critique').length

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}><ShieldCheck size={20}/><span>ProfilCheck</span></div>
        <nav className={styles.nav}>
          {[
            { icon:ShieldCheck, label:'Dashboard',   path:'/dashboard' },
            { icon:Users,       label:'Employés',    path:'/employes' },
            { icon:Bell,        label:'Alertes',     path:'/alertes', active:true, badge:ouvertes },
            { icon:FileText,    label:'Rapports',    path:'/rapport' },
            { icon:Settings,    label:'Mon profil',  path:'/profil' },
          ].map(({ icon:Icon, label, path, active, badge }) => (
            <button key={label} className={`${styles.navItem} ${active?styles.navActive:''}`} onClick={()=>navigate(path)}>
              <Icon size={18}/><span>{label}</span>
              {badge ? <span className={styles.navBadge}>{badge}</span> : null}
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
            <h2 className={styles.title}>Centre d'alertes</h2>
            <p className={styles.sub}>{ouvertes} alerte{ouvertes>1?'s':''} ouverte{ouvertes>1?'s':''} · {critiques} critique{critiques>1?'s':''}</p>
          </div>
        </header>

        <div className={styles.content}>
          {/* Résumé */}
          <div className={styles.summaryGrid}>
            {Object.entries(urgenceCfg).map(([key, cfg]) => {
              const Icon = cfg.icon
              const count = alertes.filter(a=>a.urgence===key).length
              return (
                <motion.div key={key} className={styles.summaryCard}
                  initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
                  style={{borderTop:`3px solid ${cfg.color}`}}
                >
                  <div className={styles.summaryIcon} style={{background:cfg.bg, color:cfg.color}}>
                    <Icon size={18}/>
                  </div>
                  <div>
                    <div className={styles.summaryCount} style={{color:cfg.color}}>{count}</div>
                    <div className={styles.summaryLabel}>{cfg.label}</div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Filtres */}
          <div className={styles.filters}>
            <div className={styles.searchBox}>
              <Search size={15}/>
              <input placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <div className={styles.tabs}>
              {['ouverte','resolue','Tous'].map(s=>(
                <button key={s}
                  className={`${styles.tab} ${filtreStatut===s?styles.tabActive:''}`}
                  onClick={()=>setFiltreS(s)}
                >
                  {s==='ouverte'?'Ouvertes':s==='resolue'?'Résolues':'Toutes'}
                </button>
              ))}
            </div>
            <div className={styles.urgenceTabs}>
              {['Tous','critique','haute','moyenne','info'].map(u=>{
                const cfg = urgenceCfg[u]
                return (
                  <button key={u}
                    className={`${styles.urgenceTab} ${filtreUrgence===u?styles.urgenceActive:''}`}
                    style={filtreUrgence===u&&cfg?{background:cfg.bg,color:cfg.color,borderColor:cfg.color}:{}}
                    onClick={()=>setFiltreU(u)}
                  >
                    {u==='Tous'?'Toutes':cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Liste + détail */}
          <div className={styles.alertLayout}>
            {/* Liste */}
            <div className={styles.alertList}>
              <AnimatePresence>
                {filtered.map((a,i)=>{
                  const cfg = urgenceCfg[a.urgence]
                  const Icon = cfg.icon
                  return (
                    <motion.div key={a.id}
                      className={`${styles.alertCard} ${selected?.id===a.id?styles.alertSelected:''} ${a.statut==='resolue'?styles.alertResolue:''}`}
                      initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} exit={{opacity:0}}
                      transition={{delay:i*0.05}}
                      onClick={()=>setSelected(a)}
                    >
                      <div className={styles.alertLeft}>
                        <div className={styles.alertIconWrap} style={{background:cfg.bg,color:cfg.color}}>
                          <Icon size={16}/>
                        </div>
                        <div className={styles.alertInfo}>
                          <div className={styles.alertNom}>{a.nom}</div>
                          <div className={styles.alertType}>{a.type} · {a.poste}</div>
                        </div>
                      </div>
                      <div className={styles.alertRight}>
                        <span className={styles.urgencePill} style={{color:cfg.color,background:cfg.bg}}>{cfg.label}</span>
                        <div className={styles.alertTime}><Clock size={11}/>{a.time}</div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              {filtered.length===0 && (
                <div className={styles.empty}>Aucune alerte trouvée.</div>
              )}
            </div>

            {/* Détail */}
            <AnimatePresence>
              {selected && (
                <motion.div className={styles.detailPanel}
                  initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}}
                  transition={{duration:0.3}}
                >
                  <div className={styles.detailHeader}>
                    <h3>Détail de l'alerte</h3>
                    <button className={styles.closeBtn} onClick={()=>setSelected(null)}><X size={18}/></button>
                  </div>
                  {(() => {
                    const cfg = urgenceCfg[selected.urgence]
                    const Icon = cfg.icon
                    return (
                      <>
                        <div className={styles.detailUrgence} style={{background:cfg.bg,color:cfg.color}}>
                          <Icon size={16}/> {cfg.label}
                        </div>
                        <div className={styles.detailNom}>{selected.nom}</div>
                        <div className={styles.detailPoste}>{selected.poste}</div>
                        <div className={styles.detailScore}>
                          Score : <strong style={{color:cfg.color}}>{selected.score}%</strong>
                        </div>
                        <div className={styles.detailMsg}>{selected.message}</div>
                        <div className={styles.detailMeta}>
                          <span><Clock size={12}/> {selected.date}</span>
                          <span>Statut : <strong>{selected.statut === 'ouverte' ? 'Ouverte' : 'Résolue'}</strong></span>
                        </div>
                        <div className={styles.detailActions}>
                          <button className={styles.actionBtn} onClick={()=>navigate('/employe')}>
                            <Users size={15}/> Voir le profil
                          </button>
                          <button className={styles.actionBtn} onClick={()=>navigate('/test')}>
                            <FileText size={15}/> Lancer un test
                          </button>
                          <button className={styles.actionBtnSecond}>
                            <CheckCircle2 size={15}/> Marquer résolue
                          </button>
                        </div>
                      </>
                    )
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  )
}
