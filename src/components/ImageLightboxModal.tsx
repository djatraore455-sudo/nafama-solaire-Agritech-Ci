import React from 'react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  subtitle?: string;
  tag?: string;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  subtitle,
  tag
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative max-w-lg w-full bg-[#131b2e] rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh]">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 bg-[#131b2e]/90 border-b border-white/10 z-10">
          <div className="flex flex-col truncate pr-2">
            <span className="text-sm font-bold text-white truncate">{title}</span>
            {subtitle && (
              <span className="text-xs text-white/70 truncate">{subtitle}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {tag && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#a6f4b5] text-[#00210b] text-[10px] font-bold">
                {tag}
              </span>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="Fermer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Image Preview Container */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-black/50 min-h-[300px]">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-lg border border-white/5"
          />
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-[#131b2e] border-t border-white/10 flex items-center justify-between text-xs text-white/80">
          <span className="flex items-center gap-1.5 text-[11px] text-white/60">
            <span className="material-symbols-outlined text-[16px] text-[#a6f4b5]">verified</span>
            Photo certifiée NAFAMA SOLAIRE
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#004c22] text-white rounded-xl font-bold hover:bg-[#166534] transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
