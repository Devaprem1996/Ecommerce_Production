"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface PincodeResult {
  serviceable: boolean;
  city?: string;
  state?: string;
  estimatedDays?: number;
  freeDeliveryThreshold?: number;
  shippingCharge?: number;
}

export const PincodeChecker: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const [pincode, setPincode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'failed' | 'error'>('idle');
  const [result, setResult] = useState<PincodeResult | null>(null);

  // Load last checked pincode from storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('yathu_pincode') || sessionStorage.getItem('lastCheckedPincode');
      if (saved && /^\d{6}$/.test(saved)) {
        setPincode(saved);
        checkPincode(saved);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const checkPincode = async (code: string) => {
    if (!/^\d{6}$/.test(code)) return;
    setStatus('loading');

    try {
      // Query backend shipping endpoint
      const res = await fetch(`/api/v1/shipping/pincode/${code}`);
      if (res.ok) {
        const json = await res.json();
        const info = json.data || json;
        if (info && (info.serviceable === true || info.available === true)) {
          setResult({
            serviceable: true,
            city: info.city,
            state: info.state,
            estimatedDays: info.estimatedDays || 2,
            freeDeliveryThreshold: Number(info.freeDeliveryThreshold) || 499,
            shippingCharge: Number(info.shippingCharge) || 40,
          });
          setStatus('success');
          try {
            localStorage.setItem('yathu_pincode', code);
            sessionStorage.setItem('lastCheckedPincode', code);
          } catch {}
          return;
        } else {
          setStatus('failed');
          return;
        }
      }

      // Smart fallback for South Indian standard postal regions if API is unreachable
      const prefix2 = parseInt(code.substring(0, 2), 10);
      if (prefix2 >= 60 && prefix2 <= 64) {
        // Tamil Nadu / Puducherry
        setResult({
          serviceable: true,
          city: prefix2 === 60 ? 'Chennai / North TN' : prefix2 === 64 ? 'Coimbatore Region' : 'Tamil Nadu',
          state: 'Tamil Nadu',
          estimatedDays: 2,
          freeDeliveryThreshold: 499,
          shippingCharge: 40,
        });
        setStatus('success');
        try { localStorage.setItem('yathu_pincode', code); } catch {}
      } else if (prefix2 >= 56 && prefix2 <= 59) {
        // Karnataka
        setResult({
          serviceable: true,
          city: 'Karnataka Region',
          state: 'Karnataka',
          estimatedDays: 3,
          freeDeliveryThreshold: 499,
          shippingCharge: 50,
        });
        setStatus('success');
        try { localStorage.setItem('yathu_pincode', code); } catch {}
      } else if (prefix2 >= 50 && prefix2 <= 53) {
        // Telangana / AP
        setResult({
          serviceable: true,
          city: 'AP & Telangana',
          state: 'South India',
          estimatedDays: 3,
          freeDeliveryThreshold: 499,
          shippingCharge: 50,
        });
        setStatus('success');
        try { localStorage.setItem('yathu_pincode', code); } catch {}
      } else if (prefix2 >= 67 && prefix2 <= 69) {
        // Kerala
        setResult({
          serviceable: true,
          city: 'Kerala Region',
          state: 'Kerala',
          estimatedDays: 3,
          freeDeliveryThreshold: 499,
          shippingCharge: 50,
        });
        setStatus('success');
        try { localStorage.setItem('yathu_pincode', code); } catch {}
      } else {
        setStatus('failed');
      }
    } catch {
      setStatus('error');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); // Digits only
    if (val.length <= 6) {
      setPincode(val);
      if (val.length === 6) {
        checkPincode(val);
      } else {
        setStatus('idle');
        setResult(null);
      }
    }
  };

  return (
    <div className={`w-full rounded-2xl bg-[#F8F9FA] dark:bg-neutral-850/80 p-3 sm:p-3.5 border border-neutral-200/80 dark:border-neutral-750 font-sans ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-primary-500" />
          <span>{currentLang === 'ta' ? 'டெலிவரி விநியோக சரிபார்ப்பு' : 'Estimate Delivery Timeline'}</span>
        </span>
        <span className="text-[10px] font-semibold text-neutral-400">
          {currentLang === 'ta' ? 'அஞ்சல் குறியீடு' : '6-digit Pincode'}
        </span>
      </div>

      {/* Input Row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={pincode}
            onChange={handleInputChange}
            placeholder={currentLang === 'ta' ? 'எ.கா. 600001 (சென்னை)' : 'e.g. 600001 (Chennai)'}
            className="w-full h-9 px-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder:font-normal placeholder:text-neutral-400"
          />
          {status === 'loading' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 animate-spin">
              <Loader2 className="w-4 h-4" />
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={pincode.length !== 6 || status === 'loading'}
          onClick={() => checkPincode(pincode)}
          className="h-9 px-4 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold text-xs transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
        >
          {currentLang === 'ta' ? 'சரிபார்' : 'Check'}
        </button>
      </div>

      {/* Feedback Status Alert */}
      {status === 'success' && result && (
        <div className="mt-2.5 p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-teal-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-left transition-all">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 flex flex-col text-[11px] leading-snug text-neutral-800 dark:text-neutral-200 font-medium">
            <div className="flex items-center justify-between gap-1 flex-wrap">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">
                {currentLang === 'ta'
                  ? `✓ விநியோகம் உண்டு: ${result.city || 'உங்கள் பகுதி'}`
                  : `✓ Express Delivery to ${result.city || result.state || 'your area'}`}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shrink-0">
                {currentLang === 'ta' ? `${result.estimatedDays || 2} நாட்களில்` : `In ${result.estimatedDays || 2} Days`}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-500 dark:text-neutral-400 font-medium flex-wrap">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ {currentLang === 'ta' ? 'பணம் செலுத்திப் பெறலாம் (COD)' : 'Cash on Delivery Available'}
              </span>
              <span>•</span>
              <span>
                {currentLang === 'ta' ? '₹499க்கு மேல் இலவச டெலிவரி' : 'Free delivery over ₹499'}
              </span>
            </div>
          </div>
        </div>
      )}

      {status === 'failed' && (
        <div className="mt-2.5 p-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-800/40 flex items-start gap-2 text-left">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="text-[11px] text-red-800 dark:text-red-200 font-medium leading-tight">
            <span>
              {currentLang === 'ta'
                ? 'மன்னிக்கவும், இந்த அஞ்சல் குறியீட்டிற்கு தற்போது விநியோகம் இல்லை.'
                : 'Delivery is currently not available for this pincode.'}
            </span>
            <span className="block text-[10px] text-red-600 dark:text-red-300 mt-0.5">
              {currentLang === 'ta'
                ? 'சென்னை, கோவை, மதுரை, திருச்சி, பெங்களூரு போன்ற நகரங்களுக்கு டெலிவரி உண்டு.'
                : 'We currently deliver across Tamil Nadu, Bangalore, and major South Indian cities.'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
