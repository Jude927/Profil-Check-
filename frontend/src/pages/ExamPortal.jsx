/**
 * ExamPortal — Portail examen (accès candidat via token)
 * Flow:
 *  1. testsApi.verifyToken(token) → infos session
 *  2. testsApi.getQuestions(token) → liste questions
 *  3. Chrono basé sur dureeMinutes
 *  4. testsApi.submit(token, answers) → score + statut
 */
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Clock, ChevronRight, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'
import { testsApi } from '../services/api'
import styles from './ExamPortal.module.css'

export default function ExamPortal() {
  const { token } = useParams()

  const [phase, setPhase]       = useState('loading')  // loading | error | intro | exam | submitting | done
  const [session, setSession]   = useState(null)        // { sessionId, employeeNom, jobTitle, dureeMinutes }
  const [questions, setQuestions] = useState([])        // [{id, ordre, type, enonce, choix}]
  const [initError, setInitError] = useState('')

  // Exam state
  const [current, setCurrent]   = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers]   = useState([])          // [{questionId, contenu, tempsReponseMs}]
  const [timeLeft, setTimeLeft] = useState(0)
  const timerRef                = useRef(null)
  const qStartRef               = useRef(Date.now())

  // Result
  const [result, setResult]     = useState(null)        // {scoreConformite, statutFinal, message}

  // ── Initialisation : verify token ──
  useEffect(() => {
    if (!token) { setInitError('Token manquant.'); setPhase('error'); return }
    testsApi.verifyToken(token)
      .then(data => { setSession(data); setPhase('intro') })
      .catch(e => { setInitError(e.message); setPhase('error') })
  }, [token])

  // ── Démarrer l'examen ──
  const startExam = async () => {
    setPhase('loading')
    try {
      const qs = await testsApi.getQuestions(token)
      // tri par ordre
      const sorted = [...qs].sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
      setQuestions(sorted)
      setTimeLeft((session.dureeMinutes ?? 30) * 60)
      qStartRef.current = Date.now()
      setPhase('exam')
    } catch (e) {
      setInitError(e.message)
      setPhase('error')
    }
  }

  // ── Chronomètre ──
  useEffect(() => {
    if (phase === 'exam') {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0 }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [phase === 'exam'])

  const mins   = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs   = String(timeLeft % 60).padStart(2, '0')
  const urgent = timeLeft < 300

  // ── Sélection réponse ──
  const handleSelect = (opt) => setSelected(opt)

  // ── Question suivante ──
  const handleNext = () => {
    if (selected === null) return
    const tempsMs = Date.now() - qStartRef.current
    const q = questions[current]
    const newAnswers = [...answers, {
      questionId: q.id,
      contenu: selected,
      tempsReponseMs: tempsMs
    }]
    setAnswers(newAnswers)
    setSelected(null)
    qStartRef.current = Date.now()

    if (current < questions.length - 1) {
      setCurrent(c => c + 1)
    } else {
      clearInterval(timerRef.current)
      submitAnswers(newAnswers)
    }
  }

  // ── Soumettre (fin normale ou timeout) ──
  const handleSubmit = () => {
    clearInterval(timerRef.current)
    // Réponses partielles si timeout
    const finalAnswers = [...answers]
    if (selected !== null && questions[current]) {
      finalAnswers.push({
        questionId: questions[current].id,
        contenu: selected,
        tempsReponseMs: Date.now() - qStartRef.current
      })
    }
    submitAnswers(finalAnswers)
  }

  const submitAnswers = async (finalAnswers) => {
    setPhase('submitting')
    try {
      const res = await testsApi.submit(token, finalAnswers)
      setResult(res)
      setPhase('done')
    } catch (e) {
      // Afficher quand même la page done avec un message d'erreur
      setResult({ scoreConformite: 0, statutFinal: 'ERREUR', message: e.message })
      setPhase('done')
    }
  }

  // ── Helpers affichage ──
  const getStatusColor = (statut) => {
    switch (statut) {
      case 'CONFORME':     return { bg:'#E6F4EC', text:'var(--success)' }
      case 'A_SURVEILLER': return { bg:'#FEF3C7', text:'var(--warning)' }
      case 'SUSPECT':
      case 'NON_CONFORME': return { bg:'#FEE2E2', text:'var(--danger)' }
      default:             return { bg:'var(--bg)', text:'var(--text-mid)' }
    }
  }
  const getStatusLabel = (s) => ({
    CONFORME:'Profil conforme', A_SURVEILLER:'À surveiller',
    SUSPECT:'Suspect', NON_CONFORME:'Non conforme', ERREUR:'Erreur de soumission'
  }[s] ?? s)

  const q = questions[current]
  const choix = q?.choix ?? []

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}><ShieldCheck size={20}/><span>ProfilCheck</span></div>
        {phase === 'exam' && (
          <div className={`${styles.timer} ${urgent ? styles.timerUrgent : ''}`}>
            <Clock size={15}/><span>{mins}:{secs}</span>
          </div>
        )}
      </header>

      <div className={styles.container}>
        <AnimatePresence mode="wait">

          {/* ── LOADING ── */}
          {(phase === 'loading' || phase === 'submitting') && (
            <motion.div key="loading" className={styles.card}
              initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'1rem',padding:'3rem'}}>
              <Loader2 size={36} className={styles.spin} color="var(--bordeaux)"/>
              <p style={{color:'var(--text-mid)',fontSize:'.95rem'}}>
                {phase === 'submitting' ? 'Envoi de vos réponses…' : 'Chargement de l\'évaluation…'}
              </p>
            </motion.div>
          )}

          {/* ── ERROR ── */}
          {phase === 'error' && (
            <motion.div key="error" className={styles.card}
              initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
              <div className={styles.introIcon} style={{background:'#FEE2E2'}}>
                <AlertTriangle size={28} color="var(--danger)"/>
              </div>
              <h2 className={styles.introTitle}>Lien invalide ou expiré</h2>
              <p className={styles.introSub}>{initError}</p>
              <p className={styles.tokenInfo}>Contactez votre responsable RH pour obtenir un nouveau lien.</p>
            </motion.div>
          )}

          {/* ── INTRO ── */}
          {phase === 'intro' && (
            <motion.div key="intro" className={styles.card}
              initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}}>
              <div className={styles.introIcon}><ShieldCheck size={36} color="var(--bordeaux)"/></div>
              <h1 className={styles.introTitle}>Évaluation de compétences</h1>
              <p className={styles.introSub}>
                Bienvenue, <strong>{session?.employeeNom ?? ''}</strong> ! Ce test évalue vos compétences pour le poste{' '}
                <strong>{session?.jobTitle ?? ''}</strong>.
              </p>

              <div className={styles.introInfo}>
                {[
                  { label:'Durée',     value: `${session?.dureeMinutes ?? 30} minutes` },
                  { label:'Format',    value: 'QCM — une seule bonne réponse' },
                  { label:'Poste',     value: session?.jobTitle ?? '—' },
                ].map(({ label, value }) => (
                  <div key={label} className={styles.infoRow}>
                    <span className={styles.infoLabel}>{label}</span>
                    <span className={styles.infoValue}>{value}</span>
                  </div>
                ))}
              </div>

              <div className={styles.introBadge}>
                <AlertTriangle size={14}/>
                Une fois démarré, le chronomètre ne peut pas être mis en pause.
              </div>

              <motion.button className={styles.startBtn} onClick={startExam}
                whileHover={{scale:1.02}} whileTap={{scale:.97}}>
                Démarrer l'évaluation <ChevronRight size={16}/>
              </motion.button>
            </motion.div>
          )}

          {/* ── EXAM ── */}
          {phase === 'exam' && q && (
            <motion.div key={`q-${current}`} className={styles.card}
              initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}}>

              <div className={styles.progress}>
                <div className={styles.progressBar}
                  style={{width:`${((current+1)/questions.length)*100}%`}}/>
              </div>

              <div className={styles.qMeta}>
                <span className={styles.qNum}>Question {current+1} / {questions.length}</span>
                <span className={styles.qDots}>
                  {questions.map((_,i) => (
                    <span key={i} className={`${styles.dot}
                      ${i < current ? styles.dotDone : i === current ? styles.dotActive : ''}`}/>
                  ))}
                </span>
              </div>

              <p className={styles.qText}>{q.enonce}</p>

              <div className={styles.opts}>
                {choix.map((opt, idx) => (
                  <motion.button key={idx}
                    className={`${styles.opt} ${selected === opt ? styles.optSelected : ''}`}
                    onClick={() => handleSelect(opt)}
                    whileHover={{scale:1.01}} whileTap={{scale:.98}}>
                    <span className={styles.optLetter}>{String.fromCharCode(65+idx)}</span>
                    <span>{opt}</span>
                    {selected === opt && (
                      <CheckCircle2 size={15} style={{marginLeft:'auto', color:'var(--bordeaux)'}}/>
                    )}
                  </motion.button>
                ))}
              </div>

              <motion.button className={styles.nextBtn} onClick={handleNext}
                disabled={selected === null}
                whileHover={selected!==null?{scale:1.02}:{}} whileTap={selected!==null?{scale:.97}:{}}>
                {current < questions.length-1 ? 'Question suivante' : 'Terminer le test'}
                <ChevronRight size={16}/>
              </motion.button>
            </motion.div>
          )}

          {/* ── DONE ── */}
          {phase === 'done' && result && (
            <motion.div key="done" className={styles.card}
              initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}}>

              <div className={styles.resultHeader}>
                <svg viewBox="0 0 120 120" width="120" height="120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="12"/>
                  <circle cx="60" cy="60" r="50" fill="none"
                    stroke={result.scoreConformite>=70?'var(--success)':result.scoreConformite>=50?'var(--warning)':'var(--danger)'}
                    strokeWidth="12"
                    strokeDasharray={`${2*Math.PI*50}`}
                    strokeDashoffset={`${2*Math.PI*50*(1-(result.scoreConformite??0)/100)}`}
                    strokeLinecap="round" transform="rotate(-90 60 60)"
                    style={{transition:'stroke-dashoffset 1.2s ease'}}/>
                  <text x="60" y="57" textAnchor="middle" dominantBaseline="middle"
                    style={{fontFamily:'Playfair Display,serif',fontSize:'22px',fontWeight:700,fill:'var(--text-dark)'}}>
                    {Math.round(result.scoreConformite ?? 0)}%
                  </text>
                  <text x="60" y="75" textAnchor="middle"
                    style={{fontSize:'9px',fill:'var(--text-light)',fontFamily:'Inter,sans-serif'}}>
                    SC
                  </text>
                </svg>
                <div>
                  <h2 className={styles.doneTitle}>Évaluation terminée</h2>
                  <p className={styles.doneSub}>{result.message ?? ''}</p>
                  {result.statutFinal && (() => {
                    const c = getStatusColor(result.statutFinal)
                    return (
                      <span className={styles.donePill} style={{background:c.bg, color:c.text}}>
                        {getStatusLabel(result.statutFinal)}
                      </span>
                    )
                  })()}
                </div>
              </div>

              <p className={styles.doneMsg}>
                Vos résultats ont été transmis au service RH. Un responsable vous contactera prochainement.
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
