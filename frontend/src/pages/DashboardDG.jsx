import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts'
import {
  ShieldCheck, Users, Bell, FileText, Settings, LogOut,
  TrendingUp, AlertTriangle, CheckCircle2, Clock,
  ArrowRight, Zap, Building2, ChevronRight
} from 'lucide-react'
import styles from './DashboardDG.module.css'

const deptData = [
  { dept: 'Tech',    conformes: 78, surveiller: 15, suspects: 7  },
  { dept: 'Data',    conformes: 65, surveiller: 25, suspects: 10 },
  { dept: 'Finance', conformes: 82, surveiller: 12, suspects: 6  },
  { dept: 'RH',      conformes: 91, surveiller: 7,  suspects: 2  },
  { dept: 'Design',  conformes: 88, surveiller: 9,  suspects: 3  },
  { dept: 'Infra',   conformes: 55, surveiller: 30, suspects: 15 },
]

const trendData = [
  { mois:'Jan', score:68 }, { mois:'Fév', score:71 }, { mois:'Mar', score:69 },
  { mois:'Avr', score:74 }, { mois:'Mai', score:76 }, { mois:'Jun', score:79 },
]

const directives = [
  { id:1, titre:'Plan de formation SQL — équipe Infra',    priorite:'Critique', rh:'Sophie R.', statut:'pending',  date:'10/06' },
  { id:2, titre:'Audit complet département Data',           priorite:'Haute',    rh:'Marc D.',   statut:'pending',  date:'09/06' },
  { id:3, titre:'Réévaluation profils suspects — Finance',  priorite:'Haute',    rh:'Sophie R.', statut:'done',     date:'07/06' },
  { id:4, titre:'Mise à jour fiches de poste DevOps',       priorite:'Moyenne',  rh:'Julie P.',  statut:'pending',  date:'05/06' },
]

const activite = [
  { action:'Test terminé',        nom:'Amara Diallo',   score:71, time:'Il y a 3min',  color:'#D97706' },
  { action:'Alerte déclenchée',   nom:'Omar Sy',        score:23, time:'Il y a 5min',  color:'#DC2626' },
  { action:'Rapport généré',      nom:'Sophie Martin',  score:92, time:'Il y a 12min', color:'#4A7C59' },
  { action:'Test en cours',       nom:'Yann Bernard',   score:null,time:'Il y a 18min',color:'#2563EB' },
  { action:'Directive résolue',   nom:'Lucas Petit',    score:41, time:'Il y a 1h',    color:'#4A7C59' },
]

const prioCfg = {
  Critique: { color:'#7C3AED', bg:'#F3E8FF' },
  Haute:    { color:'#DC2626', bg:'#FEE2E2' },
  Moyenne:  { color:'#D97706', bg:'#FEF3C7' },
  Basse:    { color:'#4A7C59', bg:'#E6F4EC' },
}

const navItems = [
  { id:'dashboard',   label:'Tableau de bord', icon:ShieldCheck, path:'/dg' },
  { id:'employes',    label:'Employés',         icon:Users,       path:'/employes' },
  { id:'alertes',     label:'Alertes',          icon:Bell,        path:'/alertes', badge:8 },
  { id:'directives',  label:'Directives',       icon:FileText,    path:'/directives' },
  { id:'departement', label:'Départements',     icon:Building2,   path:'/departement' },
  { id:'fiches',      label:'Fiches de postes', icon:Settings,    path:'/fiches-postes' },
  { id:'profil',      label:'Mon profil',       icon:Settings,    path:'/profil' },
]

const fade = (d=0) => ({ initial:{opacity:0,y:16}, animate:{opacity:1,y:0}, transition:{delay:d,duration:.4} })

