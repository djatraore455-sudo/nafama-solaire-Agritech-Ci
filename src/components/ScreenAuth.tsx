import React, { useState } from 'react';
import { LanguageCode, ScreenId, UserAccount } from '../types';
import { VOICE_PROMPTS } from '../data/mockData';
import { PWAInstallButton } from './PWAInstallButton';

interface ScreenAuthProps {
  onSuccess: (user: UserAccount) => void;
  onNavigate: (screen: ScreenId) => void;
  onTriggerSmsNotification: (message: string) => void;
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}

export const ScreenAuth: React.FC<ScreenAuthProps> = ({
  onSuccess,
  onNavigate,
  onTriggerSmsNotification,
  currentLang,
  onLanguageChange
}) => {
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Form states
  const [nom, setNom] = useState('Koné');
  const [prenom, setPrenom] = useState('Ibrahim');
  const [phone, setPhone] = useState('07 58 42 19 80');
  const [residence, setResidence] = useState('Korhogo');
  const [pin, setPin] = useState('2025');
  const [confirmPin, setConfirmPin] = useState('2025');
  const [rememberMe, setRememberMe] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const langInfo = VOICE_PROMPTS[currentLang];

  const playVocalGuide = (customText?: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = customText || (
        authMode === 'register'
          ? "Bienvenue sur Nafama Solaire. Saisissez votre nom, votre numéro de téléphone ivoirien et définissez votre code secret à 4 chiffres."
          : "Connexion à Nafama Solaire. Entrez votre numéro et votre code PIN à 4 chiffres."
      );
      const msg = new SpeechSynthesisUtterance(textToSpeak);
      msg.lang = 'fr-FR';
      msg.rate = 0.9;
      setIsPlayingAudio(true);

      msg.onend = () => setIsPlayingAudio(false);
      msg.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(msg);
    }
  };

  const handleSelectLang = (lang: LanguageCode) => {
    onLanguageChange(lang);
    setIsLangDropdownOpen(false);
    playVocalGuide(`Guide vocal actif en ${VOICE_PROMPTS[lang].label}.`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'register') {
      if (pin !== confirmPin) {
        setFeedbackMsg("Attention : Les deux codes PIN ne correspondent pas.");
        return;
      }
      if (pin.length < 4) {
        setFeedbackMsg("Le code PIN doit comporter 4 chiffres.");
        return;
      }
    }

    const account: UserAccount = {
      nom: authMode === 'register' ? nom : 'Kouassi',
      prenom: authMode === 'register' ? prenom : 'Konan',
      phone,
      location: residence,
      pin,
      isLoggedIn: true,
      avatar: avatarPreview || undefined
    };

    onSuccess(account);
    onTriggerSmsNotification(
      authMode === 'register'
        ? `Bienvenue chez NAFAMA SOLAIRE, ${account.prenom} ${account.nom} ! Compte activé pour l'exploitation de ${account.location}.`
        : `Connexion réussie. Espace gestion de pompe solaire actif.`
    );
    onNavigate('solaire');
  };

  const handleQuickOtp = () => {
    onTriggerSmsNotification(`Code de sécurité SMS NAFAMA : 4829. Valable 5 minutes.`);
    setFeedbackMsg("Code OTP envoyé par SMS au +225 " + phone);
  };

  return (
    <div className="flex flex-col w-full pb-24 pt-4 px-4 max-w-md mx-auto">
      {/* Top Banner & Voice Language Trigger */}
      <div className="w-full flex items-center justify-between mb-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e2e7ff] shadow-xs">
          <span className="inline-block w-2 h-2 rounded-full bg-[#004c22] animate-pulse"></span>
          <span className="text-[11px] font-bold text-[#404940] uppercase tracking-wider">
            Réseau CI 4G / LoRa
          </span>
        </div>

        {/* Voice Selector Menu Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ffddb8] text-[#2a1700] shadow-xs active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[18px]">volume_up</span>
            <span className="text-xs font-bold">{langInfo.label}</span>
            <span className="material-symbols-outlined text-[16px]">expand_more</span>
          </button>

          {isLangDropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white shadow-xl border border-[#eaedff] z-50 p-1.5 flex flex-col gap-1">
              {(['fr', 'dioula', 'senoufo', 'baoule'] as LanguageCode[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => handleSelectLang(l)}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-left text-xs font-semibold ${
                    currentLang === l
                      ? 'bg-[#eaedff] text-[#004c22]'
                      : 'hover:bg-[#f2f3ff] text-[#131b2e]'
                  }`}
                >
                  <span>{VOICE_PROMPTS[l].label}</span>
                  {currentLang === l && (
                    <span className="material-symbols-outlined text-[16px] text-[#004c22]">check</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Official Nafama Solaire Logo Visual */}
      <div className="relative w-32 h-32 mx-auto flex items-center justify-center my-2">
        <div className="absolute inset-0 rounded-3xl bg-[#004c22]/10 blur-xl"></div>
        <img
          alt="NAFAMA SOLAIRE"
          className="relative z-10 w-full h-full object-contain rounded-2xl drop-shadow-md bg-white p-1"
          src="/logo.png"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "https://lh3.googleusercontent.com/aida-public/AB6AXuCoUEUh7HkLoQlSbu2EaNYT6yRpwdNyUsQq6E3qeJbRVjYbduBw53rB4y-I3x9Br47yu8QKoePoWzjuJtagArbvQ3tcVVr57nZQ8GH-Q6wMzCgHJve6JgsA0E9xJFjqo_-kA33xjOfEPfMMz4jS1LN07ySMDXoAGfa2_gx7Sk7lUyzmXKy592iWpj3PrOzaYtwWU8ohCKwhJzdn-RH_ddYs2kSUUpfYy-srr0KoTmpzQX73yRwb9TO4n9c0zbl2HDRDQ54";
          }}
        />
      </div>

      {/* Brand Motto */}
      <div className="text-center px-4 max-w-xs mx-auto mb-3">
        <p className="text-xs font-bold text-[#004c22] tracking-wider uppercase">NAFAMA SOLAIRE</p>
        <p className="text-sm text-[#404940] font-medium mt-0.5">
          L'énergie solaire au service de la terre
        </p>
      </div>

      {/* Vocal Banner for Illiterate/Field Guidance */}
      <div className="w-full mb-3 p-3 rounded-2xl bg-[#e2e7ff] flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-[#166534] text-white flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              record_voice_over
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#131b2e] truncate">
              Guide vocal actif en {langInfo.label}
            </p>
            <p className="text-[11px] text-[#404940] truncate">
              Touchez pour réécouter les explications
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (isPlayingAudio) {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              setIsPlayingAudio(false);
            } else {
              playVocalGuide();
            }
          }}
          aria-label="Écouter le guide"
          className="w-9 h-9 rounded-full bg-white text-[#004c22] flex items-center justify-center shadow-xs active:scale-90 transition-transform shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">
            {isPlayingAudio ? 'pause' : 'play_arrow'}
          </span>
        </button>
      </div>

      {/* Primary Tab Switcher: Connexion / S'inscrire */}
      <div className="w-full bg-[#eaedff] p-1 rounded-2xl flex items-center shadow-inner mb-4">
        <button
          type="button"
          onClick={() => {
            setAuthMode('login');
            setFeedbackMsg(null);
          }}
          className={`flex-1 py-2.5 rounded-xl text-center text-sm font-bold transition-all ${
            authMode === 'login'
              ? 'bg-white text-[#004c22] shadow-sm'
              : 'text-[#404940] hover:text-[#004c22]'
          }`}
        >
          Se connecter
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMode('register');
            setFeedbackMsg(null);
          }}
          className={`flex-1 py-2.5 rounded-xl text-center text-sm font-bold transition-all ${
            authMode === 'register'
              ? 'bg-white text-[#004c22] shadow-sm'
              : 'text-[#404940] hover:text-[#004c22]'
          }`}
        >
          S'inscrire
        </button>
      </div>

      {/* Main Registration Form Container */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#eaedff] flex flex-col gap-4">
        {/* Form Mode Header Context */}
        <div className="flex items-center justify-between pb-1 border-b border-[#eaedff]">
          <div>
            <h2 className="text-base font-bold text-[#131b2e]">
              {authMode === 'register' ? 'Créer votre compte agricole' : 'Connexion à votre espace'}
            </h2>
            <p className="text-xs text-[#404940]">
              {authMode === 'register'
                ? 'Accédez à votre pompe solaire et vos capteurs'
                : 'Accédez à votre pompe et au suivi de vos cultures'}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#a6f4b5] flex items-center justify-center text-[#00210b]">
            <span className="material-symbols-outlined text-[18px]">solar_power</span>
          </div>
        </div>

        {feedbackMsg && (
          <div className="p-2.5 bg-[#f2f3ff] text-[#004c22] text-xs font-semibold rounded-xl border border-[#dae2fd]">
            {feedbackMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Avatar / Photo Exploitation Selection from device */}
          {authMode === 'register' && (
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#f2f3ff] border border-[#eaedff]">
              <div className="relative w-14 h-14 rounded-full overflow-hidden bg-white border-2 border-[#004c22] shrink-0 flex items-center justify-center shadow-xs">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-[28px] text-[#004c22]">account_circle</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-xs font-bold text-[#131b2e] block">
                  Photo de profil ou de votre ferme
                </label>
                <p className="text-[10px] text-[#404940] truncate">
                  Importez une image depuis votre appareil
                </p>
                <label className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-[#004c22] cursor-pointer hover:underline">
                  <span className="material-symbols-outlined text-[14px]">add_a_photo</span>
                  <span>{avatarPreview ? 'Changer la photo' : 'Sélectionner une photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Field: Nom & Prénom */}
          {authMode === 'register' && (
            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#404940]">
                  Nom <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative flex items-center bg-[#f2f3ff] rounded-xl px-3 py-2.5">
                  <span className="material-symbols-outlined text-[#707a6f] text-[18px] mr-1.5">person</span>
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Ex: Koné"
                    className="w-full bg-transparent text-sm text-[#131b2e] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#404940]">
                  Prénom <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative flex items-center bg-[#f2f3ff] rounded-xl px-3 py-2.5">
                  <input
                    type="text"
                    required
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    placeholder="Ex: Ibrahim"
                    className="w-full bg-transparent text-sm text-[#131b2e] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Field: Téléphone / Mobile Money (Côte d'Ivoire +225) */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#404940]">
                Numéro de téléphone (Contact) <span className="text-[#ba1a1a]">*</span>
              </label>
              <span className="text-[11px] font-bold text-[#004c22] flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[13px]">verified</span> Wave / MoMo
              </span>
            </div>

            <div className="flex items-center bg-[#f2f3ff] rounded-xl overflow-hidden">
              <div className="flex items-center gap-1.5 bg-[#e2e7ff] px-3 py-2.5 shrink-0">
                <span className="text-sm">🇨🇮</span>
                <span className="text-xs font-bold text-[#131b2e]">+225</span>
              </div>
              <input
                type="tel"
                required
                maxLength={14}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07 00 00 00 00"
                className="w-full bg-transparent px-3 py-2.5 text-sm font-semibold text-[#131b2e] tracking-wider focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-[#404940]">
              Compatible Orange, MTN, Moov et Wave Côte d'Ivoire
            </p>
          </div>

          {/* Field: Lieu de résidence (Localités ivoiriennes) */}
          {authMode === 'register' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#404940]">
                Lieu de résidence / Exploitation <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative flex items-center bg-[#f2f3ff] rounded-xl px-3 py-2.5">
                <span className="material-symbols-outlined text-[#707a6f] text-[18px] mr-2">location_on</span>
                <select
                  required
                  value={residence}
                  onChange={(e) => setResidence(e.target.value)}
                  className="w-full bg-transparent text-xs font-medium text-[#131b2e] focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="Korhogo">Korhogo (Poro)</option>
                  <option value="Bouaké">Bouaké (Gbêkê)</option>
                  <option value="Yamoussoukro">Yamoussoukro (Bélier)</option>
                  <option value="Abidjan">Abidjan (District Autonome)</option>
                  <option value="Daloa">Daloa (Haut-Sassandra)</option>
                  <option value="San-Pédro">San-Pédro (Bas-Sassandra)</option>
                  <option value="Man">Man (Tonkpi)</option>
                  <option value="Gagnoa">Gagnoa (Gôh)</option>
                  <option value="Autre">Autre coopérative / village</option>
                </select>
                <span className="material-symbols-outlined text-[#707a6f] text-[20px] pointer-events-none">
                  arrow_drop_down
                </span>
              </div>
            </div>
          )}

          {/* Field: Code PIN (4 chiffres) */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#404940]">
                Code PIN (4 chiffres) <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative flex items-center bg-[#f2f3ff] rounded-xl px-3 py-2.5">
                <span className="material-symbols-outlined text-[#707a6f] text-[18px] mr-1.5">lock</span>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-transparent text-center tracking-[0.3em] text-sm font-bold text-[#131b2e] focus:outline-none"
                />
              </div>
            </div>

            {authMode === 'register' ? (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#404940]">
                  Confirmer PIN <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative flex items-center bg-[#f2f3ff] rounded-xl px-3 py-2.5">
                  <span className="material-symbols-outlined text-[#707a6f] text-[18px] mr-1.5">lock_clock</span>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    required
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="••••"
                    className="w-full bg-transparent text-center tracking-[0.3em] text-sm font-bold text-[#131b2e] focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-end">
                <button
                  type="button"
                  onClick={() => alert("Un SMS contenant votre lien de réinitialisation PIN sera envoyé au " + phone)}
                  className="text-[11px] text-[#004c22] font-semibold hover:underline py-2.5 text-right"
                >
                  Code PIN oublié ?
                </button>
              </div>
            )}
          </div>

          {authMode === 'login' && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded accent-[#004c22] w-4 h-4 cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-[#404940] cursor-pointer">
                Se souvenir de moi sur cet appareil
              </label>
            </div>
          )}

          {/* Main Submission Button */}
          <button
            type="submit"
            className="w-full h-13 rounded-2xl bg-[#004c22] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all mt-2 hover:bg-[#166534]"
          >
            <span className="material-symbols-outlined text-[22px]">agriculture</span>
            <span>
              {authMode === 'register' ? 'Créer mon compte & Ouvrir Solaire IoT' : 'Se connecter & Ouvrir Solaire IoT'}
            </span>
          </button>

          {/* Quick Skip to Solaire IoT */}
          <button
            type="button"
            onClick={() => {
              onSuccess({
                nom: 'Koné',
                prenom: 'Ibrahim',
                phone: '07 58 42 19 80',
                location: 'Korhogo',
                pin: '2025',
                isLoggedIn: true,
                avatar: avatarPreview || undefined
              });
              onNavigate('solaire');
            }}
            className="w-full h-11 rounded-2xl bg-[#eaedff] text-[#004c22] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#dae2fd] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">solar_power</span>
            <span>Explorer directement le Solaire IoT (Mode Démo)</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </form>

        {/* Protection Note */}
        <div className="flex items-start gap-2 pt-1 text-center justify-center">
          <span className="material-symbols-outlined text-[#004c22] text-[16px] shrink-0 mt-0.5">
            verified_user
          </span>
          <p className="text-[11px] text-[#404940] leading-tight">
            Données protégées et sauvegardées pour les coopératives agricoles ivoiriennes.
          </p>
        </div>
      </div>

      {/* Social & Alternative Authentication Divider */}
      <div className="my-4 flex items-center gap-3">
        <div className="flex-1 h-px bg-[#eaedff]"></div>
        <span className="text-[11px] font-bold text-[#404940] uppercase tracking-wider">
          Ou continuer avec
        </span>
        <div className="flex-1 h-px bg-[#eaedff]"></div>
      </div>

      {/* Fast Social & Multi-Channel Authentication Buttons */}
      <div className="flex flex-col gap-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          {/* Google Auth Button */}
          <button
            type="button"
            onClick={() => {
              onSuccess({ nom: 'Traoré', prenom: 'Amadou', phone, location: 'Yamoussoukro', pin: '0000', isLoggedIn: true });
              onNavigate('solaire');
            }}
            className="h-12 px-3 rounded-2xl bg-white text-[#131b2e] shadow-xs border border-[#eaedff] flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
            </svg>
            <span className="text-xs font-bold">Google</span>
          </button>

          {/* Facebook Auth Button */}
          <button
            type="button"
            onClick={() => {
              onSuccess({ nom: 'Ouattara', prenom: 'Fatou', phone, location: 'Bouaké', pin: '0000', isLoggedIn: true });
              onNavigate('solaire');
            }}
            className="h-12 px-3 rounded-2xl bg-white text-[#131b2e] shadow-xs border border-[#eaedff] flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5 shrink-0" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
            </svg>
            <span className="text-xs font-bold">Facebook</span>
          </button>
        </div>

        {/* Direct SMS OTP Login */}
        <button
          type="button"
          onClick={handleQuickOtp}
          className="w-full h-12 px-4 rounded-2xl bg-[#eaedff] text-[#131b2e] shadow-xs flex items-center justify-between active:scale-[0.98] transition-transform hover:bg-[#dae2fd]"
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#004c22] text-[20px]">sms</span>
            <span className="text-xs font-semibold">Connexion rapide par SMS (OTP)</span>
          </div>
          <span className="material-symbols-outlined text-[#707a6f] text-[18px]">chevron_right</span>
        </button>

        {/* Email Option */}
        <button
          type="button"
          onClick={() => {
            const email = prompt("Entrez votre e-mail de coopérative :");
            if (email) {
              onTriggerSmsNotification(`Lien de connexion envoyé à ${email}`);
            }
          }}
          className="w-full h-12 px-4 rounded-2xl bg-[#eaedff] text-[#131b2e] shadow-xs flex items-center justify-between active:scale-[0.98] transition-transform hover:bg-[#dae2fd]"
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#005e87] text-[20px]">alternate_email</span>
            <span className="text-xs font-semibold">Connexion par adresse e-mail</span>
          </div>
          <span className="material-symbols-outlined text-[#707a6f] text-[18px]">chevron_right</span>
        </button>
      </div>

      {/* PWA Install Banner */}
      <div className="mt-4">
        <PWAInstallButton variant="banner" />
      </div>

      {/* Cooperative Field Assistance Banner */}
      <div className="mt-5">
        <div className="p-3.5 rounded-2xl bg-[#fea619]/20 border border-[#fea619]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fea619] text-[#684000] flex items-center justify-center font-bold shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[22px]">support_agent</span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#131b2e]">Besoin d'aide sur le terrain ?</p>
              <p className="text-[11px] text-[#404940]">
                Appelez notre conseiller au <span className="font-bold text-[#131b2e]">07 07 40 40 40</span>
              </p>
            </div>
          </div>
          <a
            aria-label="Appeler le support agricole"
            className="w-9 h-9 rounded-full bg-[#855300] text-white flex items-center justify-center shadow-md shrink-0 hover:bg-[#653e00] transition-colors"
            href="tel:+2250707404040"
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
          </a>
        </div>
      </div>
    </div>
  );
};
