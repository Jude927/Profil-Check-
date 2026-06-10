import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, ArrowLeft } from 'lucide-react'
import styles from './NotFound.module.css'

export default function NotFound({ code = '404' }) {
  const navigate = useNavigate()
  const is403 = code === '403'

  return (
    <div className={styles.page}>
      <motion.div className={styles.card}
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}>

        <div className={styles.brand}><ShieldCheck size={22}/><span>ProfilCheck</span></div>

        <motion.div className={styles.code}
          initial={{ scale: .85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: .2, duration: .7, ease: 'easeOut' }}>
          {code}
        </motion.div>

        <h1 className={styles.title}>
          {is403 ? 'Accès refusé par les protocoles IA' : 'Cette ressource est introuvable'}
        </h1>

        <p className={styles.desc}>
          {is403
            ? 'Les algorithmes de conformité ProfilCheck ont détecté que votre niveau d\'habilitation est insuffisant pour accéder à ce profil sécurisé.'
            : 'Le profil ou la ressource que vous recherchez a été verrouillé, déplacé ou n\'existe pas dans notre base de données de conformité.'}
        </p>

        <div className={styles.badge}>
          <ShieldCheck size={14}/>
          {is403 ? 'Accès refusé · Niveau d\'habilitation insuffisant' : 'Ressource non trouvée · Code d\'audit #' + Math.random().toString(36).slice(2,8).toUpperCase()}
        </div>

        <motion.button className={styles.backBtn} onClick={() => navigate('/dashboard')}
          whileHover={{ x: -4 }} whileTap={{ scale: .97 }}>
          <ArrowLeft size={16}/> Retour au tableau de bord
        </motion.button>
      </motion.div>
    </div>
  )
}
