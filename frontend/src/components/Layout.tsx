import React, { useState } from 'react';
import { Link, useRouter } from '@tanstack/react-router';
import { LayoutDashboard, Users, FileText, History, Menu, X, Phone, LogOut, LogIn, Settings } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import AuthGuard from './AuthGuard';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/create-bill', label: 'New Bill', icon: FileText },
  { path: '/history', label: 'History', icon: History },
];

export default function Layout({ children }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { identity, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const router = useRouter();
  const isAuthenticated = !!identity;
  const currentPath = router.state.location.pathname;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-garage-card border-b border-garage-border shadow-card">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline">
            <img
              src="/assets/generated/fusion-gear-logo.dim_512x512.png"
              alt="FUSION GEAR"
              className="h-10 w-10 rounded object-cover"
            />
            <div>
              <div className="font-heading text-xl font-bold text-amber leading-none tracking-wider">
                FUSION GEAR
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>8073670402</span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors touch-target ${
                    isActive
                      ? 'bg-amber/20 text-amber border border-amber/40'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Auth + Mobile Menu */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                disabled={loginStatus === 'logging-in'}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded text-sm text-amber hover:bg-amber/10 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors touch-target"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-garage-border bg-garage-card">
            <nav className="flex flex-col p-2 gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-amber/20 text-amber border border-amber/40'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
              <div className="border-t border-garage-border mt-1 pt-1">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded text-sm text-amber hover:bg-amber/10 transition-colors"
                  >
                    <LogIn className="h-5 w-5" />
                    Login
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <AuthGuard>{children}</AuthGuard>
      </main>

      {/* Footer */}
      <footer className="border-t border-garage-border bg-garage-card py-3 px-4 text-center text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} FUSION GEAR · </span>
        <span>Built with </span>
        <span className="text-amber">♥</span>
        <span> using </span>
        <a
          href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'fusion-gear')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
