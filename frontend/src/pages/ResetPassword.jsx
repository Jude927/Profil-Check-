import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react'
import styles from './ResetPassword.module.css'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [step, setStep]         = useState('email') // 'email' | 'code' | 'new' | 'done'
  const [email, setEmail]       = useState('')
  const [code, setCode]         = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleEmail = async () => {
    if (!email.includes('@')) { setError('Adresse e-mail invalide.'); return }
    setError(''); setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setStep('code')
  }

  const handleCode = async () => {
    if (code.length < 6) { setError('Code invalide.'); return }
    setError(''); setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    setLoading(false)
    setStep('new')
  }

  const handleNew = async () => {
    if (password.length < 8) { setError('Le mot de passe doit faire au moins 8 caractères.'); return }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    setError(''); setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
    setStep('done')
  }

  return (
    <div className={styles.page}>
      {/* Left deco */}
      <div className={styles.deco}>
        <div className={styles.decoCircle1}/>
        <div className={styles.decoCircle2}/>
        <div className={styles.decoContent}>
          <div className={styles.decoLogo}><ShieldCheck size={28}/></div>
          <h2 className={styles.decoTitle}>ProfilCheck</h2>
          <p className={styles.decoSub}>Sécurité des accès RH & DG</p>
          <div className={styles.decoBadge}>
            <ShieldCheck size={13}/> Données chiffrées & conformes RGPD
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className={styles.form}>
        <motion.div className={styles.card}
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}>

          <button className={styles.backLink} onClick={() => navigate('/login')}>
            <ArrowLeft size={15}/> Retour à la connexion
          </button>

          <AnimatePresence mode="wait">
            {step === 'done' ? (
              <motion.div key="done" className={styles.doneBox}
                initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }}>
                <div className={styles.doneIcon}><CheckCircle2 size={40} color="var(--success)"/></div>
                <h2 className={styles.doneTitle}>Mot de passe réinitialisé !</h2>
                <p className={styles.doneSub}>Vous pouvez maintenant vous connecter avec vos nouveaux identifiants.</p>
                <motion.button className={styles.submitBtn} onClick={() => navigate('/login')}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }}>
                  Se connecter
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className={styles.stepIndicator}>
                  {['email','code','new'].map((s, i) => (
                    <div key={s} className={`${styles.stepDot} ${step===s?styles.stepActive:['email','code','new'].indexOf(step)>i?styles.stepDone:''}`}/>
                  ))}
                </div>

                {step === 'email' && <>
                  <h2 className={styles.title}>Mot de passe oublié ?</h2>
                  <p className={styles.sub}>Entrez votre adresse e-mail professionnelle. Nous vous enverrons un code de vérification.</p>
                  <div className={styles.field}>
                    <label>Adresse e-mail</label>
                    <div className={styles.inputWrap}>
                      <Mail size={16} className={styles.inputIcon}/>
                      <input type="email" placeholder="prenom.nom@entreprise.com" value={email}
                        onChange={e => { setEmail(e.target.value); setError('') }}
                        onKeyDown={e => e.key==='Enter' && handleEmail()}/>
                    </div>
                  </div>
                  {error && <p className={styles.error}>{error}</p>}
                  <motion.button className={styles.submitBtn} onClick={handleEmail} disabled={loading}
                    whileHover={!loading?{scale:1.02}:{}} whileTap={!loading?{scale:.97}:{}}>
                    {loading ? <span className={styles.spin}>⚙</span> : 'Envoyer le code'}
                  </motion.button>
                </>}

                {step === 'code' && <>
                  <h2 className={styles.title}>Code de vérification</h2>
                  <p className={styles.sub}>Un code à 6 chiffres a été envoyé à <strong>{email}</strong></p>
                  <div className={styles.field}>
                    <label>Code de vérification</label>
                    <div className={styles.inputWrap}>
                      <Lock size={16} className={styles.inputIcon}/>
                      <input type="text" placeholder="000000" maxLength={6} value={code}
                        onChange={e => { setCode(e.target.value.replace(/\D/g,'')); setError('') }}
                        onKeyDown={e => e.key==='Enter' && handleCode()}
                        style={{ letterSpacing: '.2em', fontWeight: 700 }}/>
                    </div>
                  </div>
                  {error && <p className={styles.error}>{error}</p>}
                  <motion.button className={styles.submitBtn} onClick={handleCode} disabled={loading}
                    whileHover={!loading?{scale:1.02}:{}} whileTap={!loading?{scale:.97}:{}}>
                    {loading ? <span className={styles.spin}>⚙</span> : 'Vérifier le code'}
                  </motion.button>
                  <button className={styles.resendLink} onClick={() => setStep('email')}>Renvoyer le code</button>
                </>}

                {step === 'new' && <>
                  <h2 className={styles.title}>Nouveau mot de passe</h2>
                  <p className={styles.sub}>Choisissez un mot de passe sécurisé (minimum 8 caractères).</p>
                  <div className={styles.field}>
                    <label>Nouveau mot de passe</label>
                    <div className={styles.inputWrap}>
                      <Lock size={16} className={styles.inputIcon}/>
                      <input type={showPwd?'text':'password'} placeholder="••••••••"
                        value={password} onChange={e => { setPassword(e.target.value); setError('') }}/>
                      <button className={styles.eyeBtn} onClick={() => setShowPwd(v => !v)} type="button">
                        {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label>Confirmer le mot de passe</label>
                    <div className={styles.inputWrap}>
                      <Lock size={16} className={styles.inputIcon}/>
                      <input type={showPwd?'text':'password'} placeholder="••••••••"
                        value={confirm} onChange={e => { setConfirm(e.target.value); setError('') }}
                        onKeyDown={e => e.key==='Enter' && handleNew()}/>
                    </div>
                  </div>
                  {error && <p className={styles.error}>{error}</p>}
                  <motion.button className={styles.submitBtn} onClick={handleNew} disabled={loading}
                    whileHover={!loading?{scale:1.02}:{}} whileTap={!loading?{scale:.97}:{}}>
                    {loading ? <span className={styles.spin}>⚙</span> : 'Réinitialiser le mot de passe'}
                  </motion.button>
                </>}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