export default function DashboardDG() {
  const navigate = useNavigate()
  const [active, setActive] = useState('dashboard')

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <ShieldCheck size={20}/><span>ProfilCheck</span>
          <span className={styles.dgBadge}>DG</span>
        </div>
        <nav className={styles.nav}>
          {navItems.map(({ id, label, icon:Icon, path, badge }) => (
            <button key={id}
              className={`${styles.navItem} ${active===id?styles.navActive:''}`}
              onClick={() => { setActive(id); navigate(path) }}>
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
            <p className={styles.headerLabel}>Espace Direction Générale</p>
            <h2 className={styles.pageTitle}>Centre de commandement</h2>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.notifBtn} onClick={() => navigate('/alertes')}>
              <Bell size={18}/><span className={styles.notifDot}/>
            </button>
            <div className={styles.avatar}>DG</div>
          </div>
        </header>

        <div className={styles.content}>
          {/* KPIs */}
          <div className={styles.kpiGrid}>
            {[
              { icon:Users,         label:'Total employés',    value:'124', delta:'+8',   pos:true,  sub:'ce mois' },
              { icon:TrendingUp,    label:'Conformité globale', value:'73%', delta:'+4%',  pos:true,  sub:'vs mois dernier' },
              { icon:AlertTriangle, label:'Alertes critiques',  value:'3',   delta:'-2',   pos:true,  sub:'en cours' },
              { icon:CheckCircle2,  label:'Taux de validation', value:'61%', delta:'+7%',  pos:true,  sub:'des profils' },
              { icon:FileText,      label:'Directives actives', value:'4',   delta:'',     pos:true,  sub:'en attente' },
              { icon:Zap,           label:'Tests ce mois',     value:'38',  delta:'+12',  pos:true,  sub:'sessions' },
            ].map(({ icon:Icon, label, value, delta, pos, sub }, i) => (
              <motion.div key={i} className={styles.kpiCard} {...fade(i*.06)}>
                <div className={styles.kpiTop}>
                  <div className={styles.kpiIcon}><Icon size={17}/></div>
                  {delta && (
                    <span className={`${styles.kpiDelta} ${pos?styles.deltaPos:styles.deltaNeg}`}>{delta}</span>
                  )}
                </div>
                <div className={styles.kpiValue}>{value}</div>
                <div className={styles.kpiLabel}>{label}</div>
                <div className={styles.kpiSub}>{sub}</div>
              </motion.div>
            ))}
          </div>

          <div className={styles.midRow}>
            {/* Stacked Bar — conformité par dept */}
            <motion.div className={styles.card} style={{flex:2}} {...fade(.36)}>
              <div className={styles.cardTitle}>Conformité par département</div>
              <div className={styles.cardSub}>Répartition des statuts · 6 départements</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deptData} barSize={22}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE3" vertical={false}/>
                  <XAxis dataKey="dept" tick={{fontSize:12,fill:'#78716C'}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:11,fill:'#78716C'}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{background:'#fff',border:'1px solid var(--border)',borderRadius:9,fontSize:12}}/>
                  <Bar dataKey="conformes"   name="Conformes"    fill="#4A7C59" radius={[0,0,0,0]} stackId="a"/>
                  <Bar dataKey="surveiller"  name="À surveiller" fill="#D97706" stackId="a"/>
                  <Bar dataKey="suspects"    name="Suspects"     fill="#DC2626" radius={[4,4,0,0]} stackId="a"/>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Trend global */}
            <motion.div className={styles.card} style={{flex:1}} {...fade(.40)}>
              <div className={styles.cardTitle}>Évolution globale</div>
              <div className={styles.cardSub}>Score moyen · 6 mois</div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="gDG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#8B1A2F" stopOpacity={.15}/>
                      <stop offset="95%" stopColor="#8B1A2F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE3"/>
                  <XAxis dataKey="mois" tick={{fontSize:11,fill:'#78716C'}} axisLine={false} tickLine={false}/>
                  <YAxis domain={[60,100]} tick={{fontSize:11,fill:'#78716C'}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{background:'#fff',border:'1px solid var(--border)',borderRadius:9,fontSize:12}} formatter={v=>[`${v}%`]}/>
                  <Area type="monotone" dataKey="score" stroke="#8B1A2F" strokeWidth={2.5} fill="url(#gDG)" dot={{fill:'#8B1A2F',r:4}}/>
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          <div className={styles.bottomRow}>
            {/* Directives */}
            <motion.div className={styles.card} style={{flex:1.4}} {...fade(.44)}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>Directives en attente</div>
                <button className={styles.seeAll} onClick={() => navigate('/directives')}>
                  Gérer <ChevronRight size={13}/>
                </button>
              </div>
              <div className={styles.directivesList}>
                {directives.map(d => {
                  const cfg = prioCfg[d.priorite]
                  return (
                    <div key={d.id} className={styles.directiveItem}>
                      <div className={styles.directiveLeft}>
                        <span className={styles.prioriteBadge} style={{color:cfg.color,background:cfg.bg}}>
                          {d.priorite}
                        </span>
                        <div>
                          <div className={styles.directiveTitre}>{d.titre}</div>
                          <div className={styles.directiveMeta}>RH : {d.rh} · {d.date}</div>
                        </div>
                      </div>
                      <div className={`${styles.directiveStatut} ${d.statut==='done'?styles.statutDone:styles.statutPending}`}>
                        {d.statut === 'done' ? <><CheckCircle2 size={13}/> Résolu</> : <><Clock size={13}/> En attente</>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Flux temps réel */}
            <motion.div className={styles.card} style={{flex:1}} {...fade(.48)}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>Activité en direct</div>
                <span className={styles.liveDot}><span/>En direct</span>
              </div>
              <div className={styles.activiteList}>
                {activite.map((a,i) => (
                  <motion.div key={i} className={styles.activiteItem}
                    initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} transition={{delay:.5+i*.08}}>
                    <div className={styles.activiteDot} style={{background:a.color}}/>
                    <div className={styles.activiteInfo}>
                      <span className={styles.activiteAction}>{a.action}</span>
                      <span className={styles.activiteNom}>{a.nom}</span>
                      {a.score !== null && (
                        <span className={styles.activiteScore} style={{color:a.color}}>{a.score}%</span>
                      )}
                    </div>
                    <span className={styles.activiteTime}>{a.time}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
