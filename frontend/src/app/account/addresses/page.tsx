"use client";

import React, { useEffect, useState } from 'react';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  AlertCircle,
  X,
  Home,
  Briefcase
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Address {
  id: string;
  name: string;
  mobile: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Load Addresses
  const loadAddresses = () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('user_addresses');
    if (stored) {
      setAddresses(JSON.parse(stored));
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  // Open Drawer for Add Address
  const handleAddClick = () => {
    if (addresses.length >= 5) {
      toast.error('Maximum limit of 5 saved addresses reached. Please delete an address to add a new one.');
      return;
    }
    setEditingAddress(null);
    setName('');
    setMobile('');
    setStreet('');
    setCity('');
    setState('');
    setPincode('');
    setShowDrawer(true);
  };

  // Open Drawer for Edit Address
  const handleEditClick = (address: Address) => {
    setEditingAddress(address);
    setName(address.name);
    setMobile(address.mobile);
    setStreet(address.street);
    setCity(address.city);
    setState(address.state);
    setPincode(address.pincode);
    setShowDrawer(true);
  };

  // Delete Address
  const handleDeleteAddress = (id: string) => {
    const updated = addresses.filter(addr => addr.id !== id);
    // If the deleted address was default, set the first remaining address as default
    if (addresses.find(addr => addr.id === id)?.isDefault && updated.length > 0) {
      updated[0].isDefault = true;
    }
    localStorage.setItem('user_addresses', JSON.stringify(updated));
    setAddresses(updated);
    toast.success('Address deleted successfully.');
  };

  // Set Address as Default
  const handleSetDefault = (id: string) => {
    const updated = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    }));
    localStorage.setItem('user_addresses', JSON.stringify(updated));
    setAddresses(updated);
    toast.success('Default address updated.');
  };

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (name.trim().length < 3) {
      toast.error('Name must be at least 3 characters.');
      return;
    }
    if (!/^\d{10}$/.test(mobile)) {
      toast.error('Mobile number must be exactly 10 digits.');
      return;
    }
    if (street.trim().length < 5) {
      toast.error('Street address must be at least 5 characters.');
      return;
    }
    if (city.trim().length < 3) {
      toast.error('City must be at least 3 characters.');
      return;
    }
    if (state.trim().length < 3) {
      toast.error('State must be at least 3 characters.');
      return;
    }
    if (!/^\d{6}$/.test(pincode)) {
      toast.error('Pincode must be exactly 6 digits.');
      return;
    }

    let updatedAddresses: Address[] = [];

    if (editingAddress) {
      // Edit mode
      updatedAddresses = addresses.map(addr => {
        if (addr.id === editingAddress.id) {
          return {
            ...addr,
            name,
            mobile,
            street,
            city,
            state,
            pincode
          };
        }
        return addr;
      });
      toast.success('Address updated successfully.');
    } else {
      // Add mode
      const newAddress: Address = {
        id: `addr-${Date.now()}`,
        name,
        mobile,
        street,
        city,
        state,
        pincode,
        isDefault: addresses.length === 0 // Default if it's the first address
      };
      updatedAddresses = [...addresses, newAddress];
      toast.success('New address added successfully.');
    }

    localStorage.setItem('user_addresses', JSON.stringify(updatedAddresses));
    setAddresses(updatedAddresses);
    setShowDrawer(false);
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <div>
          <h2 className="text-xl font-heading font-black text-neutral-900 dark:text-white">
            Saved Addresses
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
            Manage your delivery locations. (Max 5 addresses)
          </p>
        </div>

        <button
          onClick={handleAddClick}
          disabled={addresses.length >= 5}
          className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-neutral-250 disabled:text-neutral-500 border-none text-xs font-bold text-white rounded-card cursor-pointer transition-colors shadow-sm select-none"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Addresses Grid */}
      {addresses.length === 0 ? (
        <div className="text-center py-16 px-4 bg-neutral-50/50 dark:bg-neutral-950/20 border border-neutral-150 dark:border-neutral-850 rounded-feature space-y-4">
          <div className="w-14 h-14 bg-neutral-200/50 dark:bg-neutral-800 rounded-full flex items-center justify-center text-neutral-450 mx-auto">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">No Addresses Saved</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-450 max-w-xs mx-auto">
              Please add a shipping address to facilitate speedier checkouts.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.map((addr) => (
            <div 
              key={addr.id}
              className={`bg-white dark:bg-neutral-900 border rounded-feature p-5 shadow-sm space-y-4 flex flex-col justify-between transition-all ${
                addr.isDefault 
                  ? 'border-primary-500 ring-2 ring-primary-500/10' 
                  : 'border-neutral-150 dark:border-neutral-800 hover:border-neutral-250'
              }`}
            >
              {/* Card Title Row */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                    {addr.name}
                  </h4>
                  {addr.isDefault && (
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-primary-500/10 text-primary-500 border border-primary-500/15 uppercase tracking-wider select-none">
                      Default
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-neutral-600 dark:text-neutral-350 font-semibold leading-relaxed">
                  {addr.street}
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-350 font-semibold">
                  {addr.city}, {addr.state} - <span className="font-bold">{addr.pincode}</span>
                </p>
                <p className="text-[11px] text-neutral-500 font-medium pt-1">
                  Mobile: {addr.mobile}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 pt-3 mt-2 select-none">
                <div>
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-[10px] font-bold text-primary-500 hover:underline hover:text-primary-600 border-none bg-transparent cursor-pointer"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditClick(addr)}
                    className="p-2 border border-neutral-200 dark:border-neutral-750 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-card cursor-pointer"
                    title="Edit Address"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="p-2 border border-red-100 hover:border-red-200 dark:border-red-950 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-card cursor-pointer"
                    title="Delete Address"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* SLIDE-IN EDIT / ADD DRAWER */}
      <AnimatePresence>
        {showDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={() => setShowDrawer(false)} />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="relative w-full max-w-md bg-white dark:bg-neutral-900 h-full shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto"
            >
              <div>
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4 mb-6 select-none">
                  <h3 className="text-base font-black font-heading text-neutral-900 dark:text-white uppercase tracking-wider">
                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                  </h3>
                  <button 
                    onClick={() => setShowDrawer(false)}
                    className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} id="address-form" className="space-y-4">
                  {/* Name field */}
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5 select-none">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full text-xs font-semibold px-3.5 py-2.5 bg-neutral-50 border border-neutral-250 rounded-card focus:outline-none focus:border-primary-500 focus:bg-white dark:bg-neutral-950 dark:border-neutral-800 dark:focus:bg-neutral-950 dark:focus:border-primary-500"
                    />
                  </div>

                  {/* Mobile field */}
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5 select-none">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit mobile number"
                      className="w-full text-xs font-semibold px-3.5 py-2.5 bg-neutral-50 border border-neutral-250 rounded-card focus:outline-none focus:border-primary-500 focus:bg-white dark:bg-neutral-950 dark:border-neutral-800 dark:focus:bg-neutral-950 dark:focus:border-primary-500"
                    />
                  </div>

                  {/* Street field */}
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5 select-none">
                      Street Address
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="House No, Apartment Name, Street Area"
                      className="w-full text-xs font-semibold px-3.5 py-2.5 bg-neutral-50 border border-neutral-250 rounded-card focus:outline-none focus:border-primary-500 focus:bg-white dark:bg-neutral-950 dark:border-neutral-800 dark:focus:bg-neutral-950 dark:focus:border-primary-500 resize-none"
                    />
                  </div>

                  {/* Two columns for City/State */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5 select-none">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Chennai"
                        className="w-full text-xs font-semibold px-3.5 py-2.5 bg-neutral-50 border border-neutral-250 rounded-card focus:outline-none focus:border-primary-500 focus:bg-white dark:bg-neutral-950 dark:border-neutral-800 dark:focus:bg-neutral-950 dark:focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5 select-none">
                        State
                      </label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="e.g. Tamil Nadu"
                        className="w-full text-xs font-semibold px-3.5 py-2.5 bg-neutral-50 border border-neutral-250 rounded-card focus:outline-none focus:border-primary-500 focus:bg-white dark:bg-neutral-950 dark:border-neutral-800 dark:focus:bg-neutral-950 dark:focus:border-primary-500"
                      />
                    </div>
                  </div>

                  {/* Pincode field */}
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5 select-none">
                      Pincode
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="6-digit PIN code"
                      className="w-full text-xs font-semibold px-3.5 py-2.5 bg-neutral-50 border border-neutral-250 rounded-card focus:outline-none focus:border-primary-500 focus:bg-white dark:bg-neutral-950 dark:border-neutral-800 dark:focus:bg-neutral-950 dark:focus:border-primary-500"
                    />
                  </div>
                </form>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 border-t border-neutral-100 dark:border-neutral-800 pt-6 mt-6 select-none">
                <button
                  type="button"
                  onClick={() => setShowDrawer(false)}
                  className="flex-1 py-2.5 border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs font-bold text-neutral-700 dark:text-neutral-300 rounded-card hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="address-form"
                  className="flex-1 py-2.5 bg-primary-500 hover:bg-primary-600 border-none text-xs font-bold text-white rounded-card cursor-pointer"
                >
                  Save Address
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
