import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'card';
  onInstalled?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  onInstalled
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running in standalone mode (installed), don't show
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
        if (onInstalled) onInstalled();
      }
    } else {
      setShowGuide(true);
    }
  };

  if (variant === 'header') {
    return (
      <>
        <button
          type="button"
          onClick={handleInstallClick}
          aria-label="Installer l'application NAFAMA sur l'écran d'accueil"
          title="Installer l'application NAFAMA"
          className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#004c22] text-white text-xs font-bold shadow-xs hover:bg-[#166534] active:scale-95 transition-all cursor-pointer border border-[#a6f4b5]/30"
        >
          <img
            src="/pwa-192x192.png"
            alt="Icône NAFAMA"
            className="w-4 h-4 rounded-md object-contain bg-white p-0.5"
          />
          <span className="hidden sm:inline">Installer l'App</span>
          <span className="sm:hidden">Installer</span>
          <span className="material-symbols-outlined text-[15px]">download</span>
        </button>

        {showGuide && (
          <PWAInstallModal onClose={() => setShowGuide(false)} isIOS={isIOS} />
        )}
      </>
    );
  }

  // Variant: Card or Banner
  return (
    <>
      <div className="w-full bg-linear-to-r from-[#004c22] to-[#00210b] text-white rounded-2xl p-4 shadow-md border border-[#a6f4b5]/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-white p-1 shrink-0 shadow-sm overflow-hidden flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Logo officiel NAFAMA SOLAIRE"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black tracking-wide uppercase text-[#a6f4b5] flex items-center gap-1">
              <span>Application NAFAMA</span>
              <span className="bg-[#fea619] text-[#2a1700] text-[9px] px-1 py-0.2 rounded font-bold">
                PWA
              </span>
            </h4>
            <p className="text-xs text-white/90 font-semibold truncate">
              Installer sur l'écran d'accueil
            </p>
            <p className="text-[10px] text-white/70">
              Accès rapide avec l'icône officielle NAFAMA
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleInstallClick}
          className="shrink-0 px-3.5 py-2 rounded-xl bg-[#a6f4b5] text-[#00210b] text-xs font-black hover:bg-[#86efac] active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[17px]">install_mobile</span>
          <span>Installer</span>
        </button>
      </div>

      {showGuide && (
        <PWAInstallModal onClose={() => setShowGuide(false)} isIOS={isIOS} />
      )}
    </>
  );
};

interface PWAInstallModalProps {
  onClose: () => void;
  isIOS: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ onClose, isIOS }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#eaedff] flex flex-col gap-4">
        {/* App Icon preview in modal */}
        <div className="text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-white p-1.5 shadow-lg border border-[#eaedff] mb-2 flex items-center justify-center ring-4 ring-[#a6f4b5]/40">
            <img
              src="/pwa-512x512.png"
              alt="Icône NAFAMA"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <span className="text-[10px] font-bold text-[#004c22] uppercase tracking-wider bg-[#a6f4b5]/30 px-2 py-0.5 rounded-full">
            Icône officielle d'installation
          </span>
          <h3 className="text-base font-extrabold text-[#131b2e] mt-1">
            Installer NAFAMA SOLAIRE
          </h3>
          <p className="text-xs text-[#404940] max-w-xs mt-0.5">
            Retrouvez le logo NAFAMA directement sur votre écran d'accueil Android ou iPhone.
          </p>
        </div>

        {/* Step by step instructions based on browser */}
        <div className="bg-[#f2f3ff] rounded-2xl p-3.5 border border-[#dae2fd] text-xs space-y-2.5">
          {isIOS ? (
            <>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#004c22] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-[#131b2e] leading-snug">
                  Touchez le bouton <strong>Partager</strong>{' '}
                  <span className="inline-block align-middle font-bold text-[#0284c7]">⎋</span>{' '}
                  au bas de Safari.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#004c22] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-[#131b2e] leading-snug">
                  Faites défiler et sélectionnez{' '}
                  <strong>« Sur l'écran d'accueil »</strong> (avec l'icône NAFAMA).
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#004c22] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  3
                </span>
                <p className="text-[#131b2e] leading-snug">
                  Validez en haut à droite avec <strong>« Ajouter »</strong>.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#004c22] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-[#131b2e] leading-snug">
                  Cliquez sur le menu du navigateur (les <strong>trois points ⋮</strong> en haut à droite).
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#004c22] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-[#131b2e] leading-snug">
                  Appuyez sur <strong>« Installer l'application »</strong> ou <strong>« Ajouter à l'écran d'accueil »</strong>.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#004c22] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  3
                </span>
                <p className="text-[#131b2e] leading-snug">
                  L'application s'ouvrira en plein écran avec l'icône NAFAMA comme une application native.
                </p>
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#004c22] text-white text-xs font-bold hover:bg-[#166534] active:scale-95 transition-all shadow-sm"
        >
          J'ai compris
        </button>
      </div>
    </div>
  );
};
