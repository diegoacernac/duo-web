import { NavLink } from 'react-router'
import { Home, Calendar, User } from 'lucide-react'

const tabs = [
  { to: '/', icon: Home, label: 'Inicio' },
  { to: '/plans', icon: Calendar, label: 'Planes' },
  { to: '/profile', icon: User, label: 'Perfil' },
]

export function BottomNav() {
  return (
    <nav
      className="flex items-center justify-around border-t border-[#1e1a28] bg-[#0e0b14]/95 backdrop-blur-sm pb-safe"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
    >
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-8 pt-3 pb-1 transition-colors ${
              isActive ? 'text-[#c084a8]' : 'text-[#3d3348]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[10px] tracking-wide">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
