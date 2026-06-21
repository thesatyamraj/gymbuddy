import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Heart,
  MessageCircle,
  User,
  LogOut,
  Menu,
  X,
  Dumbbell,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useMatchStore } from '../store/matchStore';
import ThemeToggle from './ThemeToggle';

/**
 * Responsive navigation bar with mobile drawer, unread message badge, and match count badge
 */
export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdown, setIsProfileDropdown] = useState(false);
  const { user, logout } = useAuthStore();
  const { totalUnread } = useChatStore();
  const { newMatchCount, clearNewMatchCount } = useMatchStore();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/discover', label: 'Discover', icon: Flame },
    {
      to: '/matches',
      label: 'Matches',
      icon: Heart,
      badge: newMatchCount,
      onNavigate: clearNewMatchCount,
    },
    {
      to: '/chats',
      label: 'Chats',
      icon: MessageCircle,
      badge: totalUnread,
    },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsProfileDropdown(false);
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = (link) => {
    if (link.onNavigate) link.onNavigate();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/discover" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-strong transition-shadow">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-2xl font-bold uppercase tracking-wide text-slate-900 hidden sm:block">
              Gym<span className="text-primary-500">Buddy</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => handleNavClick(link)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 nav-link-interactive ${
                  isActive(link.to)
                    ? 'bg-primary-600/15 text-primary-400 ring-1 ring-primary-500/30'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
                {link.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-rose text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce-in badge-pulse">
                    {link.badge > 9 ? '9+' : link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Profile Dropdown */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdown(!isProfileDropdown)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                {user?.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={user.name}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                )}
                <span className="text-sm font-medium text-slate-700 max-w-24 truncate">
                  {user?.name}
                </span>
              </button>

              <AnimatePresence>
                {isProfileDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-surface ring-1 ring-slate-200 rounded-xl shadow-lg border border-slate-100 overflow-hidden"
                  >
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileDropdown(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-600" />
            ) : (
              <Menu className="w-5 h-5 text-slate-600" />
            )}
          </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden border-t border-slate-200/50"
          >
            <div className="px-4 py-3 space-y-1 bg-surface/95 backdrop-blur-lg">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => handleNavClick(link)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(link.to)
                      ? 'bg-primary-600/15 text-primary-400'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                  {link.badge > 0 && (
                    <span className="ml-auto w-5 h-5 bg-accent-rose text-white text-xs font-bold rounded-full flex items-center justify-center badge-pulse">
                      {link.badge > 9 ? '9+' : link.badge}
                    </span>
                  )}
                </Link>
              ))}
              <hr className="border-slate-100 my-2" />
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <User className="w-5 h-5" />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 w-full text-left"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
