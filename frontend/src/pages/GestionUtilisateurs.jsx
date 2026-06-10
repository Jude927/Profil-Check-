import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck, Users, Bell, FileText, Settings, LogOut,
  Plus, Search, Edit2, Trash2, X, Check, UserCheck, UserX, Shield, Eye, EyeOff
} from 'lucide-react'
import styles from './GestionUtilisateurs.module.css'

const utilisateurs = [
  { id:1, nom:'Sophie Renard',   email:'sophie.renard@profilcheck.fr',  role:'RH',   statut:'actif',    dept:'RH',     createdAt:'12/01/2026' },
  { id:2, nom:'Marc Dupont',     email:'marc.dupont@profilcheck.fr',    role:'RH',   statut:'actif',    dept:'Data',   createdAt:'08/02/2026' },
  { id:3, nom:'Julie Petit',     email:'julie.petit@profilcheck.fr',    role:'RH',   statut:'inactif',  dept:'Tech',   createdAt:'15/03/2026' },
  { id:4, nom:'Laurent Martin',  email:'l.martin@profilcheck.fr',       role:'DG',   statut:'actif',    dept:'Dir.',   createdAt:'01/01/2026' },
  { id:5, nom:'Emma Garcia',     email:'emma.garcia@profilcheck.fr',    role:'Admin',statut:'actif',    dept:'IT',     createdAt:'05/04/2026' },
  { id:6, nom:'Thomas Bernard',  email:'t.bernard@profilcheck.fr',      role:'RH',   statut:'suspendu', dept:'Finance',createdAt:'20/02/2026' },
]

const roleCfg = {
  Admin: { color:'#7C3AED', bg:'#F3E8FF', icon: Shield },
  DG:    { color:'#DC2626', bg:'#FEE2E2', icon: ShieldCheck },
  RH:    { color:'#2563EB', bg:'#EFF6FF', icon: Users },
}

const statutCfg = {
  actif:    { color:'var(--success)', bg:'#E6F4EC', label:'Actif' },
  inactif:  { color:'var(--text-mid)', bg:'var(--cream)', label:'Inactif' },
  suspendu: { color:'var(--danger)', bg:'#FEE2E2', label:'Suspendu' },
}

