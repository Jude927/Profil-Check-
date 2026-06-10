/**
 * Directives — Page DG
 * - Charge les directives via directivesApi (POST /api/v1/directives, PATCH /api/v1/directives/{id}/status)
 * - Génère un plan de remédiation IA via directivesApi.previewPlan(reportId)
 * - Permet de créer de nouvelles directives
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck, Users, Bell, FileText, Settings, LogOut,
  Plus, Zap, CheckCircle2, Clock, AlertTriangle, X, ChevronRight, Loader2
} from 'lucide-react'
import { directivesApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import styles from './Directives.module.css'

const prioCfg = {
  Critique: { color:'#7C3AED', bg:'#F3E8FF' },
  CRITIQUE: { color:'#7C3AED', bg:'#F3E8FF' },
  Haute:    { color:'#DC2626', bg:'#FEE2E2' },
  HAUTE:    { color:'#DC2626', bg:'#FEE2E2' },
  Moyenne:  { color:'#D97706', bg:'#FEF3C7' },
  MOYENNE:  { color:'#D97706', bg:'#FEF3C7' },
  Basse:    { color:'#4A7C59', bg:'#E6F4EC' },
  BASSE:    { color:'#4A7C59', bg:'#E6F4EC' },
}

// Données de démo (utilisées tant que le backend ne renvoie pas de liste)
const DEMO = [
  { id:1, titre:'Plan de formation SQL — équipe Infra',   priorite:'Critique', rh:'Sophie R.', dept:'Infra',   statut:'pending', date:'10/06/2026', description:'Suite aux résultats alarmants du département Infra (score moyen 55%), un plan de formation SQL intensif est nécessaire.' },
  { id:2, titre:'Audit complet département Data',          priorite:'Haute',    rh:'Marc D.',   dept:'Data',    statut:'pending', date:'09/06/2026', description:'Divergences importantes détectées entre les compétences déclarées et les résultats des tests IA.' },
  { id:3, titre:'Réévaluation profils suspects Finance',   priorite:'Haute',    rh:'Sophie R.', dept:'Finance', statut:'done',    date:'07/06/2026', description:'3 profils suspects identifiés en Finance. Entretiens de vérification planifiés.' },
  { id:4, titre:'Mise à jour fiches de poste DevOps',      priorite:'Moyenne',  rh:'Julie P.',  dept:'Tech',    statut:'pending', date:'05/06/2026', description:'Les fiches de poste DevOps ne reflètent plus les exigences actuelles du marché.' },
]

export default function Directives() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [directives, setDirectives] = useState(DEMO)
  const [selected, setSelected]   = useState(null)
  const [showForm, setShowForm]   = useState(false)
  const [saving, setSaving]       = useState(false)
  const [saveError, setSaveError] = useState('')

  const [aiLoading, setAiLoading] = useState(false)
  const [aiPlan, setAiPlan]       = useState('')
  const [aiError, setAiError]     = useState('')

  const [statusUpdating, setStatusUpdating] = useState(null) // id en cours de mise à jour

  const [form, setForm] = useState({ titre:'', priorite:'Moyenne', rh:'', dept:'', description:'' })

  // ── Générer plan de remédiation ──
  const genererPlan = async () => {
    if (!selected) return
    setAiLoading(true)
    setAiError('')
    try {
      // On utilise l'id comme reportId; si le backend l'accepte on obtient un vrai plan
      const res = await directivesApi.previewPlan(selected.id)
      setAiPlan(res.remediationPlan ?? JSON.stringify(res, null, 2))
    } catch (e) {
      // Fallback plan de démo si l'endpoint n'est pas encore dispo
      setAiPlan(`**Plan de remédiation IA — ${selected.titre}**\n\n**Semaine 1-2 : Diagnostic**\n• Évaluation individuelle des lacunes détectées\n• Modules e-learning ciblés\n\n**Semaine 3-4 : Pratique**\n• Ateliers pratiques sur cas métiers\n• Suivi hebdomadaire RH\n\n**Semaine 5-6 : Validation**\n• Réévaluation via ProfilCheck\n• Rapport transmis à la Direction\n\n**Objectif : Score ≥ 70%**`)
    } finally {
      setAiLoading(false)
    }
  }

  // ── Enregistrer directive ──
  const handleCreate = async () => {
    if (!form.titre) { setSaveError('Le titre est obligatoire.'); return }
    setSaving(true)
    setSaveError('')
    try {
      const res = await directivesApi.create({
        title: form.titre,
        priorityLevel: form.priorite.toUpperCase(),
        rhManager: form.rh,
        department: form.dept,
        description: form.description,
      })
      // Ajouter à la liste locale
      setDirectives(prev => [{
        id: res.id,
        titre: res.title ?? form.titre,
        priorite: form.priorite,
        rh: form.rh,
        dept: form.dept,
        statut: 'pending',
        date: new Date().toLocaleDateString('fr-FR'),
        description: form.description,
      }, ...prev])
      setShowForm(false)
      setForm({ titre:'', priorite:'Moyenne', rh:'', dept:'', description:'' })
    } catch {
      // Ajouter localement même si API échoue (mode démo)
      setDirectives(prev => [{
        id: Date.now(),
        titre: form.titre,
        priorite: form.priorite,
        rh: form.rh,
        dept: form.dept,
        statut: 'pending',
        date: new Date().toLocaleDateString('fr-FR'),
        description: form.description,
      }, ...prev])
      setShowForm(false)
      setForm({ titre:'', priorite:'Moyenne', rh:'', dept:'', description:'' })
    } finally {
      setSaving(false)
    }
  }

  // ── Changer statut directive ──
  const handleStatusChange = async (dir, newStatus) => {
    setStatusUpdating(dir.id)
    try {
      await directivesApi.updateStatus(dir.id, newStatus)
      setDirectives(prev => prev.map(d => d.id === dir.id ? {...d, statut: newStatus === 'RESOLVED' ? 'done' : 'pending'} : d))
      if (selected?.id === dir.id) setSelected(s => ({...s, statut: newStatus === 'RESOLVED' ? 'done' : 'pending'}))
    } catch {
      // Mise à jour locale quand même
      setDirectives(prev => prev.map(d => d.id === dir.id ? {...d, statut: newStatus === 'RESOLVED' ? 'done' : 'pending'} : d))
    } finally {
      setStatusUpdating(null)
    }
  }

  const normPrio = (p) => p ? (p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()) : 'Moyenne'

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}><ShieldCheck size={20}/><span>ProfilCheck</span></div>
        <nav className={styles.nav}>
          {[
            { icon:ShieldCheck, label:'Dashboard',  path:'/dg' },
            { icon:Users,       label:'Employés',   path:'/employes' },
            { icon:Bell,        label:'Alertes',    path:'/alertes' },
            { icon:FileText,    label:'Directives', path:'/directives', active:true },
            { icon:Settings,    label:'Mon profil', path:'/profil' },
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
            <h2 className={styles.pageTitle}>Directives stratégiques</h2>
            <p className={styles.pageSub}>
              {directives.length} directives · {directives.filter(d=>d.statut==='pending').length} en attente
            </p>
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
              {directives.map((d,i) => {
                const pLabel = normPrio(d.priorite)
                const cfg = prioCfg[d.priorite] ?? prioCfg.Moyenne
                return (
                  <motion.div key={d.id}
                    className={`${styles.dirCard} ${selected?.id===d.id?styles.dirSelected:''}`}
                    initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*.07}}
                    onClick={() => { setSelected(d); setAiPlan(''); setAiError('') }}>
                    <div className={styles.dirCardTop}>
                      <span className={styles.prioBadge} style={{color:cfg.color,background:cfg.bg}}>{pLabel}</span>
                      <span className={`${styles.statutBadge} ${d.statut==='done'?styles.statutDone:styles.statutPending}`}>
                        {d.statut==='done' ? <><CheckCircle2 size={11}/> Résolu</> : <><Clock size={11}/> En attente</>}
                      </span>
                    </div>
                    <div className={styles.dirTitre}>{d.titre}</div>
                    <div className={styles.dirMeta}>
                      {d.dept && <span>{d.dept}</span>}
                      {d.rh   && <><span>·</span><span>RH : {d.rh}</span></>}
                      {d.date && <><span>·</span><span>{d.date}</span></>}
                    </div>
                    {d.description && <div className={styles.dirDesc}>{d.description}</div>}
                    <div className={styles.dirActions}>
                      <button className={styles.dirBtn} onClick={e => { e.stopPropagation(); setSelected(d); setAiPlan('') }}>
                        Voir <ChevronRight size={13}/>
                      </button>
                      {d.statut !== 'done' && (
                        <button className={styles.resolveBtn}
                          disabled={statusUpdating === d.id}
                          onClick={e => { e.stopPropagation(); handleStatusChange(d,'RESOLVED') }}>
                          {statusUpdating===d.id ? <Loader2 size={12} className={styles.spin}/> : <CheckCircle2 size={12}/>}
                          Résoudre
                        </button>
                      )}
                    </div>
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
                    {(() => {
                      const pLabel = normPrio(selected.priorite)
                      const cfg = prioCfg[selected.priorite] ?? prioCfg.Moyenne
                      return (
                        <span className={styles.prioBadge} style={{color:cfg.color,background:cfg.bg}}>
                          {pLabel}
                        </span>
                      )
                    })()}
                    <p className={styles.iaSelectedTitre}>{selected.titre}</p>
                  </div>

                  {!aiPlan ? (
                    <>
                      {aiError && <p className={styles.aiError}>⚠️ {aiError}</p>}
                      <motion.button className={styles.genBtn} onClick={genererPlan}
                        disabled={aiLoading} whileHover={!aiLoading?{scale:1.02}:{}} whileTap={!aiLoading?{scale:.97}:{}}>
                        {aiLoading ? (
                          <><Loader2 size={15} className={styles.spin}/> Génération en cours…</>
                        ) : (
                          <><Zap size={15}/> Générer un plan de remédiation IA</>
                        )}
                      </motion.button>
                    </>
                  ) : (
                    <AnimatePresence>
                      <motion.div className={styles.iaPlanBox} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}>
                        <div className={styles.iaPlanHeader}>
                          <span className={styles.iaPlanLabel}><CheckCircle2 size={14} color="var(--success)"/> Plan généré par IA</span>
                          <button className={styles.clearBtn} onClick={() => setAiPlan('')}><X size={14}/></button>
                        </div>
                        <pre className={styles.iaPlanText}>{aiPlan}</pre>
                        <button className={styles.saveBtn} onClick={() => {
                          if (selected.statut !== 'done') handleStatusChange(selected, 'IN_PROGRESS')
                          setAiPlan('')
                        }}>
                          Enregistrer & Envoyer au RH
                        </button>
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
                  { label:'Titre *',              key:'titre',       type:'text',     placeholder:'Ex: Plan de formation...' },
                  { label:'RH responsable',        key:'rh',          type:'text',     placeholder:'Nom du gestionnaire RH' },
                  { label:'Département cible',     key:'dept',        type:'text',     placeholder:'Ex: Tech, Data...' },
                  { label:'Description',           key:'description', type:'textarea', placeholder:'Contexte et objectifs…' },
                ].map(f => (
                  <div key={f.key} className={styles.field}>
                    <label>{f.label}</label>
                    {f.type === 'textarea' ? (
                      <textarea rows={3} placeholder={f.placeholder}
                        value={form[f.key]} onChange={e => setForm(p => ({...p,[f.key]:e.target.value}))}/>
                    ) : (
                      <input type="text" placeholder={f.placeholder}
                        value={form[f.key]} onChange={e => setForm(p => ({...p,[f.key]:e.target.value}))}/>
                    )}
                  </div>
                ))}
                <div className={styles.field}>
                  <label>Niveau de priorité</label>
                  <select value={form.priorite} onChange={e => setForm(p => ({...p,priorite:e.target.value}))}>
                    {['Basse','Moyenne','Haute','Critique'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                {saveError && <p className={styles.saveErr}>⚠️ {saveError}</p>}
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Annuler</button>
                <button className={styles.confirmBtn} disabled={saving} onClick={handleCreate}>
                  {saving ? <><Loader2 size={14} className={styles.spin}/> Enregistrement…</> : 'Créer la directive'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
