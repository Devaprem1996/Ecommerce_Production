"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingBag,
  FolderTree,
  ClipboardList,
  FileText,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Bell,
  User,
  ShieldAlert,
  Loader2,
  Ticket,
  MapPin,
  Settings,
  Users,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/auth-store';
import { QueryProvider } from '@/providers/QueryProvider';
import { useAdminPendingActions } from '@/hooks/useAdmin';

interface AdminLayoutProps {
  children: React.ReactNode;
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isGuestPath =
    pathname === '/admin/login' ||
    pathname === '/admin/forgot-password' ||
    pathname === '/admin/reset-password';

  // Real-time Pending Operational Actions
  const [showNotifications, setShowNotifications] = useState(false);
  const { data: pendingData } = useAdminPendingActions({
    enabled: !isGuestPath && !checkingAuth,
  });
  const pendingNotifications = pendingData?.notifications || [];
  const unreadCount = pendingData?.totalUnread || 0;

  // Auth Guard
  useEffect(() => {
    if (isGuestPath) {
      setCheckingAuth(false);
      return;
    }

    const adminLoggedIn = localStorage.getItem('admin_logged_in');
    const authStore = useAuthStore.getState();
    const isAdmin =
      adminLoggedIn === 'true' ||
      authStore.role === 'admin' ||
      authStore.user?.role?.toLowerCase() === 'admin' ||
      Boolean(localStorage.getItem('admin_access_token'));

    if (!isAdmin) {
      router.replace('/admin/login');
    } else {
      localStorage.setItem('admin_logged_in', 'true');
      setCheckingAuth(false);
    }
  }, [pathname, router, isGuestPath]);

