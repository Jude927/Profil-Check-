import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShieldCheck, Users, Bell, FileText, Settings, LogOut,
  User, Lock, Eye, EyeOff, Check, Camera, Mail, Building2, Briefcase
} from 'lucide-react'
import styles from './ProfilUtilisateur.module.css'

const activite = [
  { action:'Rapport exporté',          cible:'Alexandre Dubois',  date:'Aujourd\'hui 09:42', type:'ok' },
  { action:'Test lancé',               cible:'Marie Laurent',     date:'Aujourd\'hui 08:15', type:'info' },
  { action:'Alerte traitée',           cible:'Hugo Petit (Data)', date:'Hier 17:30',          type:'warn' },
  { action:'Profil mis à jour',        cible:'Kevin Torres',      date:'Hier 14:20',          type:'ok' },
  { action:'Connexion détectée',       cible:'—',                 date:'Hier 08:00',          type:'info' },
  { action:'Directive envoyée au DG',  cible:'Formation SQL Infra',date:'12/06/2026 11:10',  type:'ok' },
]

export default function ProfilUtilisateur() {
  const navigate = useNavigate()
  const [activeTab, setTab] = useState('infos')
  const [saved, setSaved]   = useState(false)

  const [infos, setInfos] = useState({
    prenom: 'Sophie', nom: 'Renard', email: 'sophie.renard@profilcheck.fr',
    dept: 'Ressources Humaines', poste: 'Gestionnaire RH Senior', tel: '+33 6 12 34 56 78',
  })

  const [notifs, setNotifs] = useState({
    alertesCritiques: true, nouvelleEval: true, directiveDG: true,
    rapportHebdo: false, connexionInconnue: true,
  })

  const [pwd, setPwd]         = useState({ actuel:'', nouveau:'', confirm:'' })
  const [showPwd, setShowPwd] = useState({ a:false, n:false, c:false })
  const [pwdError, setPwdErr] = useState('')
  const [pwdOk, setPwdOk]    = useState(false)

  const saveInfos = async () => {
    setSaved(true)
    await new Promise(r => setTimeout(r, 1200))
    setSaved(false)
  }

  const savePwd = () => {
    setPwdErr('')
    if (!pwd.actuel) return setPwdErr('Mot de passe actuel requis.')
    if (pwd.nouveau.length < 8) return setPwdErr('Le nouveau mot de passe doit faire 8 caractères minimum.')
    if (pwd.nouveau !== pwd.confirm) return setPwdErr('Les mots de passe ne correspondent pas.')
    setPwdOk(true)
    setPwd({ actuel:'', nouveau:'', confirm:'' })
    setTimeout(() => setPwdOk(false), 3000)
  }

  const tabs = [
    { id:'infos',   label:'Mes informations' },
    { id:'securite',label:'Sécurité' },
    { id:'notifs',  label:'Notifications' },
    { id:'activite',label:'Activité' },
  ]

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}><ShieldCheck size={20}/><span>ProfilCheck</span></div>
        <nav className={styles.nav}>
          {[
            { icon:ShieldCheck, label:'Dashboard',   path:'/dashboard' },
            { icon:Users,       label:'Employés',    path:'/employes' },
            { icon:Bell,        label:'Alertes',     path:'/alertes', badge:8 },
            { icon:FileText,    label:'Rapports',    path:'/rapport' },
            { icon:Settings,    label:'Mon profil',  path:'/profil', active:true },
          ].map(({ icon:Icon, label, path, active, badge }) => (
            <button key={label} className={`${styles.navItem} ${active?styles.navActive:''}`}
              onClick={() => navigate(path)}>
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
            <p className={styles.headerLabel}>Compte</p>
            <h2 className={styles.pageTitle}>Mon profil</h2>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.profileLayout}>
            {/* Left — avatar + role */}
            <motion.div className={styles.avatarCard}
              initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}>
              <div className={styles.avatarWrap}>
                <div className={styles.avatarBig}>SR</div>
                <button className={styles.avatarBtn}><Camera size={14}/></button>
              </div>
              <div className={styles.profileName}>{infos.prenom} {infos.nom}</div>
              <div className={styles.profileRole}>Gestionnaire RH</div>
              <span className={styles.roleBadge}>
                <ShieldCheck size={11}/> RH
              </span>
              <div className={styles.profileMeta}>
                <div className={styles.metaRow}><Mail size={13}/>{infos.email}</div>
                <div className={styles.metaRow}><Building2 size={13}/>{infos.dept}</div>
                <div className={styles.metaRow}><Briefcase size={13}/>{infos.poste}</div>
              </div>
            </motion.div>

            {/* Right — tabs */}
            <motion.div className={styles.tabsCard}
              initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }}>
              <div className={styles.tabBar}>
                {tabs.map(t => (
                  <button key={t.id} className={`${styles.tab} ${activeTab===t.id?styles.tabActive:''}`}
                    onClick={() => setTab(t.id)}>{t.label}</button>
                ))}
              </div>

              {/* Infos */}
              {activeTab === 'infos' && (
                <div className={styles.tabContent}>
                  <div className={styles.fieldsGrid}>
                    {[
                      { key:'prenom', label:'Prénom', icon:User },
                      { key:'nom',    label:'Nom',    icon:User },
                      { key:'email',  label:'E-mail', icon:Mail },
                      { key:'tel',    label:'Téléphone', icon:User },
                      { key:'dept',   label:'Département', icon:Building2 },
                      { key:'poste',  label:'Poste', icon:Briefcase },
                    ].map(({ key, label, icon:Icon }) => (
                      <div key={key} className={styles.field}>
                        <label>{label}</label>
                        <div className={styles.inputWrap}>
                          <Icon size={15} className={styles.inputIcon}/>
                          <input type="text" value={infos[key]}
                            onChange={e => setInfos(p => ({...p,[key]:e.target.value}))}/>
                        </div>
                      </div>
                    ))}
                  </div>
                  <motion.button className={styles.saveBtn} onClick={saveInfos}
                    whileHover={{ scale:1.02 }} whileTap={{ scale:.97 }}>
                    {saved ? <><Check size={15}/> Enregistré !</> : 'Enregistrer les modifications'}
                  </motion.button>
                </div>
              )}

              {/* Sécurité */}
              {activeTab === 'securite' && (
                <div className={styles.tabContent}>
                  <p className={styles.secDesc}>Modifiez votre mot de passe. Utilisez au minimum 8 caractères avec majuscules et chiffres.</p>
                  {[
                    { key:'actuel', label:'Mot de passe actuel', show:'a' },
                    { key:'nouveau', label:'Nouveau mot de passe', show:'n' },
                    { key:'confirm', label:'Confirmer le nouveau mot de passe', show:'c' },
                  ].map(({ key, label, show }) => (
                    <div key={key} className={styles.field} style={{ marginBottom:'.85rem' }}>
                      <label>{label}</label>
                      <div className={styles.inputWrap}>
                        <Lock size={15} className={styles.inputIcon}/>
                        <input type={showPwd[show]?'text':'password'} value={pwd[key]}
                          onChange={e => setPwd(p => ({...p,[key]:e.target.value}))} placeholder="••••••••"/>
                        <button className={styles.eyeBtn} type="button"
                          onClick={() => setShowPwd(p => ({...p,[show]:!p[show]}))}>
                          {showPwd[show] ? <EyeOff size={14}/> : <Eye size={14}/>}
                        </button>
                      </div>
                    </div>
                  ))}
                  {pwdError && <p className={styles.pwdError}>{pwdError}</p>}
                  {pwdOk    && <p className={styles.pwdOk}><Check size={13}/> Mot de passe mis à jour avec succès.</p>}
                  <motion.button className={styles.saveBtn} onClick={savePwd}
                    whileHover={{ scale:1.02 }} whileTap={{ scale:.97 }}>
                    Changer le mot de passe
                  </motion.button>
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifs' && (
                <div className={styles.tabContent}>
                  <p className={styles.secDesc}>Choisissez les événements pour lesquels vous souhaitez être notifié.</p>
                  <div className={styles.notifsList}>
                    {[
                      { key:'alertesCritiques', label:'Alertes critiques détectées',     desc:'Profils suspects ou non conformes' },
                      { key:'nouvelleEval',     label:'Nouvelle évaluation terminée',    desc:'Quand un test est complété' },
                      { key:'directiveDG',      label:'Nouvelle directive du DG',        desc:'Directives stratégiques reçues' },
                      { key:'rapportHebdo',     label:'Rapport hebdomadaire automatique',desc:'Chaque lundi à 08h00' },
                      { key:'connexionInconnue',label:'Connexion depuis un appareil inconnu', desc:'Alerte de sécurité' },
                    ].map(n => (
                      <div key={n.key} className={styles.notifRow}>
                        <div>
                          <div className={styles.notifLabel}>{n.label}</div>
                          <div className={styles.notifDesc}>{n.desc}</div>
                        </div>
                        <button className={`${styles.toggle} ${notifs[n.key]?styles.toggleOn:''}`}
                          onClick={() => setNotifs(p => ({...p,[n.key]:!p[n.key]}))}>
                          <span className={styles.toggleKnob}/>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activité */}
              {activeTab === 'activite' && (
                <div className={styles.tabContent}>
                  <p className={styles.secDesc}>Historique de vos dernières actions sur ProfilCheck.</p>
                  <div className={styles.activiteList}>
                    {activite.map((a, i) => (
                      <motion.div key={i} className={styles.activiteRow}
                        initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*.05 }}>
                        <div className={`${styles.actDot} ${styles['dot_'+a.type]}`}/>
                        <div className={styles.actInfo}>
                          <span className={styles.actAction}>{a.action}</span>
                          {a.cible !== '—' && <span className={styles.actCible}>· {a.cible}</span>}
                        </div>
                        <span className={styles.actDate}>{a.date}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
