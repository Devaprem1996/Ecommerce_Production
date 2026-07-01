import React from 'react';

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-between p-4 font-sans text-neutral-200 w-full">
      {/* Top logo */}
      <div className="pt-8 flex justify-center">
        <span className="text-2xl font-bold font-heading tracking-wide text-primary-400">
          Aether<span className="text-secondary-400">.</span>
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
          &copy; {new Date().getFullYear()} Aether Organic &mdash; Admin Portal
        </div>
      </div>
    </div>
  );
}