  // Force close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setShowNotifications(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/admin/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout API failed:', err);
    }
    localStorage.removeItem('admin_logged_in');
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('access_token');
    logout();
    toast.success('Logged out successfully!');
    router.replace('/admin/login');
  };

  const menuItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Orders', path: '/admin/orders', icon: ClipboardList },
    { label: 'Customers', path: '/admin/users', icon: Users },
    { label: 'Payments', path: '/admin/payments', icon: CreditCard },
    { label: 'Products', path: '/admin/products', icon: ShoppingBag },
    { label: 'Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Coupons', path: '/admin/coupons', icon: Ticket },
    { label: 'Delivery Pincodes', path: '/admin/settings/pincodes', icon: MapPin },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center space-y-3 font-sans">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
          Securing Admin Channel...
        </p>
      </div>
    );
  }

  // Handle guest paths layout rendering
  if (isGuestPath) {
    if (pathname === '/admin/login') {
      return <>{children}</>;
    }
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col justify-between p-4 font-sans text-neutral-250 w-full">
        {/* Top logo */}
        <div className="pt-8 flex justify-center">
          <span className="text-2xl font-bold font-heading tracking-wide text-primary-400">
            Yathu Arokiyagam<span className="text-secondary-400">.</span>
          </span>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center py-8">
          {children}
        </div>

        {/* Footer */}
        <div className="pb-8 text-center space-y-2 select-none">
          <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <span>🔒 SECURED CONNECTION</span>
          </div>
          <div className="text-[10px] text-neutral-600 font-semibold">
            &copy; {new Date().getFullYear()} Yathu Arokiyagam &mdash; Admin Portal
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-950 font-sans text-neutral-900 dark:text-neutral-100 transition-colors duration-normal">

      {/* SIDEBAR - DESKTOP */}
      <aside
        className={`hidden md:flex flex-col bg-[#1B4332] text-white transition-all duration-normal relative z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-primary-800/40">
          <Link href="/admin" className="flex items-center gap-2 focus:outline-none">
            <span className={`font-heading font-black tracking-wide ${isCollapsed ? 'text-lg text-center w-full' : 'text-xl'}`}>
              {isCollapsed ? 'Y.A.' : 'Yathu Arokiyagam Admin'}
            </span>
          </Link>

          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1 rounded-card hover:bg-primary-800/40 text-primary-250 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 py-6 px-3 space-y-1.5">
          {menuItems.map(item => {
            const isActive = pathname === item.path || (item.path !== '/admin' && (pathname ?? '').startsWith(item.path));
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.path}
                className={`flex items-center gap-3.5 px-3 py-3 rounded-card text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-primary-200 hover:bg-primary-800/30 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Collapse Expand bottom control */}
        <div className="p-3 border-t border-primary-800/40 space-y-1.5">
          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-full flex items-center justify-center p-3 rounded-card hover:bg-primary-800/30 text-primary-200 cursor-pointer"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-card text-xs font-bold uppercase tracking-wider hover:bg-red-900/20 text-red-300 hover:text-red-200 transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER OVERLAY */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-[1050] md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-[1px] cursor-pointer"
            />

            {/* Sidebar drawer content */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-[#1B4332] text-white flex flex-col z-10 shadow-2xl"
            >
              <div className="h-16 flex items-center justify-between px-5 border-b border-primary-800/40">
                <span className="font-heading font-black text-xl">Yathu Arokiyagam Admin</span>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1 rounded-card hover:bg-primary-800/40 text-primary-250 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 py-6 px-3 space-y-1.5">
                {menuItems.map(item => {
                  const isActive = pathname === item.path || (item.path !== '/admin' && (pathname ?? '').startsWith(item.path));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.label}
                      href={item.path}
                      className={`flex items-center gap-3.5 px-3 py-3 rounded-card text-xs font-bold uppercase tracking-wider cursor-pointer ${
                        isActive
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'text-primary-200 hover:bg-primary-800/30'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-3 border-t border-primary-800/40">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3.5 px-3 py-3 rounded-card text-xs font-bold uppercase tracking-wider hover:bg-red-900/20 text-red-300 hover:text-red-200 cursor-pointer"
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* HEADER BAR */}
        <header className="h-16 bg-white dark:bg-neutral-900 border-b border-neutral-150 dark:border-neutral-850 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {/* Hamburger for mobile */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 md:hidden text-neutral-600 dark:text-neutral-300 cursor-pointer"
            >
              <Menu className="w-5.5 h-5.5" />
            </button>

            {/* Breadcrumb status */}
            <h2 className="hidden sm:block text-xs font-extrabold uppercase tracking-widest text-neutral-400">
                Admin Workspace / <span className="text-neutral-900 dark:text-white capitalize">{(pathname ?? '').split('/').pop() || 'Overview'}</span>
            </h2>
          </div>

          <div className="flex items-center gap-4 relative">

            {/* Notification Badge Trigger */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-850 flex items-center justify-center text-neutral-600 dark:text-neutral-300 relative cursor-pointer focus:outline-none"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>

            {/* Notification dropdown card */}
            <AnimatePresence>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-12 top-12 w-80 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-feature shadow-2xl p-4 space-y-3 z-50 text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
                      <h4 className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                        Operational Alerts ({unreadCount})
                      </h4>
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {pendingNotifications.length > 0 ? (
                        pendingNotifications.map((n) => (
                          <Link
                            key={n.id}
                            href={n.link}
                            onClick={() => setShowNotifications(false)}
                            className="block p-2.5 rounded-card border bg-neutral-50/50 dark:bg-neutral-950/50 border-neutral-150 dark:border-neutral-800 hover:border-primary-500 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-neutral-900 dark:text-white">{n.title}</span>
                              <span className="text-[9px] font-black uppercase text-amber-500">{n.time}</span>
                            </div>
                            <p className="text-[11px] text-neutral-500 mt-0.5">{n.message}</p>
                          </Link>
                        ))
                      ) : (
                        <div className="py-6 text-center text-xs text-neutral-400 space-y-1">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                          <p>All clear! Zero pending operational actions.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Profile Avatar indicator */}
            <div className="flex items-center gap-2 border-l border-neutral-150 dark:border-neutral-800 pl-4">
              <div className="w-8 h-8 rounded-full bg-primary-500/10 text-primary-500 border flex items-center justify-center font-bold text-xs uppercase">
                AD
              </div>
              <div className="hidden lg:block text-left leading-none">
                <p className="text-xs font-bold text-neutral-905 dark:text-white">Admin User</p>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Super Administrator</span>
              </div>
            </div>

          </div>
        </header>

        {/* DYNAMIC CHILD VIEW AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <QueryProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </QueryProvider>
  );
}
