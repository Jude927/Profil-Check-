import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck, Users, Bell, FileText, Settings, LogOut,
  Plus, Briefcase, Edit2, Trash2, X, Check, ChevronDown, ChevronUp
} from 'lucide-react'
import styles from './FichesPostes.module.css'

const fichesData = [
  {
    id: 1, titre: 'Développeur Senior Java', dept: 'Tech', scMin: 75,
    competences: [
      { nom:'Java / Spring Boot', poids:40, minReq:80 },
      { nom:'Architecture microservices', poids:25, minReq:70 },
      { nom:'SQL / JPA', poids:20, minReq:75 },
      { nom:'Sécurité applicative', poids:15, minReq:65 },
    ],
    nbEmployes: 4, nbConformes: 3,
    description: 'Développement et maintenance des APIs backend. Maîtrise avancée de l\'écosystème Spring.',
  },
  {
    id: 2, titre: 'Data Scientist', dept: 'Data', scMin: 70,
    competences: [
      { nom:'Machine Learning', poids:35, minReq:75 },
      { nom:'Python / R', poids:30, minReq:80 },
      { nom:'SQL avancé', poids:20, minReq:70 },
      { nom:'Visualisation données', poids:15, minReq:60 },
    ],
    nbEmployes: 3, nbConformes: 2,
    description: 'Analyse de données complexes, modélisation prédictive et reporting BI.',
  },
  {
    id: 3, titre: 'DevOps Engineer', dept: 'Infra', scMin: 70,
    competences: [
      { nom:'Docker / Kubernetes', poids:35, minReq:75 },
      { nom:'CI/CD pipelines', poids:25, minReq:70 },
      { nom:'Cloud AWS/Azure', poids:25, minReq:65 },
      { nom:'Scripting Bash/Python', poids:15, minReq:60 },
    ],
    nbEmployes: 2, nbConformes: 1,
    description: 'Gestion de l\'infrastructure cloud, automatisation des déploiements et monitoring.',
  },
  {
    id: 4, titre: 'Contrôleur de gestion', dept: 'Finance', scMin: 65,
    competences: [
      { nom:'Comptabilité analytique', poids:35, minReq:75 },
      { nom:'Excel / Power BI', poids:30, minReq:70 },
      { nom:'Normes IFRS', poids:20, minReq:65 },
      { nom:'Gestion budgétaire', poids:15, minReq:60 },
    ],
    nbEmployes: 3, nbConformes: 2,
    description: 'Pilotage financier, consolidation budgétaire et reporting direction.',
  },
  {
    id: 5, titre: 'Gestionnaire RH', dept: 'RH', scMin: 60,
    competences: [
      { nom:'Droit du travail', poids:30, minReq:70 },
      { nom:'Gestion des talents', poids:30, minReq:65 },
      { nom:'SIRH / ADP', poids:25, minReq:60 },
      { nom:'Communication', poids:15, minReq:65 },
    ],
    nbEmployes: 2, nbConformes: 2,
    description: 'Gestion administrative du personnel, recrutement et développement RH.',
  },
]

const depts = ['Tous', 'Tech', 'Data', 'Infra', 'Finance', 'RH']

