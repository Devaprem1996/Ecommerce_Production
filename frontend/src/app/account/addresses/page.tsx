"use client";

import React, { useEffect, useState } from 'react';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Loader2 
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { accountService, UserAddress } from '@/services/account.service';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Load Addresses from live Neon DB
  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await accountService.getAddresses();
      setAddresses(data);
    } catch (err: any) {
      console.error('Failed to load addresses:', err);
      toast.error('Failed to load addresses from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  // Open Drawer for Add Address
  const handleAddClick = () => {
    if (addresses.length >= 10) {
      toast.error('Maximum limit of 10 saved addresses reached. Please remove an address to add a new one.');
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
  const handleEditClick = (address: UserAddress) => {
    setEditingAddress(address);
    setName(address.fullName);
    setMobile(address.phone);
    setStreet(address.addressLine1);
    setCity(address.city);
    setState(address.state);
    setPincode(address.postalCode);
    setShowDrawer(true);
  };

  // Delete Address from live Neon DB
  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await accountService.deleteAddress(id);
      toast.success('Address deleted successfully.');
      await loadAddresses();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete address.');
    }
  };

  // Set Address as Default in live Neon DB
  const handleSetDefault = async (id: string) => {
    try {
      await accountService.setDefaultAddress(id);
      toast.success('Default delivery address updated.');
      await loadAddresses();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to set default address.');
    }
  };

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (name.trim().length < 2) {
      toast.error('Name must be at least 2 characters.');
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
    if (city.trim().length < 2) {
      toast.error('City must be at least 2 characters.');
      return;
    }
    if (state.trim().length < 2) {
      toast.error('State must be at least 2 characters.');
      return;
    }
    if (!/^\d{4,10}$/.test(pincode)) {
      toast.error('Please enter a valid postal code.');
      return;
    }

    setSaving(true);

    try {
      if (editingAddress) {
        // Edit mode
        await accountService.updateAddress(editingAddress.id, {
          fullName: name.trim(),
          phone: mobile.trim(),
          addressLine1: street.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: pincode.trim(),
        });
        toast.success('Address updated successfully in database.');
      } else {
        // Add mode
        await accountService.createAddress({
          fullName: name.trim(),
          phone: mobile.trim(),
          addressLine1: street.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: pincode.trim(),
          country: 'India',
          isDefault: addresses.length === 0,
        });
        toast.success('New address added to database.');
      }

      await loadAddresses();
      setShowDrawer(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save address.');
    } finally {
      setSaving(false);
    }
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
            Manage your delivery locations stored in the Neon database. (Max 10 addresses)
          </p>
        </div>

        <button
          onClick={handleAddClick}
          disabled={addresses.length >= 10 || loading}
          className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-neutral-250 disabled:text-neutral-500 border-none text-xs font-bold text-white rounded-card cursor-pointer transition-colors shadow-sm select-none"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Addresses Grid */}
      {loading ? (
        <div className="text-center py-16 px-4 bg-neutral-50/50 dark:bg-neutral-950/20 border border-neutral-150 dark:border-neutral-850 rounded-feature flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
            Loading saved addresses from database...
          </p>
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-16 px-4 bg-neutral-50/50 dark:bg-neutral-950/20 border border-neutral-150 dark:border-neutral-850 rounded-feature space-y-4">
          <div className="w-14 h-14 bg-neutral-200/50 dark:bg-neutral-800 rounded-full flex items-center justify-center text-neutral-450 mx-auto">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">No Addresses Saved</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-450 max-w-xs mx-auto">
              Please add a delivery address to facilitate faster checkout.
            </p>
          </div>
          <button
            onClick={handleAddClick}
            className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-card border-none cursor-pointer shadow-sm"
          >
            Add Address Now
          </button>
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
                    {addr.fullName}
                  </h4>
                  {addr.isDefault && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-primary-500/10 text-primary-500 border border-primary-500/15 uppercase tracking-wider select-none">
                      Default
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-neutral-600 dark:text-neutral-350 font-semibold leading-relaxed">
                  {addr.addressLine1}
                  {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-350 font-semibold">
                  {addr.city}, {addr.state} - <span className="font-bold">{addr.postalCode}</span>
                </p>
                <p className="text-[11px] text-neutral-500 font-medium pt-1">
                  Mobile: +91-{addr.phone}
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
            <div className="absolute inset-0" onClick={() => !saving && setShowDrawer(false)} />
            
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
                    disabled={saving}
                    className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 cursor-pointer disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} id="address-form" className="space-y-4">
                  {/* Name field */}
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5 select-none">
                      Contact Name *
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
                      10-Digit Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 9876543210"
                      className="w-full text-xs font-semibold px-3.5 py-2.5 bg-neutral-50 border border-neutral-250 rounded-card focus:outline-none focus:border-primary-500 focus:bg-white dark:bg-neutral-950 dark:border-neutral-800 dark:focus:bg-neutral-950 dark:focus:border-primary-500"
                    />
                  </div>

                  {/* Street field */}
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5 select-none">
                      Street Address *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Door No, Building, Street, Area"
                      className="w-full text-xs font-semibold px-3.5 py-2.5 bg-neutral-50 border border-neutral-250 rounded-card focus:outline-none focus:border-primary-500 focus:bg-white dark:bg-neutral-950 dark:border-neutral-800 dark:focus:bg-neutral-950 dark:focus:border-primary-500 resize-none"
                    />
                  </div>

                  {/* Two columns for City/State */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5 select-none">
                        City *
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
                        State *
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
                      Postal Pincode *
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
                  disabled={saving}
                  className="flex-1 py-2.5 border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs font-bold text-neutral-700 dark:text-neutral-300 rounded-card hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="address-form"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-primary-500 hover:bg-primary-600 border-none text-xs font-bold text-white rounded-card cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{saving ? 'Saving...' : 'Save Address'}</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
