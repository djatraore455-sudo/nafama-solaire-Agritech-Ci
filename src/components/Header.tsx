import React from 'react';
import { ScreenId, UserRole } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onOpenVoice: () => void;
  isVoiceActive?: boolean;
  userAvatar?: string;
  currentUserRole?: UserRole;
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
  userAvatar,
  currentUserRole = 'producer'
}) => {
  if (currentScreen === 'auth') {
    return null; // Auth screen has its own native top banner with local language dropdown and CI network indicator
  }

  const { title, subtitle } = SCREEN_TITLES[currentScreen];
  const isPaiement = currentScreen === 'paiement';

  const roleLabels: Record<UserRole, { label: string; bg: string; text: string }> = {
    producer: { label: 'Prod', bg: 'bg-[#a6f4b5]', text: 'text-[#00210b]' },
    technician: { label: 'Tech', bg: 'bg-[#dae2fd]', text: 'text-[#001d36]' },
    buyer: { label: 'Achat', bg: 'bg-[#ffddb8]', text: 'text-[#2a1700]' },
    admin: { label: 'Admin', bg: 'bg-[#ffdad6]', text: 'text-[#ba1a1a]' }
  };
  const roleBadge = roleLabels[currentUserRole] || roleLabels.producer;

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

          {/* User Account / Admin Avatar with Role Badge */}
          <button
            onClick={() => onNavigate('auth')}
            aria-label="Mon Profil Agricole"
            className="relative flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full bg-[#f2f3ff] border border-[#eaedff] active:scale-95 transition-transform"
            title={`Mon Profil (${currentUserRole})`}
          >
            <div className="w-7 h-7 rounded-full bg-[#004c22] flex items-center justify-center text-white overflow-hidden shrink-0">
              {userAvatar ? (
                <img src={userAvatar} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[16px]">person</span>
              )}
            </div>
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${roleBadge.bg} ${roleBadge.text}`}>
              {roleBadge.label}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
