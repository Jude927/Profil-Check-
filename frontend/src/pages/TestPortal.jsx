/**
 * TestPortal — Page RH pour lancer un test
 * Le RH sélectionne un employé, un poste (jobId), puis obtient
 * un token d'accès à transmettre à l'employé (lien /exam/:token)
 */
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck, Users, Bell, FileText, Settings, LogOut,
  ArrowLeft, Copy, Check, Loader2, Send, Building2, Link
} from 'lucide-react'
import { employeesApi, testsApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import styles from './TestPortal.module.css'

export default function TestPortal() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { logout } = useAuth()

  // Pré-remplissage si on vient depuis la fiche employé
  const prefilledId = location.state?.employeeId ?? ''

  const [employes, setEmployes]   = useState([])
  const [loadingEmp, setLoadingEmp] = useState(true)

  const [employeeId, setEmployeeId] = useState(prefilledId)
  const [jobId, setJobId]           = useState('')
  const [campaignId, setCampaignId] = useState('')

  const [launching, setLaunching] = useState(false)
  const [result, setResult]       = useState(null) // { sessionId, tokenAcces }
  const [error, setError]         = useState('')
  const [copied, setCopied]       = useState(false)

  useEffect(() => {
    employeesApi.list()
      .then(setEmployes)
      .catch(() => {})
      .finally(() => setLoadingEmp(false))
  }, [])

  const handleLaunch = async () => {
    setError('')
    if (!employeeId) { setError('Sélectionnez un employé.'); return }
    if (!jobId)      { setError('Entrez l\'identifiant du poste (Job ID).'); return }

    setLaunching(true)
    try {
      const res = await testsApi.launch(employeeId, jobId, campaignId || undefined)
      setResult(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setLaunching(false)
    }
  }

  const examLink = result ? `${window.location.origin}/exam/${result.tokenAcces}` : ''

  const copyLink = async () => {
    await navigator.clipboard.writeText(examLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const selectedEmp = employes.find(e => e.id === employeeId)

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}><ShieldCheck size={20}/><span>ProfilCheck</span></div>
        <nav className={styles.nav}>
          {[
            { icon:ShieldCheck, label:'Dashboard',     path:'/dashboard' },
            { icon:Users,       label:'Employés',      path:'/employes' },
            { icon:FileText,    label:'Test en cours', path:'/test', active:true },
            { icon:Bell,        label:'Alertes',       path:'/alertes' },
            { icon:Settings,    label:'Mon profil',    path:'/profil' },
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
          <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16}/> Retour au dashboard
          </button>
          <div>
            <p className={styles.headerLabel}>Évaluation</p>
            <h2 className={styles.pageTitle}>Lancer un test de conformité</h2>
          </div>
        </header>

        <div className={styles.content}>
          <AnimatePresence mode="wait">
            {!result ? (
              /* ── Formulaire de lancement ── */
              <motion.div key="form" className={styles.formCard}
                initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}>

                <div className={styles.formHeader}>
                  <Send size={20} color="var(--bordeaux)"/>
                  <div>
                    <h3>Nouvelle évaluation</h3>
                    <p>Sélectionnez l'employé et le poste, puis transmettez le lien généré à l'employé.</p>
                  </div>
                </div>

                <div className={styles.fields}>
                  {/* Employé */}
                  <div className={styles.field}>
                    <label>Employé *</label>
                    {loadingEmp ? (
                      <div className={styles.loadingInline}><Loader2 size={16} className={styles.spin}/> Chargement…</div>
                    ) : (
                      <select value={employeeId} onChange={e => setEmployeeId(e.target.value)}>
                        <option value="">— Sélectionner un employé —</option>
                        {employes.map(e => (
                          <option key={e.id} value={e.id}>
                            {e.prenom} {e.nom} — {e.departmentName ?? 'N/D'}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Job ID */}
                  <div className={styles.field}>
                    <label>Identifiant du poste (Job ID) *</label>
                    <input type="text" value={jobId} onChange={e => setJobId(e.target.value)}
                      placeholder="UUID du poste (ex: 3fa85f64-5717-4562-b3fc-2c963f66afa6)"/>
                    <span className={styles.hint}>
                      Trouvez les IDs de postes dans la page{' '}
                      <button className={styles.hintLink} onClick={() => navigate('/fiches-postes')}>
                        Fiches de postes
                      </button>
                    </span>
                  </div>

                  {/* Campaign (optionnel) */}
                  <div className={styles.field}>
                    <label>Campagne (optionnel)</label>
                    <input type="text" value={campaignId} onChange={e => setCampaignId(e.target.value)}
                      placeholder="ID de campagne si applicable"/>
                  </div>
                </div>

                {error && (
                  <motion.p className={styles.error} initial={{opacity:0}} animate={{opacity:1}}>
                    ⚠️ {error}
                  </motion.p>
                )}

                <motion.button className={styles.launchBtn} onClick={handleLaunch}
                  disabled={launching} whileHover={!launching?{scale:1.02}:{}} whileTap={!launching?{scale:.97}:{}}>
                  {launching ? (
                    <><Loader2 size={16} className={styles.spin}/> Génération du token…</>
                  ) : (
                    <><Send size={16}/> Générer le lien de test</>
                  )}
                </motion.button>
              </motion.div>
            ) : (
              /* ── Résultat : token généré ── */
              <motion.div key="result" className={styles.resultCard}
                initial={{opacity:0,scale:.96}} animate={{opacity:1,scale:1}}>

                <div className={styles.successIcon}>
                  <Check size={32} color="var(--success)"/>
                </div>
                <h3 className={styles.successTitle}>Test généré avec succès !</h3>
                <p className={styles.successSub}>
                  Transmettez ce lien à{' '}
                  <strong>{selectedEmp ? `${selectedEmp.prenom} ${selectedEmp.nom}` : 'l\'employé'}</strong>.
                  Il donne accès à l'examen en ligne.
                </p>

                <div className={styles.tokenBox}>
                  <div className={styles.tokenLabel}><Link size={14}/> Lien d'accès à l'examen</div>
                  <div className={styles.tokenLink}>{examLink}</div>
                  <button className={styles.copyBtn} onClick={copyLink}>
                    {copied ? <><Check size={14}/> Copié !</> : <><Copy size={14}/> Copier</>}
                  </button>
                </div>

                <div className={styles.tokenInfo}>
                  <div><span>Session ID</span><code>{result.sessionId}</code></div>
                  <div><span>Token</span><code>{result.tokenAcces}</code></div>
                </div>

                <div className={styles.resultActions}>
                  <button className={styles.newTestBtn} onClick={() => setResult(null)}>
                    Lancer un autre test
                  </button>
                  <button className={styles.backDashBtn} onClick={() => navigate('/employes')}>
                    Retour aux employés
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
