"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useWishlist } from '@/hooks/useWishlist';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  MapPin, 
  Heart, 
  User, 
  Bell, 
  LogOut, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';

// Menu Items for Navigation
const NAV_ITEMS = [
  { label: 'Dashboard', path: '/account', icon: LayoutDashboard },
  { label: 'Orders', path: '/account/orders', icon: ShoppingBag },
  { label: 'Addresses', path: '/account/addresses', icon: MapPin },
  { label: 'Wishlist', path: '/account/wishlist', icon: Heart },
  { label: 'Profile', path: '/account/profile', icon: User },
  { label: 'Notifications', path: '/account/notifications', icon: Bell },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoggedIn, logout } = useAuthStore();
  const wishlistItems = useWishlist((state) => state.items);
  
  const [checking, setChecking] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  // 1. Auth Guard
  useEffect(() => {
    if (!isLoggedIn) {
      toast.error('Please login to access your account');
      router.replace(`/login?redirect=${encodeURIComponent(pathname || '/account')}`);
    } else {
      setChecking(false);
    }
  }, [isLoggedIn, router, pathname]);

  // 2. Initialize Mock LocalStorage Data (Orders, Addresses, Notifications)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Default Addresses
    if (!localStorage.getItem('user_addresses')) {
      const defaultAddresses = [
        {
          id: 'addr-1',
          name: 'John Doe',
          mobile: '9876543210',
          street: '12, Green Meadow Avenue, Alwarpet',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '600018',
          isDefault: true
        },
        {
          id: 'addr-2',
          name: 'John Doe (Office)',
          mobile: '9876543211',
          street: 'Tidel Park, 3rd Floor, C-Block, OMR',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '600113',
          isDefault: false
        }
      ];
      localStorage.setItem('user_addresses', JSON.stringify(defaultAddresses));
    }

    // Default Orders
    if (!localStorage.getItem('user_orders')) {
      const defaultOrders = [
        {
          id: 'AETH-78901',
          date: '2026-06-25',
          items: [
            { productId: 'prod-1', quantity: 2, price: 60 },
            { productId: 'prod-4', quantity: 1, price: 80 }
          ],
          total: 200,
          status: 'delivered',
          paymentMethod: 'online',
          paymentStatus: 'paid',
          trackingNumber: 'AETH-TRK-78901',
          courier: 'Delhivery'
        },
        {
          id: 'AETH-98319',
          date: '2026-06-30',
          items: [
            { productId: 'prod-2', quantity: 1, price: 350 },
            { productId: 'prod-7', quantity: 2, price: 240 }
          ],
          total: 830,
          status: 'processing',
          paymentMethod: 'cod',
          paymentStatus: 'pending',
          trackingNumber: 'AETH-TRK-98319',
          courier: 'Shadowfax'
        },
        {
          id: 'AETH-45612',
          date: '2026-07-01',
          items: [
            { productId: 'prod-6', quantity: 1, price: 90 }
          ],
          total: 90,
          status: 'pending',
          paymentMethod: 'online',
          paymentStatus: 'pending',
          trackingNumber: 'AETH-TRK-45612',
          courier: 'Ecom Express'
        }
      ];
      localStorage.setItem('user_orders', JSON.stringify(defaultOrders));
    }

    // Default Notifications
    if (!localStorage.getItem('user_notifications')) {
      const defaultNotifications = {
        orderSms: true,
        orderEmail: true,
        orderWhatsapp: true,
        promotions: false,
        alerts: true,
        newsletter: false
      };
      localStorage.setItem('user_notifications', JSON.stringify(defaultNotifications));
    }
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    setLogoutLoading(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      });
      
      if (response.ok) {
        logout(); // Clear Zustand state
        toast.success("You've been logged out successfully");
        router.replace('/');
      } else {
        toast.error('Logout failed on server. Clearing local session anyway.');
        logout();
        router.replace('/');
      }
    } catch (err) {
      logout();
      router.replace('/');
    } finally {
      setLogoutLoading(false);
      setShowLogoutModal(false);
    }
  };

  // Breadcrumbs Computation
  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    return [
      { label: 'Home', path: '/' },
      { label: 'Account', path: '/account' },
      ...paths.slice(1).map((p, idx) => {
        const fullPath = '/' + paths.slice(0, idx + 2).join('/');
        let label = p.charAt(0).toUpperCase() + p.slice(1);
        if (p.startsWith('AETH-')) {
          label = `Order ${p}`;
        }
        return { label, path: fullPath };
      })
    ];
  };

  if (checking || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-white dark:bg-neutral-950 font-sans">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest animate-pulse">
          Securing session...
        </p>
      </div>
    );
  }

  const breadcrumbs = getBreadcrumbs();
  const currentNav = NAV_ITEMS.find(item => item.path === pathname) || NAV_ITEMS[1]; // default fallback

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans text-neutral-900 dark:text-neutral-100 py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Dynamic Breadcrumbs */}
        <nav className="flex items-center space-x-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-450 mb-6 sm:mb-8 select-none">
          {breadcrumbs.map((bc, idx) => (
            <React.Fragment key={bc.path}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />}
              <span 
                onClick={() => idx < breadcrumbs.length - 1 && router.push(bc.path)}
                className={`hover:text-primary-600 transition-colors cursor-pointer ${
                  idx === breadcrumbs.length - 1 ? 'text-primary-500 font-bold' : ''
                }`}
              >
                {bc.label}
              </span>
            </React.Fragment>
          ))}
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden lg:block w-72 shrink-0 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 rounded-feature p-6 shadow-sm flex-col justify-between">
            <div>
              {/* User Meta Card */}
              <div className="flex items-center space-x-4 pb-6 mb-6 border-b border-neutral-100 dark:border-neutral-800">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-950/45 flex items-center justify-center text-primary-600 dark:text-primary-400 font-black text-lg border border-primary-200/50 uppercase select-none">
                  {user.avatar ? (
                    <img src={user.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.name ? user.name[0] : (user.email ? user.email[0] : 'U')
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                    {user.name || 'Aether Customer'}
                  </h3>
                  <p className="text-xs text-neutral-500 truncate mt-0.5 font-medium">
                    {user.mobile || 'No mobile linked'}
                  </p>
                </div>
              </div>

              {/* Sidebar Menu */}
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.path || (item.path !== '/account' && pathname?.startsWith(item.path));
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => router.push(item.path)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-card text-xs font-bold transition-all ${
                        isActive 
                          ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400' 
                          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.path === '/account/wishlist' && wishlistItems.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-[10px] text-white font-bold leading-none">
                          {wishlistItems.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Logout Button */}
            <div className="pt-6 mt-6 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-card text-xs font-bold text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* MOBILE TABS NAVIGATION */}
          <div className="lg:hidden w-full overflow-x-auto scrollbar-none pb-2 border-b border-neutral-200 dark:border-neutral-800 mb-4 select-none">
            <div className="flex space-x-1 min-w-max">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.path || (item.path !== '/account' && pathname?.startsWith(item.path));
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => router.push(item.path)}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-card text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-primary-500 text-white' 
                        : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                    {item.path === '/account/wishlist' && wishlistItems.length > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold leading-none ${
                        isActive ? 'bg-white text-primary-500' : 'bg-red-500 text-white'
                      }`}>
                        {wishlistItems.length}
                      </span>
                    )}
                  </button>
                );
              })}
              <button
                onClick={handleLogoutClick}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-card text-xs font-bold text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/10"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 min-w-0 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 rounded-feature p-4 sm:p-8 shadow-sm">
            {children}
          </main>
        </div>

      </div>

      {/* CONFIRMATION LOGOUT MODAL */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 rounded-feature border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 w-full max-w-sm text-center"
            >
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 mb-4">
                <LogOut className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                Sign Out Confirmation
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
                Are you sure you want to logout of your Aether Account? You will need to re-verify your identity to sign back in.
              </p>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  disabled={logoutLoading}
                  className="flex-1 py-2.5 border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs font-bold text-neutral-700 dark:text-neutral-300 rounded-card hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLogout}
                  disabled={logoutLoading}
                  className="flex-1 py-2.5 bg-red-650 hover:bg-red-700 border-none text-xs font-bold text-white rounded-card cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {logoutLoading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Yes, Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
