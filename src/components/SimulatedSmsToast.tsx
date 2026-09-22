import React from 'react';

export interface SmsToastData {
  id: string;
  sender: string;
  phone: string;
  message: string;
  time: string;
}

interface SimulatedSmsToastProps {
  toast: SmsToastData | null;
  onDismiss: () => void;
}

export const SimulatedSmsToast: React.FC<SimulatedSmsToastProps> = ({ toast, onDismiss }) => {
  if (!toast) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto animate-bounce-short">
      <div className="bg-[#131b2e] text-white p-3.5 rounded-2xl shadow-2xl border border-white/10 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#fea619] text-[#2a1700] flex items-center justify-center shrink-0 font-bold">
          <span className="material-symbols-outlined text-[22px]">sms</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#a6f4b5] tracking-wide uppercase">
              SMS • {toast.sender}
            </span>
            <span className="text-[10px] text-white/60">{toast.time}</span>
          </div>
          <p className="text-sm font-medium text-white/95 mt-0.5 leading-snug">
            {toast.message}
          </p>
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/10">
            <span className="text-[10px] text-[#ffddb8]">Transmis via Passerelle GSM 98024</span>
            <button
              onClick={onDismiss}
              className="text-xs font-semibold text-[#a6f4b5] hover:underline"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
