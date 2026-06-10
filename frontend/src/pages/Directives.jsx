import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck, Users, Bell, FileText, Settings, LogOut,
  Plus, Zap, CheckCircle2, Clock, AlertTriangle, X, ChevronRight
} from 'lucide-react'
import styles from './Directives.module.css'

const directivesData = [
  { id:1, titre:'Plan de formation SQL — équipe Infra',   priorite:'Critique', rh:'Sophie R.', dept:'Infra',   statut:'pending', date:'10/06/2026', description:'Suite aux résultats alarmants du département Infra (score moyen 55%), un plan de formation SQL intensif est nécessaire.' },
  { id:2, titre:'Audit complet département Data',          priorite:'Haute',    rh:'Marc D.',   dept:'Data',    statut:'pending', date:'09/06/2026', description:'Divergences importantes détectées entre les compétences déclarées et les résultats des tests IA.' },
  { id:3, titre:'Réévaluation profils suspects Finance',   priorite:'Haute',    rh:'Sophie R.', dept:'Finance', statut:'done',    date:'07/06/2026', description:'3 profils suspects identifiés en Finance. Entretiens de vérification planifiés.' },
  { id:4, titre:'Mise à jour fiches de poste DevOps',      priorite:'Moyenne',  rh:'Julie P.',  dept:'Tech',    statut:'pending', date:'05/06/2026', description:'Les fiches de poste DevOps ne reflètent plus les exigences actuelles du marché.' },
]

const prioCfg = {
  Critique: { color:'#7C3AED', bg:'#F3E8FF' },
  Haute:    { color:'#DC2626', bg:'#FEE2E2' },
  Moyenne:  { color:'#D97706', bg:'#FEF3C7' },
  Basse:    { color:'#4A7C59', bg:'#E6F4EC' },
}

const planIA = `**Plan de remédiation IA — 6 semaines**

**Semaine 1-2 : Diagnostic & Fondamentaux**
• Évaluation individuelle des lacunes identifiées par l'IA
• Modules e-learning : bases SQL avancées, optimisation requêtes
• Sessions en binôme avec les experts internes

**Semaine 3-4 : Pratique intensive**
• Ateliers pratiques sur les cas métiers réels de l'entreprise
• Exercices de modélisation de données
• Suivi hebdomadaire par le gestionnaire RH

**Semaine 5-6 : Validation & Réévaluation**
• Mini-projet de validation des acquis
• Réévaluation complète via ProfilCheck
• Rapport de progression transmis à la Direction

**Objectif cible : Score de conformité ≥ 70%**`

