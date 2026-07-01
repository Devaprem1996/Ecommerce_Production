"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useTranslation } from 'react-i18next';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Camera, 
  Globe, 
  Smartphone, 
  Check, 
  Lock, 
  X,
  Languages
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { OtpInput } from '@/components/auth/OtpInput';

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const { i18n } = useTranslation();

  // Basic info states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [anniversary, setAnniversary] = useState('');
  const [language, setLanguage] = useState<'en' | 'ta'>('en');

  // UI state
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Avatar Upload States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  // Change Mobile OTP States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [newMobile, setNewMobile] = useState('');
  const [otpStep, setOtpStep] = useState<'phone' | 'otp'>('phone');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // Initialize from Zustand auth store
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setLanguage((user.language as 'en' | 'ta') || 'en');
      // Read extra fields if previously saved, otherwise fallback to empty
      const extra = localStorage.getItem(`profile_extra_${user.id}`);
      if (extra) {
        const parsed = JSON.parse(extra);
        setDob(parsed.dob || '');
        setAnniversary(parsed.anniversary || '');
      }
    }
  }, [user]);

  // Handle countdown for resending mobile OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showOtpModal && otpStep === 'otp' && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [showOtpModal, otpStep, countdown]);

  // Handle Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    // Save standard fields in Zustand Auth Store
    updateProfile({
      name,
      email,
      language
    });

    // Save extra fields in localStorage
    if (user) {
      const extraData = { dob, anniversary };
      localStorage.setItem(`profile_extra_${user.id}`, JSON.stringify(extraData));
    }

    setTimeout(() => {
      setSaving(false);
      setSavedSuccess(true);
      toast.success('Profile preferences updated successfully.');
      setTimeout(() => setSavedSuccess(false), 2000);
    }, 1000);
  };

  // Language Preferences Toggle
  const handleLanguageToggle = (lang: 'en' | 'ta') => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    toast.success(lang === 'ta' ? 'மொழி தமிழுக்கு மாற்றப்பட்டது' : 'Language set to English');
  };

  // Trigger hidden input upload click
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Read selected image file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setTempImage(reader.result as string);
        setScale(1);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Confirm image cropping
  const handleCropApply = () => {
    if (tempImage) {
      // In a real application, we would crop it using HTML5 Canvas or library.
      // Here, we save the image data and apply styling in the UI.
      setAvatarBase64(tempImage);
      updateProfile({
        avatar: tempImage
      });
      toast.success('Avatar uploaded successfully!');
    }
    setShowCropModal(false);
  };

  // OTP Verification: Send code
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(newMobile)) {
      toast.error('Mobile number must be exactly 10 digits.');
      return;
    }
    if (newMobile === user?.mobile) {
      toast.error('New mobile number cannot be the same as current.');
      return;
    }

    // Generate random mock 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpError(false);
    setCountdown(60);
    
    // Simulate API delay
    toast.info('Sending verification code...');
    setTimeout(() => {
      setOtpStep('otp');
      toast.success(`[MOCK OTP] Verification code: ${code}`);
      console.log(`Generated OTP code: ${code}`);
    }, 800);
  };

  // OTP Verification: Resend code
  const handleResendOtp = () => {
    if (countdown > 0) return;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setCountdown(60);
    setOtpError(false);
    toast.success(`[MOCK OTP] Verification code: ${code}`);
  };

  // OTP Verification: Final Verify
  const handleOtpComplete = (otpCode: string) => {
    if (otpCode === generatedOtp) {
      updateProfile({
        mobile: newMobile
      });
      toast.success('Mobile number updated successfully!');
      setShowOtpModal(false);
      setNewMobile('');
      setOtpStep('phone');
    } else {
      setOtpError(true);
      toast.error('Invalid verification OTP code. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <h2 className="text-xl font-heading font-black text-neutral-900 dark:text-white">
          Profile Settings
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
          Manage your personal identity details.
        </p>
      </div>

      {/* Profile Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: Avatar Display */}
        <div className="flex flex-col items-center justify-start text-center space-y-4 pt-4 border-r-0 md:border-r border-neutral-100 dark:border-neutral-800/80 pr-0 md:pr-8">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <div className="w-28 h-28 rounded-full bg-primary-100 dark:bg-primary-950/20 border-2 border-primary-250 flex items-center justify-center text-primary-600 dark:text-primary-400 font-black text-4xl overflow-hidden uppercase select-none shadow-md">
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                user?.name ? user.name[0] : 'U'
              )}
            </div>
            {/* Cam Overlay */}
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Camera className="w-6 h-6" />
            </div>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
              Profile Avatar
            </h4>
            <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">
              Accepts JPG, PNG formats.<br />Max size 2MB.
            </p>
          </div>
        </div>

        {/* Right Side: Form details */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="space-y-5">
            {/* Name Input */}
            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5 select-none">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full text-xs font-semibold pl-10 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-250 rounded-card focus:outline-none focus:border-primary-500 focus:bg-white dark:bg-neutral-950 dark:border-neutral-800 dark:focus:bg-neutral-950 dark:focus:border-primary-500"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5 select-none">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full text-xs font-semibold pl-10 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-250 rounded-card focus:outline-none focus:border-primary-500 focus:bg-white dark:bg-neutral-950 dark:border-neutral-800 dark:focus:bg-neutral-950 dark:focus:border-primary-500"
                />
              </div>
            </div>

            {/* Mobile Info Grid */}
            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5 select-none">
                Mobile Number
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    disabled
                    value={user?.mobile || 'No mobile linked'}
                    className="w-full text-xs font-semibold pl-10 pr-3.5 py-2.5 bg-neutral-100 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-850 rounded-card text-neutral-500 cursor-not-allowed"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOtpStep('phone');
                    setShowOtpModal(true);
                  }}
                  className="px-4 py-2 border border-primary-500/20 bg-primary-500/5 hover:bg-primary-500/10 text-xs font-bold text-primary-500 rounded-card transition-colors cursor-pointer select-none"
                >
                  Change Number
                </button>
              </div>
            </div>

            {/* Two Column Dates (DOB / Anniversary) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5 select-none">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full text-xs font-semibold pl-10 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-250 rounded-card focus:outline-none focus:border-primary-500 focus:bg-white dark:bg-neutral-950 dark:border-neutral-800 dark:focus:bg-neutral-950 dark:focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5 select-none">
                  Anniversary <span className="text-[9px] text-neutral-400 lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                  <input
                    type="date"
                    value={anniversary}
                    onChange={(e) => setAnniversary(e.target.value)}
                    className="w-full text-xs font-semibold pl-10 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-250 rounded-card focus:outline-none focus:border-primary-500 focus:bg-white dark:bg-neutral-950 dark:border-neutral-800 dark:focus:bg-neutral-950 dark:focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Language Preference */}
            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2 select-none">
                Language Preference
              </label>
              <div className="flex gap-3 select-none">
                <button
                  type="button"
                  onClick={() => handleLanguageToggle('en')}
                  className={`flex-1 py-3 border text-xs font-bold rounded-card cursor-pointer transition-all flex items-center justify-center gap-2 ${
                    language === 'en'
                      ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400 font-bold'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  English
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageToggle('ta')}
                  className={`flex-1 py-3 border text-xs font-bold rounded-card cursor-pointer transition-all flex items-center justify-center gap-2 ${
                    language === 'ta'
                      ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400 font-bold'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <Languages className="w-4 h-4" />
                  தமிழ் (Tamil)
                </button>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 select-none">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-6 py-2.5 bg-primary-500 hover:bg-primary-600 border-none text-xs font-bold text-white rounded-card cursor-pointer flex items-center justify-center gap-2 shadow-sm min-w-[140px]"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : savedSuccess ? (
                  <Check className="w-4 h-4 text-white" />
                ) : null}
                <span>{saving ? 'Saving...' : savedSuccess ? 'Saved!' : 'Save Preferences'}</span>
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* AVATAR CROP MODAL */}
      <AnimatePresence>
        {showCropModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
            <div className="absolute inset-0" onClick={() => setShowCropModal(false)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white dark:bg-neutral-900 rounded-feature border border-neutral-200 dark:border-neutral-850 shadow-2xl p-6 text-center space-y-6"
            >
              <div className="flex justify-between items-center pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <h3 className="text-sm font-bold text-neutral-950 dark:text-white uppercase tracking-wider">
                  Crop & Resize Avatar
                </h3>
                <button 
                  onClick={() => setShowCropModal(false)}
                  className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Crop Box */}
              <div className="relative w-48 h-48 mx-auto bg-neutral-100 dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-850 rounded overflow-hidden flex items-center justify-center">
                {tempImage && (
                  <img
                    src={tempImage}
                    alt="preview"
                    className="max-w-full max-h-full transition-transform"
                    style={{ transform: `scale(${scale})` }}
                  />
                )}
                {/* Overlay Guide Circle */}
                <div className="absolute inset-0 border-[24px] border-black/45 pointer-events-none" />
                <div className="absolute w-40 h-40 border border-dashed border-white rounded-full pointer-events-none" />
              </div>

              {/* Scale Slider */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-left">
                  Scale: {scale.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full accent-primary-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCropModal(false)}
                  className="flex-1 py-2.5 border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs font-bold text-neutral-700 dark:text-neutral-300 rounded-card hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropApply}
                  className="flex-1 py-2.5 bg-primary-500 hover:bg-primary-600 border-none text-xs font-bold text-white rounded-card cursor-pointer"
                >
                  Crop Avatar
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MOBILE CHANGE OTP VERIFICATION MODAL */}
      <AnimatePresence>
        {showOtpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
            <div className="absolute inset-0" onClick={() => setShowOtpModal(false)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white dark:bg-neutral-900 rounded-feature border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-3 mb-4">
                <h3 className="text-sm font-bold text-neutral-950 dark:text-white uppercase tracking-wider">
                  Update Mobile Number
                </h3>
                <button 
                  onClick={() => setShowOtpModal(false)}
                  className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Step 1: Input Phone */}
              {otpStep === 'phone' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <p className="text-xs text-neutral-550 dark:text-neutral-400 leading-relaxed">
                    Please provide your new 10-digit mobile number. We will send an SMS OTP verification code.
                  </p>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">
                      New Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={newMobile}
                      onChange={(e) => setNewMobile(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 9876543210"
                      className="w-full text-xs font-semibold px-3.5 py-2.5 bg-neutral-50 border border-neutral-250 rounded-card focus:outline-none focus:border-primary-500 dark:bg-neutral-950 dark:border-neutral-800 focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 border-none text-xs font-bold text-white rounded-card cursor-pointer"
                  >
                    Send Verification OTP
                  </button>
                </form>
              ) : (
                /* Step 2: Input OTP Verification */
                <div className="space-y-5 text-center">
                  <div className="w-10 h-10 bg-primary-50 dark:bg-primary-950/20 border border-primary-100/30 rounded-full flex items-center justify-center text-primary-500 mx-auto">
                    <Smartphone className="w-5 h-5 animate-pulse" />
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Verify SMS Code</h4>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-450 leading-normal max-w-xs mx-auto">
                      Enter the 6-digit OTP code sent to <span className="font-bold text-neutral-900 dark:text-white">+{newMobile}</span>
                    </p>
                  </div>

                  <div className="py-2">
                    <OtpInput
                      length={6}
                      onComplete={handleOtpComplete}
                      hasError={otpError}
                    />
                  </div>

                  {/* Resend Countdown */}
                  <div className="text-[11px] font-bold text-neutral-500">
                    {countdown > 0 ? (
                      <span>Resend code in {countdown}s</span>
                    ) : (
                      <button
                        onClick={handleResendOtp}
                        className="text-primary-500 hover:underline border-none bg-transparent cursor-pointer font-bold"
                      >
                        Resend OTP Code
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => setOtpStep('phone')}
                    className="w-full py-2.5 border border-neutral-350 bg-transparent text-xs font-bold text-neutral-700 dark:text-neutral-300 rounded-card hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                  >
                    Change Number
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
