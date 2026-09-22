import { useState } from 'react';
import { ScreenId, LanguageCode, CartItem, UserAccount } from './types';
import { INITIAL_TELEMETRY, INITIAL_CART_ITEMS } from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ScreenSolaire } from './components/ScreenSolaire';
import { ScreenPaiement } from './components/ScreenPaiement';
import { ScreenFormules } from './components/ScreenFormules';
import { ScreenAdmin } from './components/ScreenAdmin';
import { ScreenAuth } from './components/ScreenAuth';
import { ScreenMarche } from './components/ScreenMarche';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { SimulatedSmsToast, SmsToastData } from './components/SimulatedSmsToast';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  // Navigation Flow: Inscription vient avant Solaire IoT
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('auth');
  const [currentLang, setCurrentLang] = useState<LanguageCode>('fr');
  const [viewMode, setViewMode] = useState<'mobile' | 'full'>('mobile');

  // App Data States
  const [telemetry, setTelemetry] = useState(INITIAL_TELEMETRY);
  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART_ITEMS);
  const [currentUser, setCurrentUser] = useState<UserAccount>({
    nom: 'Kouassi',
    prenom: 'Konan',
    phone: '07 58 42 19 80',
    location: 'Korhogo',
    pin: '2025',
    isLoggedIn: true
  });

  // Interactive Voice & SMS Toast
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<SmsToastData | null>(null);

  const showSmsToast = (message: string, sender: string = 'NAFAMA SOLAIRE') => {
    setActiveToast({
      id: `toast-${Date.now()}`,
      sender,
      phone: currentUser.phone,
      message,
      time: 'À l’instant'
    });
  };

  const handleTogglePump = () => {
    setTelemetry((prev) => {
      const nextActive = !prev.pumpActive;
      return {
        ...prev,
        pumpActive: nextActive,
        pumpFlowM3h: nextActive ? 14.2 : 0.0,
        solarProductionKw: nextActive ? 4.8 : 1.2,
        pumpPressureBar: nextActive ? 3.4 : 0.0,
        soilHumidityPercent: nextActive ? Math.min(100, prev.soilHumidityPercent + 2) : prev.soilHumidityPercent
      };
    });
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCartItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) => (p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleVoiceCommand = (cmd: string) => {
    if (cmd === 'toggle_pump') {
      handleTogglePump();
      showSmsToast("Commande vocale exécutée : Pompe solaire inversée.");
    } else if (cmd === 'check_sensors') {
      setCurrentScreen('solaire');
      showSmsToast("Affichage des capteurs LoRa et de la cuve.");
    } else if (cmd === 'call_tech') {
      showSmsToast("Connexion avec l'assistance technique en cours (1301).");
    }
  };

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex flex-col items-center">
      {/* Top Demo Bar / Quick Navigation Switcher */}
      <div className="w-full bg-[#131b2e] text-white py-2 px-3 text-xs border-b border-white/10 z-50 shadow-md">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Brand & Language status */}
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#a6f4b5] tracking-wider uppercase text-[11px]">
              NAFAMA SOLAIRE
            </span>
            <span className="hidden sm:inline text-white/50">•</span>
            <span className="hidden sm:inline text-white/80">Supervision IoT & Mobile Money CI</span>
          </div>

          {/* Quick Screen Jumper */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
            {[
              { id: 'auth', label: '1. Inscription' },
              { id: 'solaire', label: '2. Solaire IoT' },
              { id: 'formules', label: '3. Formules SMS' },
              { id: 'marche', label: '4. Marché Récoltes' },
              { id: 'paiement', label: '5. Panier MoMo' },
              { id: 'admin', label: '6. Espace Admin' }
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setCurrentScreen(s.id as ScreenId)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                  currentScreen === s.id
                    ? 'bg-[#004c22] text-[#a6f4b5] ring-1 ring-[#a6f4b5]'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Phone Frame Toggle */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={() => setViewMode(viewMode === 'mobile' ? 'full' : 'mobile')}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-semibold flex items-center gap-1 transition-colors"
              title="Basculer la vue émulateur mobile"
            >
              <span className="material-symbols-outlined text-[14px]">
                {viewMode === 'mobile' ? 'smartphone' : 'laptop'}
              </span>
              <span className="hidden md:inline">
                {viewMode === 'mobile' ? 'Format Mobile' : 'Plein Écran'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container - Mobile Shell or Responsive Dashboard */}
      <div
        className={`w-full transition-all duration-300 ${
          viewMode === 'mobile'
            ? 'max-w-md my-0 sm:my-6 rounded-none sm:rounded-[38px] shadow-2xl border-0 sm:border-[8px] sm:border-[#283044] bg-[#faf8ff] overflow-hidden min-h-screen sm:min-h-[850px] relative'
            : 'max-w-2xl w-full min-h-screen bg-[#faf8ff] relative'
        }`}
      >
        {/* Phone Speaker Notch in Mobile View */}
        {viewMode === 'mobile' && (
          <div className="hidden sm:flex justify-center pt-2 pb-1 bg-[#faf8ff]">
            <div className="w-20 h-4 bg-[#283044] rounded-full flex items-center justify-center">
              <div className="w-8 h-1 bg-white/30 rounded-full"></div>
            </div>
          </div>
        )}

        {/* Global Simulated SMS Notification Toast */}
        <SimulatedSmsToast
          toast={activeToast}
          onDismiss={() => setActiveToast(null)}
        />

        {/* Common Header */}
        <Header
          currentScreen={currentScreen}
          onNavigate={(screen) => setCurrentScreen(screen)}
          onOpenVoice={() => setIsVoiceModalOpen(true)}
          userAvatar={currentUser.avatar}
        />

        {/* Screen Content */}
        <main className="w-full flex-1">
          {currentScreen === 'solaire' && (
            <ScreenSolaire
              telemetry={telemetry}
              onTogglePump={handleTogglePump}
              onNavigate={(s) => setCurrentScreen(s)}
              onOpenVoice={() => setIsVoiceModalOpen(true)}
              onTriggerSmsNotification={(msg) => showSmsToast(msg)}
              currentLang={currentLang}
              onLanguageChange={(l) => setCurrentLang(l)}
            />
          )}

          {currentScreen === 'auth' && (
            <ScreenAuth
              onSuccess={(user) => setCurrentUser(user)}
              onNavigate={(s) => setCurrentScreen(s)}
              onTriggerSmsNotification={(msg) => showSmsToast(msg)}
              currentLang={currentLang}
              onLanguageChange={(l) => setCurrentLang(l)}
            />
          )}

          {currentScreen === 'paiement' && (
            <ScreenPaiement
              cartItems={cartItems}
              onUpdateQuantity={handleUpdateCartQuantity}
              onRemoveItem={handleRemoveFromCart}
              onNavigate={(s) => setCurrentScreen(s)}
              onTriggerSmsNotification={(msg) => showSmsToast(msg)}
              currentUser={currentUser}
            />
          )}

          {currentScreen === 'formules' && (
            <ScreenFormules
              onNavigate={(s) => setCurrentScreen(s)}
              onTriggerSmsNotification={(msg) => showSmsToast(msg)}
            />
          )}

          {currentScreen === 'admin' && (
            <ScreenAdmin
              onNavigate={(s) => setCurrentScreen(s)}
              onTriggerSmsNotification={(msg) => showSmsToast(msg)}
            />
          )}

          {currentScreen === 'marche' && (
            <ScreenMarche
              onAddToCart={handleAddToCart}
              onNavigate={(s) => setCurrentScreen(s)}
              onTriggerSmsNotification={(msg) => showSmsToast(msg)}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          currentScreen={currentScreen}
          onNavigate={(screen) => setCurrentScreen(screen)}
          cartCount={totalCartCount}
        />
      </div>

      {/* Offline Status Banner */}
      <OfflineIndicator />

      {/* Interactive Multilingual Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onExecuteCommand={handleVoiceCommand}
        currentLang={currentLang}
        onLanguageChange={(l) => setCurrentLang(l)}
      />
    </div>
  );
}
