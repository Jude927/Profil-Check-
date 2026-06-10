import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Clock, ChevronRight, CheckCircle2, AlertTriangle } from 'lucide-react'
import styles from './ExamPortal.module.css'

const questions = [
  { q: 'Quelle est la complexité temporelle d\'une recherche dans un tableau trié (dichotomie) ?', opts: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], answer: 1 },
  { q: 'Quel principe POO désigne la capacité d\'un objet à prendre plusieurs formes ?', opts: ['Abstraction', 'Encapsulation', 'Polymorphisme', 'Héritage'], answer: 2 },
  { q: 'Qu\'est-ce qu\'une transaction ACID en base de données ?', opts: ['Un type de jointure SQL', 'Un protocole réseau', 'Un ensemble de propriétés garantissant la fiabilité des transactions', 'Un algorithme de chiffrement'], answer: 2 },
  { q: 'Dans une architecture microservices, quel composant gère le routage des requêtes ?', opts: ['Docker', 'API Gateway', 'Kafka', 'Redis'], answer: 1 },
  { q: 'Quel design pattern permet de créer des objets sans spécifier leur classe concrète ?', opts: ['Singleton', 'Observer', 'Factory Method', 'Adapter'], answer: 2 },
  { q: 'Que signifie le "S" dans les principes SOLID ?', opts: ['Security Principle', 'Single Responsibility Principle', 'Synchronization Principle', 'Separation of Concerns'], answer: 1 },
  { q: 'Quelle commande Git permet de fusionner une branche en conservant l\'historique linéaire ?', opts: ['git merge', 'git rebase', 'git cherry-pick', 'git stash'], answer: 1 },
  { q: 'Qu\'est-ce qu\'une injection SQL ?', opts: ['Une méthode d\'optimisation des requêtes', 'Une vulnérabilité permettant d\'injecter du code SQL malveillant', 'Un outil de test de performance', 'Un type de procédure stockée'], answer: 1 },
  { q: 'Quel protocole HTTP est recommandé pour une API REST de modification d\'une ressource partielle ?', opts: ['POST', 'PUT', 'PATCH', 'DELETE'], answer: 2 },
  { q: 'Dans le contexte Spring Boot, à quoi sert l\'annotation @Transactional ?', opts: ['Définir un endpoint REST', 'Gérer automatiquement les transactions de base de données', 'Injecter des dépendances', 'Configurer la sécurité'], answer: 1 },
]

const DUREE = 30 * 60 // 30 min

