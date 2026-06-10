import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck, Clock, ChevronRight, ChevronLeft, Send,
  AlertCircle, CheckCircle2, ArrowLeft, Users, Bell, FileText, Settings, LogOut
} from 'lucide-react'
import styles from './TestPortal.module.css'

const questions = [
  {
    id: 1, domaine: 'Java', difficulte: 'Intermédiaire',
    enonce: 'Quelle interface Java permet d\'itérer sur une collection tout en supprimant des éléments en toute sécurité ?',
    options: ['Iterator', 'Iterable', 'ListIterator', 'Enumeration'],
    correct: 0,
  },
  {
    id: 2, domaine: 'Spring Boot', difficulte: 'Avancé',
    enonce: 'Quel est le rôle de l\'annotation @Transactional dans Spring Boot ?',
    options: [
      'Elle sécurise les endpoints REST avec JWT.',
      'Elle garantit qu\'une méthode s\'exécute dans une transaction de base de données.',
      'Elle active la mise en cache des résultats de la méthode.',
      'Elle injecte automatiquement les dépendances.',
    ],
    correct: 1,
  },
  {
    id: 3, domaine: 'SQL', difficulte: 'Intermédiaire',
    enonce: 'Quelle requête SQL récupère les employés dont le salaire est supérieur à la moyenne ?',
    options: [
      'SELECT * FROM employes WHERE salaire > AVG(salaire)',
      'SELECT * FROM employes HAVING salaire > AVG(salaire)',
      'SELECT * FROM employes WHERE salaire > (SELECT AVG(salaire) FROM employes)',
      'SELECT * FROM employes ORDER BY salaire DESC LIMIT 1',
    ],
    correct: 2,
  },
  {
    id: 4, domaine: 'Architecture', difficulte: 'Avancé',
    enonce: 'Dans une architecture REST, quel code HTTP doit être retourné lors de la création réussie d\'une ressource ?',
    options: ['200 OK', '201 Created', '204 No Content', '202 Accepted'],
    correct: 1,
  },
  {
    id: 5, domaine: 'Sécurité', difficulte: 'Avancé',
    enonce: 'Quelle est la durée recommandée pour un access token JWT en production ?',
    options: ['7 jours', '24 heures', '15 minutes', '1 heure'],
    correct: 2,
  },
  {
    id: 6, domaine: 'Base de données', difficulte: 'Intermédiaire',
    enonce: 'Quelle stratégie de chargement JPA est utilisée par défaut pour une relation @ManyToOne ?',
    options: ['LAZY', 'EAGER', 'CASCADE', 'MERGE'],
    correct: 1,
  },
  {
    id: 7, domaine: 'Soft Skills', difficulte: 'Débutant',
    enonce: 'Lors d\'un désaccord technique en équipe, quelle est la meilleure approche ?',
    options: [
      'Imposer sa solution car on est expert.',
      'Éviter le sujet pour ne pas créer de conflit.',
      'Présenter des arguments factuels et écouter les autres points de vue.',
      'Escalader immédiatement au manager.',
    ],
    correct: 2,
  },
  {
    id: 8, domaine: 'Java', difficulte: 'Avancé',
    enonce: 'Quelle est la différence entre une interface et une classe abstraite en Java ?',
    options: [
      'Aucune différence, les deux sont identiques.',
      'Une interface peut avoir des méthodes concrètes depuis Java 8 ; une classe abstraite peut avoir un état.',
      'Une classe abstraite ne peut pas avoir de constructeur.',
      'Une interface peut étendre plusieurs classes.',
    ],
    correct: 1,
  },
  {
    id: 9, domaine: 'Expérience', difficulte: 'Intermédiaire',
    enonce: 'Vous avez 3 ans d\'expérience déclarés en Data. Quel outil utiliseriez-vous pour un pipeline ETL complexe ?',
    options: ['Excel', 'Apache Airflow', 'Notepad++', 'FileZilla'],
    correct: 1,
  },
  {
    id: 10, domaine: 'SQL', difficulte: 'Avancé',
    enonce: 'Quelle est la différence entre INNER JOIN et LEFT JOIN ?',
    options: [
      'Il n\'y a aucune différence.',
      'INNER JOIN retourne toutes les lignes des deux tables.',
      'LEFT JOIN retourne toutes les lignes de la table gauche, même sans correspondance.',
      'LEFT JOIN est plus rapide qu\'INNER JOIN.',
    ],
    correct: 2,
  },
]

const DUREE_TOTALE = 45 * 60

const difficulteColor = {
  'Débutant':      { bg: '#E6F4EC', color: '#4A7C59' },
  'Intermédiaire': { bg: '#FEF3C7', color: '#D97706' },
  'Avancé':        { bg: '#FEE2E2', color: '#DC2626' },
}