export default function GestionUtilisateurs() {
  const navigate = useNavigate()
  const [users, setUsers]       = useState(utilisateurs)
  const [search, setSearch]     = useState('')
  const [roleFilter, setRole]   = useState('Tous')
  const [showModal, setModal]   = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [delUser, setDelUser]   = useState(null)
  const [showPwd, setShowPwd]   = useState(false)
  const [form, setForm]         = useState({ nom:'', email:'', role:'RH', dept:'', mdp:'' })

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchQ = u.nom.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    const matchR = roleFilter === 'Tous' || u.role === roleFilter
    return matchQ && matchR
  })

  const openCreate = () => { setEditUser(null); setForm({ nom:'', email:'', role:'RH', dept:'', mdp:'' }); setModal(true) }
  const openEdit   = (u) => { setEditUser(u); setForm({ nom:u.nom, email:u.email, role:u.role, dept:u.dept, mdp:'' }); setModal(true) }

  const save = () => {
    if (!form.nom || !form.email) return
    if (editUser) {
      setUsers(prev => prev.map(u => u.id===editUser.id ? {...u,...form} : u))
    } else {
      setUsers(prev => [...prev, { id: Date.now(), ...form, statut:'actif', createdAt: new Date().toLocaleDateString('fr-FR') }])
    }
    setModal(false)
  }

  const confirmDelete = () => {
    setUsers(prev => prev.filter(u => u.id !== delUser.id))
    setDelUser(null)
  }

  const toggleStatut = (u) => {
    setUsers(prev => prev.map(x => x.id===u.id
      ? { ...x, statut: x.statut==='actif' ? 'suspendu' : 'actif' }
      : x))
  }

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
            { icon:Settings,    label:'Utilisateurs',path:'/utilisateurs', active:true },
          ].map(({ icon:Icon, label, path, active, badge }) => (
            <button key={label} className={`${styles.navItem} ${active?styles.navActive:''}`} onClick={() => navigate(path)}>
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
            <p className={styles.headerLabel}>Administration</p>
            <h2 className={styles.pageTitle}>Gestion des utilisateurs</h2>
          </div>
          <motion.button className={styles.addBtn} onClick={openCreate}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }}>
            <Plus size={15}/> Nouvel utilisateur
          </motion.button>
        </header>

        <div className={styles.content}>
          {/* Stats */}
          <div className={styles.statRow}>
            {[
              { label:'Total', value: users.length },
              { label:'Actifs', value: users.filter(u=>u.statut==='actif').length, color:'var(--success)' },
              { label:'Suspendus', value: users.filter(u=>u.statut==='suspendu').length, color:'var(--danger)' },
              { label:'RH', value: users.filter(u=>u.role==='RH').length },
              { label:'DG', value: users.filter(u=>u.role==='DG').length },
            ].map(s => (
              <div key={s.label} className={styles.statCard}>
                <span className={styles.statVal} style={{ color: s.color || 'var(--bordeaux)' }}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className={styles.filters}>
            <div className={styles.searchWrap}>
              <Search size={15} className={styles.searchIcon}/>
              <input placeholder="Rechercher un utilisateur…" value={search}
                onChange={e => setSearch(e.target.value)} className={styles.searchInput}/>
            </div>
            <div className={styles.roleFilters}>
              {['Tous','RH','DG','Admin'].map(r => (
                <button key={r} className={`${styles.rolePill} ${roleFilter===r?styles.roleActive:''}`}
                  onClick={() => setRole(r)}>{r}</button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {['Utilisateur','Email','Rôle','Département','Statut','Créé le','Actions'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((u, i) => {
                    const role  = roleCfg[u.role] || roleCfg.RH
                    const stat  = statutCfg[u.statut]
                    const RIcon = role.icon
                    return (
                      <motion.tr key={u.id}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }} transition={{ delay: i * .04 }}>
                        <td>
                          <div className={styles.userCell}>
                            <div className={styles.avatar}
                              style={{ background: role.bg, color: role.color }}>
                              {u.nom.split(' ').map(n=>n[0]).join('').slice(0,2)}
                            </div>
                            <span className={styles.userName}>{u.nom}</span>
                          </div>
                        </td>
                        <td className={styles.email}>{u.email}</td>
                        <td>
                          <span className={styles.roleBadge} style={{ color: role.color, background: role.bg }}>
                            <RIcon size={11}/> {u.role}
                          </span>
                        </td>
                        <td>{u.dept}</td>
                        <td>
                          <span className={styles.statutBadge} style={{ color: stat.color, background: stat.bg }}>
                            {stat.label}
                          </span>
                        </td>
                        <td>{u.createdAt}</td>
                        <td>
                          <div className={styles.actions}>
                            <button className={styles.actionBtn} onClick={() => openEdit(u)} title="Modifier">
                              <Edit2 size={14}/>
                            </button>
                            <button className={styles.actionBtn} onClick={() => toggleStatut(u)}
                              title={u.statut==='actif' ? 'Suspendre' : 'Réactiver'}>
                              {u.statut==='actif' ? <UserX size={14}/> : <UserCheck size={14}/>}
                            </button>
                            <button className={`${styles.actionBtn} ${styles.actionDel}`}
                              onClick={() => setDelUser(u)} title="Supprimer">
                              <Trash2 size={14}/>
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className={styles.empty}>Aucun utilisateur trouvé.</p>
            )}
          </div>
        </div>
      </main>

      {/* Modal create/edit */}
      <AnimatePresence>
        {showModal && (
          <motion.div className={styles.overlay} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setModal(false)}>
            <motion.div className={styles.modal} initial={{ scale:.95,opacity:0 }} animate={{ scale:1,opacity:1 }}
              exit={{ scale:.95,opacity:0 }} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>{editUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</h3>
                <button onClick={() => setModal(false)}><X size={18}/></button>
              </div>
              <div className={styles.modalBody}>
                {[
                  { label:'Nom complet', key:'nom', type:'text', placeholder:'Prénom Nom' },
                  { label:'E-mail professionnel', key:'email', type:'email', placeholder:'prenom.nom@entreprise.fr' },
                  { label:'Département', key:'dept', type:'text', placeholder:'Ex: Tech, RH, Finance...' },
                ].map(f => (
                  <div key={f.key} className={styles.field}>
                    <label>{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                      onChange={e => setForm(p => ({...p,[f.key]:e.target.value}))}/>
                  </div>
                ))}
                <div className={styles.field}>
                  <label>Rôle</label>
                  <select value={form.role} onChange={e => setForm(p => ({...p,role:e.target.value}))}>
                    {['RH','DG','Admin'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                {!editUser && (
                  <div className={styles.field}>
                    <label>Mot de passe provisoire</label>
                    <div className={styles.pwdWrap}>
                      <input type={showPwd?'text':'password'} placeholder="••••••••"
                        value={form.mdp} onChange={e => setForm(p => ({...p,mdp:e.target.value}))}/>
                      <button type="button" onClick={() => setShowPwd(v => !v)} className={styles.eyeBtn}>
                        {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={() => setModal(false)}>Annuler</button>
                <button className={styles.confirmBtn} onClick={save}>
                  <Check size={14}/> {editUser ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {delUser && (
          <motion.div className={styles.overlay} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setDelUser(null)}>
            <motion.div className={`${styles.modal} ${styles.modalSm}`}
              initial={{ scale:.95,opacity:0 }} animate={{ scale:1,opacity:1 }} exit={{ scale:.95,opacity:0 }}
              onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Supprimer l'utilisateur</h3>
                <button onClick={() => setDelUser(null)}><X size={18}/></button>
              </div>
              <div className={styles.delBody}>
                <div className={styles.delWarn}><Trash2 size={28} color="var(--danger)"/></div>
                <p>Êtes-vous sûr de vouloir supprimer <strong>{delUser.nom}</strong> ? Cette action est irréversible.</p>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={() => setDelUser(null)}>Annuler</button>
                <button className={styles.deleteBtn} onClick={confirmDelete}>
                  <Trash2 size={14}/> Supprimer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