export default function ExamPortal() {
  const { token } = useParams()
  const [phase, setPhase] = useState('intro') // intro | exam | done
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(DUREE)
  const [selected, setSelected] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (phase === 'exam') {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); setPhase('done'); return 0 }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [phase])

  const mins = String(Math.floor(timeLeft/60)).padStart(2,'0')
  const secs = String(timeLeft%60).padStart(2,'0')
  const urgent = timeLeft < 300

  const handleSelect = (idx) => setSelected(idx)

  const handleNext = () => {
    if (selected === null) return
    const newAnswers = { ...answers, [current]: selected }
    setAnswers(newAnswers)
    setSelected(null)
    if (current < questions.length - 1) {
      setCurrent(c => c + 1)
    } else {
      clearInterval(timerRef.current)
      setPhase('done')
    }
  }

  const score = Object.entries(answers).filter(([i, a]) => questions[+i].answer === a).length
  const pct   = Math.round((score / questions.length) * 100)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}><ShieldCheck size={20}/><span>ProfilCheck</span></div>
        {phase === 'exam' && (
          <div className={`${styles.timer} ${urgent ? styles.timerUrgent : ''}`}>
            <Clock size={15}/>
            <span>{mins}:{secs}</span>
          </div>
        )}
      </header>

      <div className={styles.container}>
        <AnimatePresence mode="wait">
          {/* INTRO */}
          {phase === 'intro' && (
            <motion.div key="intro" className={styles.card}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className={styles.introIcon}><ShieldCheck size={36} color="var(--bordeaux)"/></div>
              <h1 className={styles.introTitle}>Évaluation de compétences</h1>
              <p className={styles.introSub}>
                Bienvenue sur le portail d'évaluation <strong>ProfilCheck</strong>. Ce test mesure vos compétences techniques et comportementales pour établir votre Score de Conformité.
              </p>

              <div className={styles.introInfo}>
                {[
                  { label: 'Durée', value: '30 minutes' },
                  { label: 'Questions', value: `${questions.length} questions` },
                  { label: 'Domaines', value: 'Technique, Architecture, Sécurité' },
                  { label: 'Format', value: 'QCM — une seule bonne réponse' },
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

              <motion.button className={styles.startBtn} onClick={() => setPhase('exam')}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }}>
                Démarrer l'évaluation <ChevronRight size={16}/>
              </motion.button>

              {token && (
                <p className={styles.tokenInfo}>Token : <code>{token}</code></p>
              )}
            </motion.div>
          )}

          {/* EXAM */}
          {phase === 'exam' && (
            <motion.div key={`q-${current}`} className={styles.card}
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className={styles.progress}>
                <div className={styles.progressBar} style={{ width: `${((current + 1) / questions.length) * 100}%` }}/>
              </div>
              <div className={styles.qMeta}>
                <span className={styles.qNum}>Question {current + 1} / {questions.length}</span>
                <span className={styles.qDots}>
                  {questions.map((_, i) => (
                    <span key={i} className={`${styles.dot} ${i < current ? styles.dotDone : i === current ? styles.dotActive : ''}`}/>
                  ))}
                </span>
              </div>

              <p className={styles.qText}>{questions[current].q}</p>

              <div className={styles.opts}>
                {questions[current].opts.map((opt, idx) => (
                  <motion.button key={idx}
                    className={`${styles.opt} ${selected === idx ? styles.optSelected : ''}`}
                    onClick={() => handleSelect(idx)}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: .98 }}>
                    <span className={styles.optLetter}>{String.fromCharCode(65+idx)}</span>
                    <span>{opt}</span>
                    {selected === idx && <CheckCircle2 size={15} style={{ marginLeft: 'auto', color: 'var(--bordeaux)' }}/>}
                  </motion.button>
                ))}
              </div>

              <motion.button className={styles.nextBtn} onClick={handleNext} disabled={selected === null}
                whileHover={selected !== null ? { scale: 1.02 } : {}} whileTap={selected !== null ? { scale: .97 } : {}}>
                {current < questions.length - 1 ? 'Question suivante' : 'Terminer le test'}
                <ChevronRight size={16}/>
              </motion.button>
            </motion.div>
          )}

          {/* DONE */}
          {phase === 'done' && (
            <motion.div key="done" className={styles.card}
              initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className={styles.resultHeader}>
                <svg viewBox="0 0 120 120" width="120" height="120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="12"/>
                  <circle cx="60" cy="60" r="50" fill="none"
                    stroke={pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)'}
                    strokeWidth="12"
                    strokeDasharray={`${2*Math.PI*50}`}
                    strokeDashoffset={`${2*Math.PI*50*(1-pct/100)}`}
                    strokeLinecap="round" transform="rotate(-90 60 60)"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                  <text x="60" y="58" textAnchor="middle" dominantBaseline="middle"
                    style={{ fontFamily:'Playfair Display,serif', fontSize:'22px', fontWeight:700, fill:'var(--text-dark)' }}>
                    {pct}%
                  </text>
                  <text x="60" y="76" textAnchor="middle" style={{ fontSize:'9px', fill:'var(--text-light)', fontFamily:'Inter,sans-serif' }}>
                    score test
                  </text>
                </svg>
                <div>
                  <h2 className={styles.doneTitle}>Évaluation terminée</h2>
                  <p className={styles.doneSub}>
                    {score} / {questions.length} bonne{score>1?'s':''} réponse{score>1?'s':''}
                  </p>
                  <span className={styles.donePill} style={{
                    background: pct>=70 ? '#E6F4EC' : pct>=50 ? '#FEF3C7' : '#FEE2E2',
                    color: pct>=70 ? 'var(--success)' : pct>=50 ? 'var(--warning)' : 'var(--danger)',
                  }}>
                    {pct >= 70 ? 'Profil conforme' : pct >= 50 ? 'À surveiller' : 'Score insuffisant'}
                  </span>
                </div>
              </div>

              <p className={styles.doneMsg}>
                Vos résultats ont été transmis au service RH. Un responsable vous contactera prochainement pour faire le point sur votre évaluation.
              </p>

              <div className={styles.doneDetails}>
                {questions.map((q, i) => {
                  const ok = answers[i] === q.answer
                  return (
                    <div key={i} className={`${styles.doneRow} ${ok ? styles.doneRowOk : styles.doneRowKo}`}>
                      {ok ? <CheckCircle2 size={14}/> : <AlertTriangle size={14}/>}
                      <span>Q{i+1} — {ok ? 'Correct' : 'Incorrect'}</span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
