import React from 'react';
import { ScreenId } from '../types';

interface BottomNavProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  cartCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  cartCount
}) => {
  const navItems: { id: ScreenId; label: string; icon: string; badge?: number }[] = [
    { id: 'auth', label: 'Compte', icon: 'account_circle' },
    { id: 'solaire', label: 'Solaire', icon: 'solar_power' },
    { id: 'formules', label: 'Formules', icon: 'sms' },
    { id: 'marche', label: 'Marché', icon: 'storefront' },
    { id: 'paiement', label: 'Panier', icon: 'shopping_bag', badge: cartCount },
    { id: 'admin', label: 'Admin', icon: 'manage_accounts' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#eaedff] shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-1">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[50px] h-13 transition-all relative ${
                isActive
                  ? 'text-[#004c22] font-bold scale-105'
                  : 'text-[#404940] hover:text-[#004c22]'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <span 
                  className="material-symbols-outlined text-[22px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#855300] text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] truncate tracking-tight">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#004c22] -mt-0.5"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
