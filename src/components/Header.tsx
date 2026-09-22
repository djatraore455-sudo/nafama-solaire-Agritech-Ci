import React from 'react';
import { ScreenId } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onOpenVoice: () => void;
  isVoiceActive?: boolean;
  userAvatar?: string;
}

const SCREEN_TITLES: Record<ScreenId, { title: string; subtitle: string }> = {
  solaire: { subtitle: 'NAFAMA SOLAIRE', title: 'Accueil Iot' },
  formules: { subtitle: 'NAFAMA SOLAIRE', title: 'Abonnements & Notifications Sms' },
  paiement: { subtitle: 'NAFAMA SOLAIRE', title: 'Paiement Mobile Money' },
  admin: { subtitle: 'NAFAMA SOLAIRE', title: 'Espace Admin' },
  auth: { subtitle: 'NAFAMA SOLAIRE', title: 'Connexion & Inscription' },
  marche: { subtitle: 'NAFAMA SOLAIRE', title: 'Marché Bord-Champ' }
};

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  onOpenVoice,
  isVoiceActive = false,
  userAvatar
}) => {
  if (currentScreen === 'auth') {
    return null; // Auth screen has its own native top banner with local language dropdown and CI network indicator
  }

  const { title, subtitle } = SCREEN_TITLES[currentScreen];
  const isPaiement = currentScreen === 'paiement';

  return (
    <header className="sticky top-0 w-full z-40 bg-[#faf8ff]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#eaedff]">
      <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-md mx-auto">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {isPaiement ? (
            <button
              onClick={() => onNavigate('solaire')}
              aria-label="Retour à l'accueil"
              className="w-10 h-10 -ml-1 rounded-full flex items-center justify-center text-[#131b2e] hover:bg-[#eaedff] active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
          ) : null}

          <div 
            onClick={() => onNavigate('solaire')} 
            className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1"
          >
            <img
              alt="NAFAMA Logo"
              className="h-8 w-8 object-contain rounded-lg flex-shrink-0 bg-white shadow-xs p-0.5"
              src="/logo.png"
              onError={(e) => {
                // Fallback to CDN URL if local image is unavailable
                (e.currentTarget as HTMLImageElement).src = "https://lh3.googleusercontent.com/aida-public/AB6AXuCoUEUh7HkLoQlSbu2EaNYT6yRpwdNyUsQq6E3qeJbRVjYbduBw53rB4y-I3x9Br47yu8QKoePoWzjuJtagArbvQ3tcVVr57nZQ8GH-Q6wMzCgHJve6JgsA0E9xJFjqo_-kA33xjOfEPfMMz4jS1LN07ySMDXoAGfa2_gx7Sk7lUyzmXKy592iWpj3PrOzaYtwWU8ohCKwhJzdn-RH_ddYs2kSUUpfYy-srr0KoTmpzQX73yRwb9TO4n9c0zbl2HDRDQ54";
              }}
            />
            <div className="flex flex-col truncate">
              <span className="text-[11px] font-bold text-[#855300] uppercase tracking-wider leading-none">
                {subtitle}
              </span>
              <h1 className="text-[16px] font-semibold text-[#131b2e] truncate leading-tight mt-0.5">
                {title}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* PWA Install Button */}
          <PWAInstallButton variant="header" />

          {/* Live Solar Status */}
          <div 
            title="Liaison Solaire et LoRa active"
            className="flex items-center gap-1.5 bg-[#e2e7ff] px-2.5 py-1 rounded-full text-[#004c22] text-xs font-semibold"
          >
            <span className="w-2 h-2 rounded-full bg-[#004c22] animate-pulse"></span>
            <span className="material-symbols-outlined text-[16px]">solar_power</span>
          </div>

          {/* Multilingual Voice Assistant Trigger */}
          <button
            onClick={onOpenVoice}
            aria-label="Assistance Vocale Multilingue"
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 ${
              isVoiceActive
                ? 'bg-[#004c22] text-white animate-pulse shadow-md'
                : 'bg-[#fea619]/20 text-[#855300] hover:bg-[#fea619]/30'
            }`}
            title="Assistance Vocale (Français, Dioula, Sénoufo, Baoulé)"
          >
            <span className="material-symbols-outlined text-[20px]">mic</span>
          </button>

          {/* User Account / Admin Avatar */}
          <button
            onClick={() => onNavigate('auth')}
            aria-label="Mon Profil Agricole"
            className="w-8 h-8 rounded-full bg-[#004c22] flex items-center justify-center text-white active:scale-95 transition-transform shadow-xs overflow-hidden"
            title="Mon Profil / Inscription"
          >
            {userAvatar ? (
              <img src={userAvatar} alt="Profil" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-[18px]">person</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
