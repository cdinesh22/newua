import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const { t } = useLang()

  return (
    <div className="min-h-screen flex ind-anim-fade-up">
      {/* Tricolor top bar */}
      <div className="fixed top-0 left-0 right-0 h-1.5 z-40 tri-bar" />
      {/* Global floating language switcher */}
      <div className="fixed top-3 right-3 z-50">
        <LanguageSwitcher compact />
      </div>
      <aside className="w-64 glass-nav hidden md:flex md:flex-col animate-fade-in duration-300">
        <div className="p-4 border-b border-white/40 bg-transparent">
          <Link to="/" className="text-xl font-semibold text-[color:var(--india-saffron)]">{t('app_name')}</Link>
          <div className="text-xs text-gray-500">{t('app_tagline')}</div>
        </div>
        <nav className="p-4 space-y-2">
          <NavLink to="/" className={({isActive}) => `block px-3 py-2 rounded ind-nav-item ${isActive ? 'bg-white/20 text-saffron-700' : 'text-gray-700 hover:bg-white/10'}`}>{t('nav_home')}</NavLink>
          <NavLink to="/dashboard" className={({isActive}) => `block px-3 py-2 rounded ind-nav-item ${isActive ? 'bg-white/20 text-saffron-700' : 'text-gray-700 hover:bg-white/10'}`}>{t('nav_dashboard')}</NavLink>
          <NavLink to="/simulation" className={({isActive}) => `block px-3 py-2 rounded ind-nav-item ${isActive ? 'bg-white/20 text-saffron-700' : 'text-gray-700 hover:bg-white/10'}`}>{t('nav_simulation')}</NavLink>
          <NavLink to="/live" className={({isActive}) => `block px-3 py-2 rounded ind-nav-item ${isActive ? 'bg-white/20 text-saffron-700' : 'text-gray-700 hover:bg-white/10'}`}>{t('nav_live')}</NavLink>
          <NavLink to="/calendar" className={({isActive}) => `block px-3 py-2 rounded ind-nav-item ${isActive ? 'bg-white/20 text-saffron-700' : 'text-gray-700 hover:bg-white/10'}`}>Calendar</NavLink>
          <NavLink to="/community" className={({isActive}) => `block px-3 py-2 rounded ind-nav-item ${isActive ? 'bg-white/20 text-saffron-700' : 'text-gray-700 hover:bg-white/10'}`}>Community</NavLink>
          <NavLink to="/contact" className={({isActive}) => `block px-3 py-2 rounded ind-nav-item ${isActive ? 'bg-white/20 text-saffron-700' : 'text-gray-700 hover:bg-white/10'}`}>{t('nav_contact')}</NavLink>
        </nav>
        <div className="mt-auto p-4 border-t border-white/40 text-sm text-gray-700">
          {user ? (
            <div className="space-y-1">
              <div>{user.name}</div>
              <button onClick={logout} className="btn-india-outline">Logout</button>
            </div>
          ) : (
            <div className="space-x-3">
              <Link to="/login" className="btn-india-outline">Login</Link>
              <Link to="/register" className="btn-india">Register</Link>
            </div>
          )}
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8 animate-slide-up duration-300 ind-anim-fade-up glass-scope">
        {children}
        {/* Footer */}
        <footer className="mt-10 pt-6 border-t border-white/40 flex items-center justify-between gap-3">
          <div className="text-xs text-gray-500">© {new Date().getFullYear()} {t('app_name')}</div>
          {/* Reserved for future widgets */}
        </footer>
      </main>
    </div>
  )
}