export default function TestPortal() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [reponses, setReponses] = useState({})
  const [selected, setSelected] = useState(null)
  const [direction, setDirection] = useState(1)
  const [tempsRestant, setTempsRestant] = useState(DUREE_TOTALE)
  const timerRef = useRef(null)

  useEffect(() => {
    if (phase === 'test') {
      timerRef.current = setInterval(() => {
        setTempsRestant(t => {
          if (t <= 1) { clearInterval(timerRef.current); setPhase('termine'); return 0 }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [phase])

  const formatTime = s => {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  const timerPct = (tempsRestant / DUREE_TOTALE) * 100
  const timerUrgent = tempsRestant < 300
  const q = questions[currentIndex]
  const repondues = Object.keys(reponses).length

  const choisir = idx => setSelected(idx)

  const suivant = () => {
    if (selected === null) return
    const newReponses = { ...reponses, [q.id]: selected }
    setReponses(newReponses)
    setDirection(1)
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1)
      setSelected(newReponses[questions[currentIndex + 1]?.id] ?? null)
    } else {
      clearInterval(timerRef.current)
      setPhase('termine')
    }
  }

  const precedent = () => {
    if (currentIndex === 0) return
    setDirection(-1)
    setCurrentIndex(i => i - 1)
    setSelected(reponses[questions[currentIndex - 1]?.id] ?? null)
  }

  const score = questions.filter(q => reponses[q.id] === q.correct).length
  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0

  const getStatut = p => p >= 90 ? 'Excellent' : p >= 70 ? 'Conforme' : p >= 50 ? 'À surveiller' : 'Suspect'
  const getStatutColor = p => p >= 70 ? '#4A7C59' : p >= 50 ? '#D97706' : '#DC2626'

  // Sidebar commune
  const Sidebar = () => (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarBrand}>
        <ShieldCheck size={20} />
        <span>ProfilCheck</span>
      </div>
      <nav className={styles.sidebarNav}>
        {[
          { icon: ShieldCheck, label: 'Dashboard', path: '/dashboard' },
          { icon: Users,       label: 'Employés',  path: '/employes' },
          { icon: FileText,    label: 'Test en cours', path: '/test', active: true },
          { icon: Bell,        label: 'Alertes',   path: '/alertes' },
          { icon: Settings,    label: 'Mon profil',path: '/profil' },
        ].map(({ icon: Icon, label, path, active }) => (
          <button key={label}
            className={`${styles.navItem} ${active ? styles.navActive : ''}`}
            onClick={() => navigate(path)}
          >
            <Icon size={18} /><span>{label}</span>
          </button>
        ))}
      </nav>
      <button className={styles.logoutBtn} onClick={() => navigate('/login')}>
        <LogOut size={18} /><span>Déconnexion</span>
      </button>
    </aside>
  )

  // ── INTRO ──
  if (phase === 'intro') return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.mainArea}>
        <header className={styles.topBar}>
          <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} /> Retour au dashboard
          </button>
        </header>
        <div className={styles.centered}>
          <motion.div className={styles.introCard}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          >
            <h1 className={styles.introTitle}>Évaluation technique globale</h1>
            <p className={styles.introSub}>Employé : <strong>Amara Diallo</strong> — Analyste de données</p>

            <div className={styles.introInfoGrid}>
              {[
                { label: 'Questions',         value: `${questions.length} questions` },
                { label: 'Durée maximale',    value: '45 minutes' },
                { label: 'Domaines',          value: 'Java · SQL · Sécurité · Expérience · Soft Skills' },
                { label: 'Seuil conformité',  value: '70%' },
              ].map((info, i) => (
                <div key={i} className={styles.introInfoItem}>
                  <span className={styles.introInfoLabel}>{info.label}</span>
                  <span className={styles.introInfoValue}>{info.value}</span>
                </div>
              ))}
            </div>

            <div className={styles.introWarning}>
              <AlertCircle size={16} />
              <span>Le timer démarre dès que vous cliquez sur <strong>Commencer</strong>. Vous ne pouvez pas mettre en pause.</span>
            </div>

            <motion.button className={styles.startBtn}
              onClick={() => setPhase('test')}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            >
              Commencer le test <ChevronRight size={18} />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  )

  // ── TERMINÉ ──
  if (phase === 'termine') {
    const statutColor = getStatutColor(pct)
    const statut = getStatut(pct)
    return (
      <div className={styles.layout}>
        <Sidebar />
        <div className={styles.mainArea}>
          <div className={styles.centered}>
            <motion.div className={styles.termineCard}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
            >
              <h1 className={styles.termineTitle}>Test terminé !</h1>
              <p className={styles.termineSub}>{score} bonne{score > 1 ? 's' : ''} réponse{score > 1 ? 's' : ''} sur {questions.length}</p>

              <div className={styles.termineScoreWrap}>
                <svg viewBox="0 0 140 140" width="140" height="140">
                  <circle cx="70" cy="70" r="58" fill="none" stroke="#F0EBE3" strokeWidth="12"/>
                  <circle cx="70" cy="70" r="58" fill="none"
                    stroke={statutColor} strokeWidth="12"
                    strokeDasharray={`${2*Math.PI*58}`}
                    strokeDashoffset={`${2*Math.PI*58*(1-pct/100)}`}
                    strokeLinecap="round" transform="rotate(-90 70 70)"
                  />
                  <text x="70" y="65" textAnchor="middle" fontSize="26" fontWeight="700" fill="#1C1917" fontFamily="serif">{pct}%</text>
                  <text x="70" y="84" textAnchor="middle" fontSize="11" fill={statutColor} fontWeight="600">{statut}</text>
                </svg>
              </div>

              <div className={styles.termineDetails}>
                {questions.map((q, i) => {
                  const ok = reponses[q.id] === q.correct
                  return (
                    <div key={q.id} className={`${styles.termineItem} ${ok ? styles.termineOk : styles.termineKo}`}>
                      {ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                      <span className={styles.termineQ}>Q{i+1} — {q.domaine}</span>
                      <span className={styles.termineRes}>{ok ? 'Correct' : 'Incorrect'}</span>
                    </div>
                  )
                })}
              </div>

              <div className={styles.termineActions}>
                <button className={styles.termineBtn} onClick={() => navigate('/rapport')}>
                  <FileText size={16} /> Voir le rapport
                </button>
                <button className={styles.termineBtnSecond} onClick={() => navigate('/dashboard')}>
                  Retour au dashboard
                </button>
              </div>

              <p className={styles.termineNote}>
                Rapport disponible sous <strong>2 minutes</strong> · L'équipe RH a été notifiée
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  // ── TEST ──
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.mainArea}>
        <header className={styles.testHeader}>
          <div className={styles.progressCenter}>
            <span className={styles.qNum}>Question {currentIndex + 1} / {questions.length}</span>
            <div className={styles.progressBar}>
              <motion.div className={styles.progressFill}
                animate={{ width: `${((currentIndex) / questions.length) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
          <div className={`${styles.timer} ${timerUrgent ? styles.timerUrgent : ''}`}>
            <svg viewBox="0 0 40 40" width="28" height="28">
              <circle cx="20" cy="20" r="16" fill="none" stroke={timerUrgent ? '#FEE2E2' : '#F0EBE3'} strokeWidth="3"/>
              <circle cx="20" cy="20" r="16" fill="none"
                stroke={timerUrgent ? '#DC2626' : '#8B1A2F'} strokeWidth="3"
                strokeDasharray={`${2*Math.PI*16}`}
                strokeDashoffset={`${2*Math.PI*16*(1-timerPct/100)}`}
                strokeLinecap="round" transform="rotate(-90 20 20)"
              />
            </svg>
            <Clock size={14} />
            <span>{formatTime(tempsRestant)}</span>
          </div>
        </header>

        <div className={styles.testBody}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={q.id} className={styles.questionCard}
              custom={direction}
              variants={{
                enter: d => ({ opacity: 0, x: d > 0 ? 60 : -60 }),
                center: { opacity: 1, x: 0 },
                exit: d => ({ opacity: 0, x: d > 0 ? -60 : 60 }),
              }}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.28, ease: 'easeInOut' }}
            >
              <div className={styles.qTags}>
                <span className={styles.qDomaine}>{q.domaine}</span>
                <span className={styles.qDifficulte} style={difficulteColor[q.difficulte]}>{q.difficulte}</span>
              </div>
              <h2 className={styles.qEnonce}>{q.enonce}</h2>
              <div className={styles.optionsList}>
                {q.options.map((opt, i) => (
                  <motion.button key={i}
                    className={`${styles.option} ${selected === i ? styles.optionSelected : ''}`}
                    onClick={() => choisir(i)}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  >
                    <span className={styles.optionLetter}>{String.fromCharCode(65+i)}</span>
                    <span className={styles.optionText}>{opt}</span>
                    {selected === i && (
                      <motion.span className={styles.optionCheck} initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <CheckCircle2 size={18} />
                      </motion.span>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className={styles.navigation}>
            <button className={styles.navBtn} onClick={precedent} disabled={currentIndex === 0}>
              <ChevronLeft size={18} /> Précédent
            </button>
            <div className={styles.dotNav}>
              {questions.map((_, i) => (
                <div key={i} className={`${styles.dot}
                  ${i === currentIndex ? styles.dotActive : ''}
                  ${reponses[questions[i]?.id] !== undefined ? styles.dotDone : ''}`}
                />
              ))}
            </div>
            <motion.button
              className={`${styles.nextBtn} ${selected === null ? styles.nextDisabled : ''}`}
              onClick={suivant} disabled={selected === null}
              whileHover={selected !== null ? { scale: 1.02 } : {}}
              whileTap={selected !== null ? { scale: 0.97 } : {}}
            >
              {currentIndex === questions.length - 1
                ? <><Send size={16} /> Soumettre</>
                : <>Suivant <ChevronRight size={18} /></>}
            </motion.button>
          </div>
          <p className={styles.restantes}>
            {repondues} / {questions.length} réponses · {questions.length - repondues} restante{questions.length - repondues > 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  )
}
