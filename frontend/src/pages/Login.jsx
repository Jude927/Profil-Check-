import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, ShieldCheck, ArrowRight, Loader2, Zap } from 'lucide-react'
import { authApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import styles from './Login.module.css'

// Comptes démo (fonctionnent SANS backend)
const DEMO_ACCOUNTS = {
  'rh@demo.fr':    { password: 'demo', role: 'RH_MANAGER', nom: 'Renard',  prenom: 'Sophie', userId: 1, token: 'demo-token-rh' },
  'dg@demo.fr':    { password: 'demo', role: 'DG',          nom: 'Moreau',  prenom: 'Pierre', userId: 2, token: 'demo-token-dg' },
  'admin@demo.fr': { password: 'demo', role: 'ADMIN',        nom: 'Admin',   prenom: 'Super',  userId: 3, token: 'demo-token-admin' },
}

export default function Login() {
  const navigate  = useNavigate()
  const { login } = useAuth()

  const [form, setForm]           = useState({ email: '', password: '' })
  const [showPassword, setShowPwd] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  const doLogin = (authResponse) => {
    const user = login(authResponse)
    if (user.role === 'DG')         navigate('/dg')
    else if (user.role === 'ADMIN') navigate('/utilisateurs')
    else                            navigate('/dashboard')
  }

  // ── Connexion démo instantanée ──────────────────────────────────────────
  const handleDemo = (role) => {
    const accounts = { RH_MANAGER: DEMO_ACCOUNTS['rh@demo.fr'], DG: DEMO_ACCOUNTS['dg@demo.fr'], ADMIN: DEMO_ACCOUNTS['admin@demo.fr'] }
    doLogin(accounts[role])
  }

  // ── Connexion réelle (avec fallback démo) ──────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) { setError('Veuillez remplir tous les champs.'); return }

    // Vérification compte démo local
    const demo = DEMO_ACCOUNTS[form.email.toLowerCase()]
    if (demo && form.password === demo.password) {
      doLogin(demo)
      return
    }

    setLoading(true)
    try {
      const response = await authApi.login(form.email, form.password)
      doLogin(response)
    } catch (err) {
      setError(err.message || 'Email ou mot de passe incorrect. Essayez un compte démo ci-dessous.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.left}>
        <motion.div className={styles.leftContent}
          initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}>
          <div className={styles.logo}><ShieldCheck size={36}/><span>ProfilCheck</span></div>
          <h1 className={styles.tagline}>La vérité<br/>derrière<br/>chaque profil.</h1>
          <p className={styles.taglineSub}>
            Détectez les faux profils, évaluez les compétences réelles et bâtissez des équipes d'excellence.
          </p>
          <div className={styles.badges}>
            {['Conforme RGPD', 'AES-256', 'JWT Sécurisé'].map(b => (
              <span key={b} className={styles.badge}>{b}</span>
            ))}
          </div>
        </motion.div>
      </div>

      <div className={styles.right}>
        <motion.div className={styles.formBox}
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}>
          <h2 className={styles.title}>Bon retour 👋</h2>
          <p className={styles.sub}>Connectez-vous à votre espace ProfilCheck</p>

          {/* ── Accès démo rapide ── */}
          <div className={styles.demoBox}>
            <div className={styles.demoLabel}><Zap size={13}/> Accès démo instantané</div>
            <div className={styles.demoBtns}>
              <button className={styles.demoBtn} onClick={() => handleDemo('RH_MANAGER')}>
                👔 RH Manager
              </button>
              <button className={styles.demoBtn} onClick={() => handleDemo('DG')}>
                🏢 Directeur Général
              </button>
              <button className={`${styles.demoBtn} ${styles.demoBtnAdmin}`} onClick={() => handleDemo('ADMIN')}>
                ⚙️ Admin
              </button>
            </div>
          </div>

          <div className={styles.divider}><span>ou connectez-vous avec vos identifiants</span></div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label>Adresse email</label>
              <input type="email" placeholder="vous@entreprise.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                autoComplete="email"/>
            </div>

            <div className={styles.field}>
              <div className={styles.fieldHeader}>
                <label>Mot de passe</label>
                <button type="button" className={styles.forgot}
                  onClick={() => navigate('/reset-password')}>
                  Mot de passe oublié ?
                </button>
              </div>
              <div className={styles.passwordWrap}>
                <input type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="current-password"/>
                <button type="button" onClick={() => setShowPwd(p => !p)} className={styles.eyeBtn}>
                  {showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p className={styles.error}
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button type="submit" disabled={loading} className={styles.submitBtn}
              whileHover={!loading ? { scale: 1.015 } : {}}
              whileTap={!loading ? { scale: 0.975 } : {}}>
              {loading
                ? <><Loader2 size={16} className={styles.spin}/> Connexion en cours…</>
                : <><span>Se connecter</span><ArrowRight size={16}/></>}
            </motion.button>
          </form>

          <p className={styles.footer}>Accès sécurisé · Données chiffrées AES-256 · Conforme RGPD</p>
        </motion.div>
      </div>
    </div>
  )
}
