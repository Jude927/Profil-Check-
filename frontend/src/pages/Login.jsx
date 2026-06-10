import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react'
import { authApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import styles from './Login.module.css'

export default function Login() {
  const navigate  = useNavigate()
  const { login } = useAuth()

  const [form, setForm]           = useState({ email: '', password: '' })
  const [showPassword, setShowPwd] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      setError('Veuillez remplir tous les champs.')
      return
    }

    setLoading(true)
    try {
      // Appel réel à POST /api/v1/auth/login
      const response = await authApi.login(form.email, form.password)
      // response = { token, role, userId, nom, prenom }

      const user = login(response) // stocke JWT + infos dans localStorage + context

      // Redirection selon le rôle
      if (user.role === 'DG')         navigate('/dg')
      else if (user.role === 'ADMIN') navigate('/utilisateurs')
      else                            navigate('/dashboard') // RH_MANAGER

    } catch (err) {
      setError(err.message || 'Email ou mot de passe incorrect.')
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