export default function Directives() {
  const navigate = useNavigate()
  const [selected, setSelected]   = useState(null)
  const [showForm, setShowForm]   = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiPlan, setAiPlan]       = useState('')
  const [form, setForm]           = useState({ titre:'', priorite:'Moyenne', rh:'', dept:'' })

  const genererPlan = async () => {
    setAiLoading(true)
    await new Promise(r => setTimeout(r, 1800))
    setAiPlan(planIA)
    setAiLoading(false)
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}><ShieldCheck size={20}/><span>ProfilCheck</span></div>
        <nav className={styles.nav}>
          {[
            { icon:ShieldCheck, label:'Dashboard',   path:'/dg' },
            { icon:Users,       label:'Employés',    path:'/employes' },
            { icon:Bell,        label:'Alertes',     path:'/alertes', badge:8 },
            { icon:FileText,    label:'Directives',  path:'/directives', active:true },
            { icon:Settings,    label:'Paramètres',  path:'/dg' },
          ].map(({ icon:Icon, label, path, active, badge }) => (
            <button key={label} className={`${styles.navItem} ${active?styles.navActive:''}`} onClick={() => navigate(path)}>
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
            <h2 className={styles.pageTitle}>Directives stratégiques</h2>
            <p className={styles.pageSub}>{directivesData.length} directives · {directivesData.filter(d=>d.statut==='pending').length} en attente</p>
          </div>
          <motion.button className={styles.addBtn} onClick={() => setShowForm(true)}
            whileHover={{scale:1.02}} whileTap={{scale:.97}}>
            <Plus size={15}/> Nouvelle directive
          </motion.button>
        </header>

        <div className={styles.content}>
          <div className={styles.dirLayout}>
            {/* Liste */}
            <div className={styles.dirList}>
              {directivesData.map((d,i) => {
                const cfg = prioCfg[d.priorite]
                return (
                  <motion.div key={d.id}
                    className={`${styles.dirCard} ${selected?.id===d.id?styles.dirSelected:''}`}
                    initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*.07}}
                    onClick={() => setSelected(d)}>
                    <div className={styles.dirCardTop}>
                      <span className={styles.prioBadge} style={{color:cfg.color,background:cfg.bg}}>{d.priorite}</span>
                      <span className={`${styles.statutBadge} ${d.statut==='done'?styles.statutDone:styles.statutPending}`}>
                        {d.statut==='done' ? <><CheckCircle2 size={11}/> Résolu</> : <><Clock size={11}/> En attente</>}
                      </span>
                    </div>
                    <div className={styles.dirTitre}>{d.titre}</div>
                    <div className={styles.dirMeta}>
                      <span>{d.dept}</span><span>·</span><span>RH : {d.rh}</span><span>·</span><span>{d.date}</span>
                    </div>
                    <div className={styles.dirDesc}>{d.description}</div>
                    <button className={styles.dirBtn}>Voir le détail <ChevronRight size={13}/></button>
                  </motion.div>
                )
              })}
            </div>

            {/* Panneau IA */}
            <div className={styles.iaPanel}>
              <div className={styles.iaPanelHeader}>
                <Zap size={18} color="var(--terracotta)"/>
                <span className={styles.iaPanelTitle}>Moteur de remédiation IA</span>
              </div>

              {!selected ? (
                <div className={styles.iaEmpty}>
                  <FileText size={32} color="var(--text-light)"/>
                  <p>Sélectionnez une directive pour générer un plan de remédiation personnalisé.</p>
                </div>
              ) : (
                <div className={styles.iaContent}>
                  <div className={styles.iaSelected}>
                    <span className={styles.prioBadge} style={{color:prioCfg[selected.priorite].color,background:prioCfg[selected.priorite].bg}}>
                      {selected.priorite}
                    </span>
                    <p className={styles.iaSelectedTitre}>{selected.titre}</p>
                  </div>

                  {!aiPlan ? (
                    <motion.button className={styles.genBtn} onClick={genererPlan}
                      disabled={aiLoading} whileHover={!aiLoading?{scale:1.02}:{}} whileTap={!aiLoading?{scale:.97}:{}}>
                      {aiLoading ? (
                        <><span className={styles.spin}>⚙</span> Génération en cours…</>
                      ) : (
                        <><Zap size={15}/> Générer un plan de remédiation IA</>
                      )}
                    </motion.button>
                  ) : (
                    <AnimatePresence>
                      <motion.div className={styles.iaPlanBox}
                        initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}>
                        <div className={styles.iaPlanHeader}>
                          <span className={styles.iaPlanLabel}><CheckCircle2 size={14} color="var(--success)"/> Plan généré par IA</span>
                          <button className={styles.clearBtn} onClick={() => setAiPlan('')}><X size={14}/></button>
                        </div>
                        <pre className={styles.iaPlanText}>{aiPlan}</pre>
                        <button className={styles.saveBtn}>Enregistrer & Envoyer au RH</button>
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal nouvelle directive */}
      <AnimatePresence>
        {showForm && (
          <motion.div className={styles.overlay} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={() => setShowForm(false)}>
            <motion.div className={styles.modal} initial={{scale:.95,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.95,opacity:0}}
              onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Nouvelle directive</h3>
                <button onClick={() => setShowForm(false)}><X size={18}/></button>
              </div>
              <div className={styles.modalBody}>
                {[
                  { label:'Titre de la directive', key:'titre', type:'text', placeholder:'Ex: Plan de formation...' },
                  { label:'RH responsable',         key:'rh',    type:'text', placeholder:'Nom du gestionnaire RH' },
                  { label:'Département cible',      key:'dept',  type:'text', placeholder:'Ex: Tech, Data...' },
                ].map(f => (
                  <div key={f.key} className={styles.field}>
                    <label>{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder}
                      value={form[f.key]} onChange={e => setForm(p => ({...p,[f.key]:e.target.value}))}/>
                  </div>
                ))}
                <div className={styles.field}>
                  <label>Niveau de priorité</label>
                  <select value={form.priorite} onChange={e => setForm(p => ({...p,priorite:e.target.value}))}>
                    {['Basse','Moyenne','Haute','Critique'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Annuler</button>
                <button className={styles.confirmBtn} onClick={() => setShowForm(false)}>Créer la directive</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
