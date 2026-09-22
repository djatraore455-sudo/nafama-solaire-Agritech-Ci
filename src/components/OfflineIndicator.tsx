import React, { useEffect, useState } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-50 flex items-center justify-between gap-2 rounded-2xl bg-[#855300] px-4 py-2.5 text-xs font-semibold text-white shadow-xl border border-[#fea619]/40 animate-bounce">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#fea619] animate-pulse" />
        <span>Mode Hors-Ligne — Données et réglages conservés</span>
      </div>
      <span className="material-symbols-outlined text-[18px]">cloud_off</span>
    </div>
  );
};
