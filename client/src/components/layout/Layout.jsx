import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, ListChecks, BarChart3, UserRound, LogOut, Moon, Sun, Menu, X, Activity,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { logout } from '../../features/auth/authSlice';
import useTheme from '../../hooks/useTheme';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/habits', label: 'Habits', icon: ListChecks },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logout());
    toast.success('Logged out');
    navigate('/login');
  };

  const links = (onClick) =>
    NAV.map(({ to, label, icon: Icon, end }) => (
      <NavLink
        key={to}
        to={to}
        end={end}
        onClick={onClick}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
            isActive
              ? 'bg-emerald-600/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`
        }
      >
        <Icon size={18} aria-hidden />
        {label}
      </NavLink>
    ));

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 hidden w-60 flex-col border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-surface-dark-card lg:flex">
        <div className="mb-8 flex items-center gap-2 px-2 pt-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Activity size={18} aria-hidden />
          </span>
          <span className="font-display text-lg font-bold">HabitFlow</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1" aria-label="Main">{links()}</nav>
        <div className="space-y-1 border-t border-slate-200 pt-3 dark:border-slate-800">
          <button type="button" onClick={toggle} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
            {theme === 'dark' ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
            <LogOut size={18} aria-hidden />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-surface-dark/90 lg:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Activity size={16} aria-hidden />
          </span>
          <span className="font-display font-bold">HabitFlow</span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={toggle} aria-label="Toggle dark mode" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <button type="button" onClick={() => setMobileOpen((o) => !o)} aria-label="Open menu" aria-expanded={mobileOpen} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <nav aria-label="Main" className="absolute right-0 top-[57px] w-64 space-y-1 rounded-bl-2xl border-b border-l border-slate-200 bg-white p-4 shadow-xl animate-scale-in dark:border-slate-800 dark:bg-surface-dark-card">
            {links(() => setMobileOpen(false))}
            <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
              <LogOut size={18} aria-hidden /> Log out
            </button>
          </nav>
        </div>
      )}

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:ml-60 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-6xl">
          <p className="mb-6 text-sm text-slate-500 dark:text-slate-400 lg:hidden">
            Hey {user?.name?.split(' ')[0]} 👋
          </p>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
