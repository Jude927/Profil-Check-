import { useNavigate, useLocation } from 'react-router-dom'
import { ShieldCheck, Users, Bell, FileText, Settings, LogOut, LayoutDashboard, ClipboardList } from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',   path: '/dashboard' },
  { icon: Users,           label: 'Employés',    path: '/employes'  },
  { icon: Bell,            label: 'Alertes',     path: '/alertes',  badge: 8 },
  { icon: FileText,        label: 'Rapports',    path: '/rapport'   },
  { icon: ClipboardList,   label: 'Directives',  path: '/directives'},
  { icon: Settings,        label: 'Paramètres',  path: '/dashboard' },
]

export default function Sidebar({ activePath }) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const current   = activePath || location.pathname

  return (
    <aside className="w-[200px] shrink-0 bg-white h-screen sticky top-0 flex flex-col"
      style={{ borderRight: '1px solid var(--color-border)' }}>

      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-5"
        style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-primary)' }}>
        <ShieldCheck size={20} />
        <span className="font-serif font-bold text-[15px]">ProfilCheck</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 p-2 pt-3">
        {navItems.map(({ icon: Icon, label, path, badge }) => {
          const active = current === path
          return (
            <button key={path}
              onClick={() => navigate(path)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-[9px] text-[13.5px] font-medium w-full text-left transition-all duration-150"
              style={{
                background: active ? 'var(--color-accent-pale)' : 'transparent',
                color: active ? 'var(--color-primary)' : 'var(--color-text-sec)',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--color-surface-creme)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <Icon size={17} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'var(--color-primary)' }}>
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={() => navigate('/login')}
        className="flex items-center gap-2.5 mx-2 mb-3 px-3 py-2.5 rounded-[9px] text-[13.5px] transition-all duration-150"
        style={{ color: 'var(--color-text-sec)' }}
        onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = 'var(--color-danger)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-sec)' }}
      >
        <LogOut size={17} /><span>Déconnexion</span>
      </button>
    </aside>
  )
}
