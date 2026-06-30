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
  Loader2
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Notification States
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New order #AETH-8910 received from Priya K.', time: '5m ago', read: false },
    { id: 2, text: 'Product "Raw Mountain Honey" stock low (12 units)', time: '2h ago', read: false },
    { id: 3, text: 'System update completed successfully', time: '1d ago', read: true }
  ]);

  // Auth Guard
  useEffect(() => {
    if (pathname === '/admin/login') {
      setCheckingAuth(false);
      return;
    }

    const isLoggedIn = localStorage.getItem('admin_logged_in');
    if (isLoggedIn !== 'true') {
      router.replace('/admin/login');
    } else {
      setCheckingAuth(false);
    }
  }, [pathname, router]);

  // Force close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setShowNotifications(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in');
    toast.success('Logged out successfully!');
    router.replace('/admin/login');
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const menuItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: ShoppingBag },
    { label: 'Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Orders', path: '/admin/orders', icon: ClipboardList },
    { label: 'Content', path: '/admin/content', icon: FileText },
    { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
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

  // If we are on the login page, render it directly without layout shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const unreadCount = notifications.filter(n => !n.read).length;

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
              {isCollapsed ? 'A.' : 'Aether Admin'}
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
            const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
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
                <span className="font-heading font-black text-xl">Aether Admin</span>
                <button 
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1 rounded-card hover:bg-primary-800/40 text-primary-250 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 py-6 px-3 space-y-1.5">
                {menuItems.map(item => {
                  const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
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
              Admin Workspace / <span className="text-neutral-900 dark:text-white capitalize">{pathname.split('/').pop() || 'Overview'}</span>
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
                      <h4 className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Notifications</h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-[10px] font-black text-primary-500 uppercase tracking-widest hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`p-2 rounded-card border transition-colors ${
                            n.read 
                              ? 'bg-neutral-50 dark:bg-neutral-950 border-neutral-100 dark:border-neutral-850 text-neutral-500' 
                              : 'bg-primary-500/5 border-primary-500/10 text-neutral-900 dark:text-white'
                          }`}
                        >
                          <p className="font-semibold leading-relaxed">{n.text}</p>
                          <span className="text-[9px] text-neutral-400 font-bold block mt-1">{n.time}</span>
                        </div>
                      ))}
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
                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Super Administrator</span>
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