export default function FichesPostes() {
  const navigate = useNavigate()
  const [fiches, setFiches]   = useState(fichesData)
  const [filter, setFilter]   = useState('Tous')
  const [expanded, setExpand] = useState(null)
  const [showModal, setModal] = useState(false)
  const [delFiche, setDel]    = useState(null)
  const [form, setForm]       = useState({ titre:'', dept:'Tech', scMin:70, description:'' })

  const filtered = filter === 'Tous' ? fiches : fiches.filter(f => f.dept === filter)

  const save = () => {
    if (!form.titre) return
    setFiches(prev => [...prev, {
      id: Date.now(), ...form, scMin: Number(form.scMin),
      competences: [], nbEmployes: 0, nbConformes: 0,
    }])
    setModal(false)
    setForm({ titre:'', dept:'Tech', scMin:70, description:'' })
  }

  const del = () => {
    setFiches(prev => prev.filter(f => f.id !== delFiche.id))
    setDel(null)
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}><ShieldCheck size={20}/><span>ProfilCheck</span></div>
        <nav className={styles.nav}>
          {[
            { icon:ShieldCheck, label:'Dashboard',      path:'/dashboard' },
            { icon:Users,       label:'Employés',       path:'/employes' },
            { icon:Bell,        label:'Alertes',        path:'/alertes', badge:8 },
            { icon:FileText,    label:'Rapports',       path:'/rapport' },
            { icon:Briefcase,   label:'Fiches de postes', path:'/fiches-postes', active:true },
            { icon:Settings,    label:'Console',        path:'/console' },
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
            <p className={styles.headerLabel}>Référentiel</p>
            <h2 className={styles.pageTitle}>Fiches de postes</h2>
          </div>
          <motion.button className={styles.addBtn} onClick={() => setModal(true)}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }}>
            <Plus size={15}/> Nouvelle fiche
          </motion.button>
        </header>

        <div className={styles.content}>
          {/* Stats */}
          <div className={styles.statsRow}>
            {[
              { label:'Fiches définies', value: fiches.length },
              { label:'Employés couverts', value: fiches.reduce((s,f) => s+f.nbEmployes, 0) },
              { label:'Taux de conformité global', value: Math.round(fiches.reduce((s,f)=>s+f.nbConformes,0)/fiches.reduce((s,f)=>s+f.nbEmployes,0)*100)+'%' },
            ].map(s => (
              <div key={s.label} className={styles.statCard}>
                <span className={styles.statVal}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div className={styles.filters}>
            {depts.map(d => (
              <button key={d} className={`${styles.filterPill} ${filter===d?styles.filterActive:''}`}
                onClick={() => setFilter(d)}>{d}</button>
            ))}
          </div>

          {/* Fiches list */}
          <div className={styles.fichesList}>
            {filtered.map((f, i) => {
              const pct = Math.round((f.nbConformes / (f.nbEmployes || 1)) * 100)
              const ok  = pct >= 70
              const isOpen = expanded === f.id

              return (
                <motion.div key={f.id} className={styles.ficheCard}
                  initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*.06 }}>

                  <div className={styles.ficheTop} onClick={() => setExpand(isOpen ? null : f.id)}>
                    <div className={styles.ficheLeft}>
                      <div className={styles.ficheIcon}>
                        <Briefcase size={18} color="var(--bordeaux)"/>
                      </div>
                      <div>
                        <div className={styles.ficheTitre}>{f.titre}</div>
                        <div className={styles.ficheMeta}>
                          <span className={styles.deptTag}>{f.dept}</span>
                          <span>SC minimum requis : <strong>{f.scMin}%</strong></span>
                          <span>{f.nbEmployes} employé{f.nbEmployes>1?'s':''} · {f.nbConformes} conforme{f.nbConformes>1?'s':''}</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.ficheRight}>
                      <div className={styles.conformeGauge}>
                        <div className={styles.gaugeBar}>
                          <div className={styles.gaugeFill}
                            style={{ width:`${pct}%`, background: ok?'var(--success)':'var(--danger)' }}/>
                        </div>
                        <span style={{ color: ok?'var(--success)':'var(--danger)' }}>{pct}%</span>
                      </div>
                      <div className={styles.ficheActions}>
                        <button className={styles.actionBtn}
                          onClick={e => { e.stopPropagation() }} title="Modifier"><Edit2 size={13}/></button>
                        <button className={`${styles.actionBtn} ${styles.actionDel}`}
                          onClick={e => { e.stopPropagation(); setDel(f) }} title="Supprimer"><Trash2 size={13}/></button>
                      </div>
                      {isOpen ? <ChevronUp size={16} color="var(--text-light)"/> : <ChevronDown size={16} color="var(--text-light)"/>}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div className={styles.ficheDetail}
                        initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                        exit={{ height:0, opacity:0 }} transition={{ duration:.25 }}>
                        <p className={styles.ficheDesc}>{f.description}</p>
                        <div className={styles.compGrid}>
                          {f.competences.map(c => (
                            <div key={c.nom} className={styles.compCard}>
                              <div className={styles.compHeader}>
                                <span className={styles.compNom}>{c.nom}</span>
                                <span className={styles.compPoids}>{c.poids}%</span>
                              </div>
                              <div className={styles.compReq}>
                                Score min. requis : <strong>{c.minReq}%</strong>
                              </div>
                              <div className={styles.compBarWrap}>
                                <div className={styles.compBarBg}>
                                  <div className={styles.compBarFill} style={{ width:`${c.minReq}%` }}/>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className={styles.ficheFooter}>
                          <button className={styles.testBtn} onClick={() => navigate('/employes')}>
                            <Users size={13}/> Voir les employés sur ce poste
                          </button>
                          <button className={styles.testBtn} onClick={() => navigate('/console')}>
                            <Settings size={13}/> Simuler un profil
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </div>
      </main>

      {/* Modal création */}
      <AnimatePresence>
        {showModal && (
          <motion.div className={styles.overlay} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={() => setModal(false)}>
            <motion.div className={styles.modal} initial={{scale:.95,opacity:0}} animate={{scale:1,opacity:1}}
              exit={{scale:.95,opacity:0}} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Nouvelle fiche de poste</h3>
                <button onClick={() => setModal(false)}><X size={18}/></button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.field}>
                  <label>Intitulé du poste</label>
                  <input placeholder="Ex: Analyste Sécurité Senior" value={form.titre}
                    onChange={e => setForm(p=>({...p,titre:e.target.value}))}/>
                </div>
                <div className={styles.field}>
                  <label>Département</label>
                  <select value={form.dept} onChange={e => setForm(p=>({...p,dept:e.target.value}))}>
                    {depts.slice(1).map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Score SC minimum requis : <strong>{form.scMin}%</strong></label>
                  <input type="range" min="40" max="95" value={form.scMin}
                    onChange={e => setForm(p=>({...p,scMin:e.target.value}))}
                    className={styles.rangeInput}/>
                </div>
                <div className={styles.field}>
                  <label>Description du poste</label>
                  <textarea rows={3} placeholder="Décrivez les missions et responsabilités…"
                    value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))}
                    className={styles.textarea}/>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={() => setModal(false)}>Annuler</button>
                <button className={styles.confirmBtn} onClick={save}><Check size={14}/> Créer la fiche</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {delFiche && (
          <motion.div className={styles.overlay} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={() => setDel(null)}>
            <motion.div className={`${styles.modal} ${styles.modalSm}`}
              initial={{scale:.95,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.95,opacity:0}}
              onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Supprimer la fiche</h3>
                <button onClick={() => setDel(null)}><X size={18}/></button>
              </div>
              <div className={styles.delBody}>
                <Trash2 size={28} color="var(--danger)"/>
                <p>Supprimer <strong>"{delFiche?.titre}"</strong> ? Cette action est irréversible.</p>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={() => setDel(null)}>Annuler</button>
                <button className={styles.deleteBtn} onClick={del}><Trash2 size={14}/> Supprimer</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
