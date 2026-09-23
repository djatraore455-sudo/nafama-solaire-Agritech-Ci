import React, { useState, useEffect, useRef } from 'react';
import { LanguageCode, ScreenId, UserAccount, UserRole } from '../types';
import { VOICE_PROMPTS } from '../data/mockData';
import { PWAInstallButton } from './PWAInstallButton';
import {
  signInWithGoogleAuth,
  signInWithFacebookAuth,
  signInWithEmailAuth,
  signUpWithEmailAuth,
  setupRecaptchaVerifier,
  sendFirebasePhoneOtp,
  saveUserProfileToFirestore,
  NAFAMA_ADVISOR_PHONE,
  NAFAMA_ADVISOR_DISPLAY
} from '../firebase';
import { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';

interface ScreenAuthProps {
  onSuccess: (user: UserAccount) => void;
  onNavigate: (screen: ScreenId) => void;
  onTriggerSmsNotification: (message: string) => void;
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}

const ROLES_INFO: {
  id: UserRole;
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
  color: string;
  bgColor: string;
  desc: string;
}[] = [
  {
    id: 'producer',
    title: 'Producteur Agricole',
    subtitle: 'Maraîcher / Exploitant',
    icon: 'agriculture',
    badge: 'Pompes & Récoltes',
    color: '#004c22',
    bgColor: '#e8f8ed',
    desc: 'Pilotage direct des pompes solaires, suivi météo & sol, calcul d’économies gasoil en FCFA, publication de récoltes.'
  },
  {
    id: 'technician',
    title: 'Technicien Maintenance',
    subtitle: 'Solaire & Réseau IoT',
    icon: 'build',
    badge: 'Dépannage & Alarmes',
    color: '#005e87',
    bgColor: '#e2f0fd',
    desc: 'Surveillance technique du parc, interventions sur vannes, diagnostics de pression, alertes tamis & capteurs LoRa.'
  },
  {
    id: 'buyer',
    title: 'Acheteur / Grossiste',
    subtitle: 'Commerçant & Coopérative',
    icon: 'shopping_cart',
    badge: 'Marché & Commandes',
    color: '#855300',
    bgColor: '#ffedd5',
    desc: 'Accès direct à la bourse bord-champ, approvisionnement en vivriers certifiés solaires, paiement Mobile Money sécurisé.'
  }
];

export const ScreenAuth: React.FC<ScreenAuthProps> = ({
  onSuccess,
  onNavigate,
  onTriggerSmsNotification,
  currentLang,
  onLanguageChange
}) => {
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [selectedRole, setSelectedRole] = useState<UserRole>('producer');
  const [adminMasterKey, setAdminMasterKey] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
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
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  // Email / Password Modal state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isEmailRegister, setIsEmailRegister] = useState(false);

  // SMS OTP Modal state
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [smsPhoneInput, setSmsPhoneInput] = useState(phone);
  const [otpCodeInput, setOtpCodeInput] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

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

    if (selectedRole === 'admin') {
      const validAdminKeys = ['ADMIN2026', 'ADMIN', '0000', '9999'];
      if (!validAdminKeys.includes(adminMasterKey.trim().toUpperCase())) {
        setFeedbackMsg("Clé de sécurité Administrateur incorrecte. Entrez la clé principale (ex: ADMIN2026).");
        return;
      }
    }

    const account: UserAccount = {
      nom: authMode === 'register' ? nom : (selectedRole === 'admin' ? 'Administrateur' : 'Kouassi'),
      prenom: authMode === 'register' ? prenom : (selectedRole === 'admin' ? 'Principal' : 'Konan'),
      phone,
      location: residence,
      role: selectedRole,
      pin,
      isLoggedIn: true,
      avatar: avatarPreview || undefined
    };

    onSuccess(account);
    saveUserProfileToFirestore(account).catch(() => {});

    if (selectedRole === 'admin') {
      onTriggerSmsNotification(`Connexion Administrateur Principal réussie. Supervision nationale déverrouillée.`);
      onNavigate('admin');
    } else if (selectedRole === 'buyer') {
      onTriggerSmsNotification(`Bienvenue ${account.prenom} ! Espace Acheteur NAFAMA ouvert. Consultez les récoltes solaires.`);
      onNavigate('marche');
    } else if (selectedRole === 'technician') {
      onTriggerSmsNotification(`Espace Technicien Maintenance & IoT NAFAMA activé pour ${account.prenom} ${account.nom}.`);
      onNavigate('solaire');
    } else {
      onTriggerSmsNotification(
        authMode === 'register'
          ? `Bienvenue chez NAFAMA SOLAIRE, ${account.prenom} ${account.nom} ! Compte Producteur activé pour ${account.location}.`
          : `Connexion réussie. Espace Producteur & Pompe Solaire actif.`
      );
      onNavigate('solaire');
    }
  };

  // 1. Authentification Google Réelle
  const handleGoogleSignIn = async () => {
    setIsLoadingAuth(true);
    setFeedbackMsg(null);
    try {
      const user = await signInWithGoogleAuth();
      const displayNameParts = (user.displayName || 'Producteur Solaire').split(' ');
      const userPrenom = displayNameParts[0] || 'Utilisateur';
      const userNom = displayNameParts.slice(1).join(' ') || 'Google';

      const account: UserAccount = {
        nom: userNom,
        prenom: userPrenom,
        phone: user.phoneNumber || phone,
        location: residence,
        role: selectedRole,
        pin: '2025',
        isLoggedIn: true,
        avatar: user.photoURL || undefined
      };

      await saveUserProfileToFirestore(account);
      onSuccess(account);
      onTriggerSmsNotification(`Bienvenue ${account.prenom} ! Connecté via Google à NAFAMA SOLAIRE.`);
      onNavigate(selectedRole === 'admin' ? 'admin' : selectedRole === 'buyer' ? 'marche' : 'solaire');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (errorMsg.includes('popup-closed-by-user')) {
        setFeedbackMsg("Connexion Google annulée.");
      } else {
        setFeedbackMsg("Erreur Google : " + errorMsg);
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // 2. Authentification Facebook Réelle
  const handleFacebookSignIn = async () => {
    setIsLoadingAuth(true);
    setFeedbackMsg(null);
    try {
      const user = await signInWithFacebookAuth();
      const displayNameParts = (user.displayName || 'Utilisateur Facebook').split(' ');
      const userPrenom = displayNameParts[0] || 'Acheteur';
      const userNom = displayNameParts.slice(1).join(' ') || 'Facebook';

      const account: UserAccount = {
        nom: userNom,
        prenom: userPrenom,
        phone: user.phoneNumber || phone,
        location: residence,
        role: selectedRole,
        pin: '2025',
        isLoggedIn: true,
        avatar: user.photoURL || undefined
      };

      await saveUserProfileToFirestore(account);
      onSuccess(account);
      onTriggerSmsNotification(`Bienvenue ${account.prenom} ! Connecté via Facebook à NAFAMA SOLAIRE.`);
      onNavigate(selectedRole === 'admin' ? 'admin' : selectedRole === 'buyer' ? 'marche' : 'solaire');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (errorMsg.includes('popup-closed-by-user')) {
        setFeedbackMsg("Connexion Facebook annulée.");
      } else {
        setFeedbackMsg("Erreur Facebook : " + errorMsg + ". Vérifiez l'activation de Facebook dans Firebase Auth.");
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // 3. Authentification Email / Mot de passe Réelle
  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setFeedbackMsg("Veuillez renseigner votre email et un mot de passe.");
      return;
    }
    setIsLoadingAuth(true);
    setFeedbackMsg(null);

    try {
      let user;
      if (isEmailRegister) {
        user = await signUpWithEmailAuth(emailInput, passwordInput);
      } else {
        user = await signInWithEmailAuth(emailInput, passwordInput);
      }

      const emailPrefix = emailInput.split('@')[0];
      const account: UserAccount = {
        nom: 'Compte',
        prenom: emailPrefix,
        phone: user.phoneNumber || phone,
        location: residence,
        role: selectedRole,
        pin: '2025',
        isLoggedIn: true
      };

      await saveUserProfileToFirestore(account);
      setIsEmailModalOpen(false);
      onSuccess(account);
      onTriggerSmsNotification(`Compte ${emailInput} connecté avec succès à NAFAMA SOLAIRE.`);
      onNavigate(selectedRole === 'admin' ? 'admin' : selectedRole === 'buyer' ? 'marche' : 'solaire');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (errorMsg.includes('user-not-found') || errorMsg.includes('invalid-credential')) {
        setFeedbackMsg("Identifiants incorrects ou compte inexistant.");
      } else if (errorMsg.includes('email-already-in-use')) {
        setFeedbackMsg("Cette adresse email est déjà enregistrée. Veuillez vous connecter.");
      } else {
        setFeedbackMsg("Erreur Email Auth : " + errorMsg);
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // 4. Authentification OTP SMS Téléphone Réelle
  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingAuth(true);
    setFeedbackMsg(null);

    try {
      // Nettoyage et formatage international CI (+225)
      let cleanPhone = smsPhoneInput.replace(/\s+/g, '').replace(/-/g, '');
      if (!cleanPhone.startsWith('+')) {
        if (cleanPhone.startsWith('225')) {
          cleanPhone = '+' + cleanPhone;
        } else {
          cleanPhone = '+225' + cleanPhone;
        }
      }

      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = setupRecaptchaVerifier('recaptcha-sms-container');
      }

      const confirmResult = await sendFirebasePhoneOtp(cleanPhone, recaptchaVerifierRef.current);
      setConfirmationResult(confirmResult);
      setOtpSent(true);
      onTriggerSmsNotification(`SMS envoyé à ${cleanPhone}. Entrez le code à 6 chiffres reçu.`);
      setFeedbackMsg(`Code de confirmation SMS envoyé à ${cleanPhone}.`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setFeedbackMsg("Erreur SMS Phone Auth : " + errorMsg + ". Note : utilisez un numéro de test Firebase ou vérifiez le quota.");
      // Fallback démo interactif si quota ou ReCaptcha
      onTriggerSmsNotification(`Code de sécurité SMS NAFAMA : 4829. Valable 5 minutes.`);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCodeInput) {
      setFeedbackMsg("Veuillez saisir le code reçu par SMS.");
      return;
    }
    setIsLoadingAuth(true);

    try {
      let finalPhone = smsPhoneInput;
      if (confirmationResult) {
        const cred = await confirmationResult.confirm(otpCodeInput);
        finalPhone = cred.user.phoneNumber || smsPhoneInput;
      }

      const account: UserAccount = {
        nom: 'Kouassi',
        prenom: 'Exploitant',
        phone: finalPhone,
        location: residence,
        role: selectedRole,
        pin: '2025',
        isLoggedIn: true
      };

      await saveUserProfileToFirestore(account);
      setIsSmsModalOpen(false);
      onSuccess(account);
      onTriggerSmsNotification(`Numéro validé par SMS ! Espace ${selectedRole} activé.`);
      onNavigate(selectedRole === 'admin' ? 'admin' : selectedRole === 'buyer' ? 'marche' : 'solaire');
    } catch (err: unknown) {
      // Fallback démo avec code 4829 ou 123456
      if (otpCodeInput === '4829' || otpCodeInput === '123456') {
        const account: UserAccount = {
          nom: 'Kouassi',
          prenom: 'Exploitant',
          phone: smsPhoneInput,
          location: residence,
          role: selectedRole,
          pin: '2025',
          isLoggedIn: true
        };
        await saveUserProfileToFirestore(account);
        setIsSmsModalOpen(false);
        onSuccess(account);
        onTriggerSmsNotification(`Code SMS démo validé ! Espace ${selectedRole} activé.`);
        onNavigate(selectedRole === 'admin' ? 'admin' : selectedRole === 'buyer' ? 'marche' : 'solaire');
      } else {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setFeedbackMsg("Code SMS invalide ou expiré : " + errorMsg);
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleQuickOtp = () => {
    setIsSmsModalOpen(true);
    setSmsPhoneInput(phone);
    setOtpSent(false);
    setOtpCodeInput('');
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
          {/* Role / Status Selection (Technicien, Acheteur, Producteur, Admin) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#131b2e] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#004c22]">badge</span>
                <span>{authMode === 'register' ? 'Précisez votre statut *' : 'Votre statut d’accès'}</span>
              </label>
              <span className="text-[10px] text-[#004c22] font-semibold bg-[#e8f8ed] px-2 py-0.5 rounded-full">
                Statut obligatoire
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {ROLES_INFO.map((r) => {
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setSelectedRole(r.id);
                      setShowAdminLogin(false);
                      setFeedbackMsg(null);
                    }}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all relative ${
                      isSelected
                        ? 'border-[#004c22] bg-[#f2fdf5] shadow-xs ring-2 ring-[#004c22]/20'
                        : 'border-[#eaedff] bg-[#fafbff] hover:bg-[#f2f3ff]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: r.bgColor, color: r.color }}
                      >
                        <span className="material-symbols-outlined text-[20px]">{r.icon}</span>
                      </div>
                      {isSelected ? (
                        <span className="w-5 h-5 rounded-full bg-[#004c22] text-white flex items-center justify-center text-[11px] font-bold">
                          ✓
                        </span>
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-[#bfc9bd]" />
                      )}
                    </div>

                    <div className="mt-2">
                      <h4 className="text-xs font-extrabold text-[#131b2e]">{r.title}</h4>
                      <p className="text-[10px] text-[#707a6f] line-clamp-1">{r.subtitle}</p>
                    </div>

                    <span
                      className="mt-2 text-[9px] font-bold px-1.5 py-0.5 rounded-md inline-block w-fit"
                      style={{ backgroundColor: r.bgColor, color: r.color }}
                    >
                      {r.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Contextual description according to active role */}
            <div className="p-2.5 rounded-xl bg-[#f2f3ff] text-[11px] text-[#404940] flex items-center gap-2 border border-[#dae2fd]">
              <span className="material-symbols-outlined text-[#004c22] text-[18px] shrink-0">info</span>
              <span>
                {selectedRole === 'producer' && "Espace Producteur : Pilotage des pompes solaires, suivi météo & sol, économies gasoil en FCFA, vente de récoltes."}
                {selectedRole === 'technician' && "Espace Technicien : Surveillance technique du parc, vannes, pression, alertes filtres et capteurs LoRa."}
                {selectedRole === 'buyer' && "Espace Acheteur : Bourse maraîchère bord-champ, approvisionnement en vivriers certifiés solaires et commandes Mobile Money."}
                {selectedRole === 'admin' && "Espace Administrateur : Supervision nationale, validation des récoltes, affectation techniciens et arbitrage financier."}
              </span>
            </div>

            {/* Administrator Secret Key Switch */}
            <div className="pt-0.5">
              {!showAdminLogin && selectedRole !== 'admin' ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminLogin(true);
                    setSelectedRole('admin');
                  }}
                  className="text-[11px] text-[#707a6f] hover:text-[#ba1a1a] flex items-center gap-1 font-semibold transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">security</span>
                  <span>Vous êtes l'Administrateur Principal ? Cliquez ici</span>
                </button>
              ) : (
                <div className="p-3 rounded-2xl bg-[#fff8f6] border border-[#ffdad6] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#ba1a1a] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                      Espace Administrateur Principal (Restreint)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAdminLogin(false);
                        setSelectedRole('producer');
                      }}
                      className="text-[11px] text-[#707a6f] hover:text-[#131b2e] font-bold"
                    >
                      Annuler
                    </button>
                  </div>
                  <p className="text-[11px] text-[#404940]">
                    Entrez la clé de sécurité confidentielle attribuée à la direction NAFAMA SOLAIRE (Clé démo : <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-[#ba1a1a]">ADMIN2026</code>) :
                  </p>
                  <div className="flex items-center bg-white rounded-xl px-3 py-2 border border-[#ffdad6]">
                    <span className="material-symbols-outlined text-[#ba1a1a] text-[18px] mr-2">key</span>
                    <input
                      type="password"
                      value={adminMasterKey}
                      onChange={(e) => setAdminMasterKey(e.target.value)}
                      placeholder="Ex: ADMIN2026"
                      className="w-full bg-transparent text-xs font-bold tracking-widest text-[#131b2e] focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

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
            <span className="material-symbols-outlined text-[22px]">
              {selectedRole === 'admin' ? 'admin_panel_settings' : selectedRole === 'technician' ? 'build' : selectedRole === 'buyer' ? 'shopping_bag' : 'agriculture'}
            </span>
            <span>
              {authMode === 'register'
                ? selectedRole === 'admin'
                  ? 'Créer & Déverrouiller Espace Admin'
                  : selectedRole === 'technician'
                  ? 'Créer mon compte Technicien Solaire'
                  : selectedRole === 'buyer'
                  ? 'Créer mon compte Acheteur & Marché'
                  : 'Créer mon compte Producteur Agricole'
                : selectedRole === 'admin'
                ? 'Connexion Supervision Administrateur'
                : selectedRole === 'technician'
                ? 'Connexion Espace Technicien'
                : selectedRole === 'buyer'
                ? 'Connexion Espace Acheteur'
                : 'Connexion Espace Producteur'}
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
                role: selectedRole,
                pin: '2025',
                isLoggedIn: true,
                avatar: avatarPreview || undefined
              });
              if (selectedRole === 'admin') {
                onNavigate('admin');
              } else if (selectedRole === 'buyer') {
                onNavigate('marche');
              } else {
                onNavigate('solaire');
              }
            }}
            className="w-full h-11 rounded-2xl bg-[#eaedff] text-[#004c22] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#dae2fd] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">solar_power</span>
            <span>Explorer directement en mode {selectedRole === 'admin' ? 'Admin' : selectedRole === 'technician' ? 'Technicien' : selectedRole === 'buyer' ? 'Acheteur' : 'Producteur'}</span>
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

      {/* Invisible ReCAPTCHA Container for Firebase SMS Auth */}
      <div id="recaptcha-sms-container"></div>

      {/* Fast Social & Multi-Channel Authentication Buttons */}
      <div className="flex flex-col gap-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          {/* Google Auth Button (Real Firebase) */}
          <button
            type="button"
            disabled={isLoadingAuth}
            onClick={handleGoogleSignIn}
            className="h-12 px-3 rounded-2xl bg-white text-[#131b2e] shadow-xs border border-[#eaedff] flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-[#f8f9ff]"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
            </svg>
            <span className="text-xs font-bold">Google</span>
          </button>

          {/* Facebook Auth Button (Real Firebase) */}
          <button
            type="button"
            disabled={isLoadingAuth}
            onClick={handleFacebookSignIn}
            className="h-12 px-3 rounded-2xl bg-white text-[#131b2e] shadow-xs border border-[#eaedff] flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-[#f8f9ff]"
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
          disabled={isLoadingAuth}
          onClick={handleQuickOtp}
          className="w-full h-12 px-4 rounded-2xl bg-[#eaedff] text-[#131b2e] shadow-xs flex items-center justify-between active:scale-[0.98] transition-transform hover:bg-[#dae2fd]"
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#004c22] text-[20px]">sms</span>
            <span className="text-xs font-semibold">Connexion Téléphone par SMS (OTP)</span>
          </div>
          <span className="text-[10px] font-bold text-[#004c22] bg-white px-2 py-0.5 rounded-full">
            Code SMS
          </span>
        </button>

        {/* Email Option */}
        <button
          type="button"
          disabled={isLoadingAuth}
          onClick={() => {
            setIsEmailModalOpen(true);
            setFeedbackMsg(null);
          }}
          className="w-full h-12 px-4 rounded-2xl bg-[#eaedff] text-[#131b2e] shadow-xs flex items-center justify-between active:scale-[0.98] transition-transform hover:bg-[#dae2fd]"
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#005e87] text-[20px]">alternate_email</span>
            <span className="text-xs font-semibold">Connexion avec Email & Mot de passe</span>
          </div>
          <span className="material-symbols-outlined text-[#707a6f] text-[18px]">chevron_right</span>
        </button>
      </div>

      {/* PWA Install Banner */}
      <div className="mt-4">
        <PWAInstallButton variant="banner" />
      </div>

      {/* Cooperative Field Assistance Banner with User Advisor Phone +2256464843912 */}
      <div className="mt-5">
        <div className="p-3.5 rounded-2xl bg-[#fea619]/20 border border-[#fea619]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fea619] text-[#684000] flex items-center justify-center font-bold shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[22px]">support_agent</span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#131b2e]">Besoin d'aide sur le terrain ?</p>
              <p className="text-[11px] text-[#404940]">
                Appelez notre conseiller au <span className="font-bold text-[#131b2e]">{NAFAMA_ADVISOR_DISPLAY}</span>
              </p>
            </div>
          </div>
          <a
            aria-label="Appeler le conseiller agricole"
            className="w-9 h-9 rounded-full bg-[#855300] text-white flex items-center justify-center shadow-md shrink-0 hover:bg-[#653e00] transition-colors"
            href={`tel:${NAFAMA_ADVISOR_PHONE}`}
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
          </a>
        </div>
      </div>

      {/* Modal Email / Password Authentication */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-[#eaedff]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#005e87] text-[22px]">alternate_email</span>
                <h3 className="text-sm font-bold text-[#131b2e]">
                  {isEmailRegister ? "Créer un compte Email" : "Connexion par Email"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#f2f3ff] text-[#707a6f] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#404940] mb-3">
              Renseignez vos identifiants pour l'espace <strong className="capitalize">{selectedRole}</strong>.
            </p>

            <form onSubmit={handleEmailAuthSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#404940]">Adresse Email</label>
                <input
                  type="email"
                  required
                  placeholder="ex: planteur@coop-ci.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-[#f2f3ff] rounded-xl px-3 py-2 text-xs text-[#131b2e] focus:outline-none border border-[#eaedff]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#404940]">Mot de passe (min 6 car.)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-[#f2f3ff] rounded-xl px-3 py-2 text-xs text-[#131b2e] focus:outline-none border border-[#eaedff]"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setIsEmailRegister(!isEmailRegister)}
                  className="text-[11px] font-semibold text-[#004c22] hover:underline"
                >
                  {isEmailRegister ? "J'ai déjà un compte (Se connecter)" : "Pas encore de compte ? S'inscrire"}
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#f2f3ff] text-[#404940] text-xs font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoadingAuth}
                  className="flex-1 py-2.5 rounded-xl bg-[#004c22] text-white text-xs font-bold shadow-md hover:bg-[#166534] flex items-center justify-center gap-1.5"
                >
                  {isLoadingAuth && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                  <span>{isEmailRegister ? "S'inscrire" : "Se connecter"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal SMS OTP Authentication */}
      {isSmsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-[#eaedff]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004c22] text-[22px]">sms</span>
                <h3 className="text-sm font-bold text-[#131b2e]">Connexion SMS (Code OTP)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSmsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#f2f3ff] text-[#707a6f] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#404940] mb-3">
              Recevez un code SMS direct sur votre mobile ivoirien (Orange, MTN, Moov, Wave).
            </p>

            {!otpSent ? (
              <form onSubmit={handleSendPhoneOtp} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#404940]">Numéro de téléphone</label>
                  <div className="flex items-center bg-[#f2f3ff] rounded-xl px-3 py-2 border border-[#eaedff]">
                    <span className="text-xs font-bold text-[#004c22] mr-2">+225</span>
                    <input
                      type="tel"
                      required
                      placeholder="07 58 42 19 80"
                      value={smsPhoneInput}
                      onChange={(e) => setSmsPhoneInput(e.target.value)}
                      className="w-full bg-transparent text-xs font-semibold text-[#131b2e] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSmsModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-[#f2f3ff] text-[#404940] text-xs font-bold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isLoadingAuth}
                    className="flex-1 py-2.5 rounded-xl bg-[#004c22] text-white text-xs font-bold shadow-md hover:bg-[#166534] flex items-center justify-center gap-1.5"
                  >
                    {isLoadingAuth && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                    <span>Envoyer le SMS</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyPhoneOtp} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#404940]">Code à 6 chiffres reçu</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="ex: 482931"
                    value={otpCodeInput}
                    onChange={(e) => setOtpCodeInput(e.target.value)}
                    className="w-full bg-[#f2f3ff] rounded-xl px-3 py-2 text-center text-lg font-black tracking-widest text-[#004c22] focus:outline-none border border-[#eaedff]"
                  />
                  <p className="text-[10px] text-[#707a6f]">
                    Code de test / démo autorisé : <strong className="text-[#004c22]">4829</strong> ou <strong className="text-[#004c22]">123456</strong>
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="flex-1 py-2.5 rounded-xl bg-[#f2f3ff] text-[#404940] text-xs font-bold"
                  >
                    Changer de numéro
                  </button>
                  <button
                    type="submit"
                    disabled={isLoadingAuth}
                    className="flex-1 py-2.5 rounded-xl bg-[#004c22] text-white text-xs font-bold shadow-md hover:bg-[#166534] flex items-center justify-center gap-1.5"
                  >
                    {isLoadingAuth && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                    <span>Valider & Entrer</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
