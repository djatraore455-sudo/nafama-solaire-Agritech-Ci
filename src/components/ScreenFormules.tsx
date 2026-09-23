import React, { useState } from 'react';
import { SmsSetting, ScreenId } from '../types';
import { INITIAL_SMS_SETTINGS, RECIPIENT_NUMBERS } from '../data/mockData';

interface ScreenFormulesProps {
  onNavigate: (screen: ScreenId) => void;
  onTriggerSmsNotification: (message: string) => void;
}

export const ScreenFormules: React.FC<ScreenFormulesProps> = ({
  onNavigate,
  onTriggerSmsNotification
}) => {
  const [billingCycle, setBillingCycle] = useState<'mensuel' | 'annuel'>('mensuel');
  const [activePlan, setActivePlan] = useState<'free' | 'standard' | 'premium'>('standard');
  const [smsSettings, setSmsSettings] = useState<SmsSetting[]>(INITIAL_SMS_SETTINGS);
  const [recipientList, setRecipientList] = useState(RECIPIENT_NUMBERS);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSentSuccess, setTestSentSuccess] = useState(false);

  // Add number modal
  const [isAddNumberOpen, setIsAddNumberOpen] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [newName, setNewName] = useState('');
  const [newOperator, setNewOperator] = useState('Orange CI');

  const toggleSmsSetting = (id: string) => {
    setSmsSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleSendTestSms = () => {
    setIsSendingTest(true);
    setTimeout(() => {
      setIsSendingTest(false);
      setTestSentSuccess(true);
      onTriggerSmsNotification(
        "TEST NAFAMA GSM: Pompe #NF-408 normale (Tension 14.1V, Débit 14.2m3/h). Réseau LoRa OK."
      );
      setTimeout(() => {
        setTestSentSuccess(false);
      }, 5000);
    }, 1200);
  };

  const handleAddNumber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone || !newName) return;

    setRecipientList((prev) => [
      ...prev,
      {
        id: `rec-${Date.now()}`,
        phone: `+225 ${newPhone}`,
        name: newName,
        operator: newOperator,
        badge: 'Équipe'
      }
    ]);
    setIsAddNumberOpen(false);
    setNewPhone('');
    setNewName('');
    onTriggerSmsNotification(`Numéro +225 ${newPhone} (${newName}) ajouté aux alertes SMS.`);
  };

  const handleDeleteNumber = (id: string) => {
    setRecipientList((prev) => prev.filter((r) => r.id !== id));
  };

  const handlePlayVocalPlanGuide = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(
        "Formule Standard officielle NAFAMA : 2 000 francs CFA par mois pour le suivi complet et conseils d'optimisation. Formule Premium à 5 000 francs CFA par mois avec pilotage à distance de la pompe solaire."
      );
      u.lang = 'fr-FR';
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="flex flex-col w-full px-4 pb-24 pt-2 gap-4 max-w-md mx-auto">
      {/* Section En-tête & Statut Global */}
      <section className="bg-[#f2f3ff] rounded-2xl p-4 shadow-sm relative overflow-hidden border border-[#eaedff]">
        <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-[#004c22]/5 rounded-full blur-xl pointer-events-none"></div>

        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#a6f4b5] text-[#00210b] text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#004c22] animate-pulse"></span>
            <span>Statut : Formule Standard Active</span>
          </div>
          <div className="flex items-center gap-1 text-[#855300] text-xs font-bold">
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            <span>Réseau GSM 99.8%</span>
          </div>
        </div>

        <h2 className="text-lg font-bold text-[#131b2e] mb-1">Formules & Alertes SMS</h2>
        <p className="text-xs text-[#404940] leading-relaxed">
          Recevez par SMS en direct l'état critique de vos pompes solaires, la météo agricole et vos opportunités d'affaires sans aucune connexion Internet requise.
        </p>

        {/* SMS Counter Pill */}
        <div className="mt-3 bg-white/90 rounded-xl p-3 flex items-center justify-between border border-[#eaedff]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#166534] text-white flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">mark_chat_unread</span>
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-[#131b2e]">94 SMS restants</div>
              <div className="text-[11px] text-[#404940] truncate">Cycle actuel : recharge le 15 Nov.</div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-[#004c22] bg-[#a6f4b5]/40 px-2 py-1 rounded-md flex-shrink-0">
            Illimité pannes
          </span>
        </div>
      </section>

      {/* Sélecteur Fréquence Facturation */}
      <section className="bg-[#e2e7ff] p-1 rounded-2xl flex items-center text-center shadow-inner">
        <button
          type="button"
          onClick={() => setBillingCycle('mensuel')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            billingCycle === 'mensuel'
              ? 'bg-white text-[#004c22] shadow-sm'
              : 'text-[#404940] hover:text-[#004c22]'
          }`}
        >
          Facturation Mensuelle
        </button>
        <button
          type="button"
          onClick={() => setBillingCycle('annuel')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
            billingCycle === 'annuel'
              ? 'bg-white text-[#004c22] shadow-sm'
              : 'text-[#404940] hover:text-[#004c22]'
          }`}
        >
          <span>Annuel</span>
          <span className="bg-[#855300] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
            -15%
          </span>
        </button>
      </section>

      {/* Comparatif des 3 Formules */}
      <section className="flex flex-col gap-3.5">
        {/* Formule 1: Gratuit */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff]">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-[10px] font-bold uppercase text-[#707a6f] tracking-wider">
                Démarrage
              </span>
              <h3 className="text-base font-bold text-[#131b2e]">Mode Gratuit - Découverte</h3>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#f2f3ff] flex items-center justify-center text-[#707a6f]">
              <span className="material-symbols-outlined text-[18px]">eco</span>
            </div>
          </div>

          <div className="mb-2">
            <span className="text-2xl font-black text-[#131b2e]">0 FCFA</span>
            <span className="text-xs text-[#404940]"> / mois pour toujours</span>
          </div>

          <p className="text-xs text-[#404940] mb-3">
            Indispensable pour démarrer le suivi à distance et tester la connexion avec l'onduleur solaire.
          </p>

          <ul className="flex flex-col gap-2 mb-4 text-xs text-[#131b2e]">
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004c22] text-[18px]">check_circle</span>
              <span>Consultation télémétrie en ligne (Wi-Fi ou 4G)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004c22] text-[18px]">check_circle</span>
              <span>5 SMS d'alerte critique / mois (arrêt pompe)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004c22] text-[18px]">check_circle</span>
              <span>Accès au catalogue acheteurs & coopératives</span>
            </li>
          </ul>

          <button
            type="button"
            onClick={() => setActivePlan('free')}
            className={`w-full h-11 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${
              activePlan === 'free'
                ? 'bg-[#004c22] text-white'
                : 'bg-[#eaedff] text-[#131b2e] hover:bg-[#dae2fd]'
            }`}
          >
            {activePlan === 'free' ? 'Formule active' : 'Choisir la Formule de base'}
          </button>
        </div>

        {/* Formule 2: Standard (Actuel - Recommandé) */}
        <div className="bg-white rounded-2xl p-4 shadow-md border-2 border-[#004c22] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#004c22]"></div>
          
          <div className="flex items-start justify-between mb-1 mt-1">
            <div className="flex flex-col">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#004c22] uppercase tracking-wider">
                <span className="material-symbols-outlined text-[14px]">recommend</span>
                Conseillé aux Fermiers & Maraîchers
              </span>
              <h3 className="text-base font-bold text-[#004c22]">Mode Standard</h3>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#a6f4b5] text-[#00210b] text-[10px] font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">verified</span>
              Actuel
            </span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#004c22]">
                {billingCycle === 'mensuel' ? '2 000 FCFA' : '20 000 FCFA'}
              </span>
              <span className="text-xs text-[#404940]">
                {billingCycle === 'mensuel' ? ' / mois' : ' / an (soit ~1 666 F/mois, 2 mois offerts)'}
              </span>
            </div>
            <div className="text-[11px] font-semibold text-[#004c22] mt-0.5">
              Suivi énergie complet + conseils d'optimisation
            </div>
          </div>

          <p className="text-xs text-[#404940] mb-3">
            Formule officielle NAFAMA : télémétrie complète, alertes SMS critiques et recommandations agronomiques pour maximiser le pompage solaire.
          </p>

          <div className="bg-[#f2f3ff] rounded-xl p-3 mb-3 flex flex-col gap-2 text-xs text-[#131b2e] border border-[#dae2fd]">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[#004c22] text-[18px] mt-0.5">sms</span>
              <div>
                <span className="font-bold text-[#004c22]">Alertes SMS instantanées illimitées</span>
                <p className="text-[#404940] text-[11px] leading-tight">
                  Coupure d'eau, surchauffe moteur, batterie faible, chute pression.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[#004c22] text-[18px] mt-0.5">wb_sunny</span>
              <div>
                <span className="font-bold">Bulletin météo agricole matinal</span>
                <p className="text-[#404940] text-[11px] leading-tight">
                  Envoyé chaque jour à 6h00 (pluviométrie, vent, indice solaire).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004c22] text-[18px]">call</span>
              <span>Assistance téléphonique dédiée & prioritaire</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004c22] text-[18px]">group</span>
              <span>Jusqu'à <strong>2 numéros SMS notifiés</strong> en simultané</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('paiement')}
              className="flex-1 h-11 rounded-xl bg-[#004c22] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-transform hover:bg-[#166534]"
            >
              <span className="material-symbols-outlined text-[18px]">settings</span>
              <span>Gérer mon abonnement</span>
            </button>

            <button
              type="button"
              onClick={handlePlayVocalPlanGuide}
              title="Assistance vocale abonnement"
              className="w-11 h-11 rounded-xl bg-[#eaedff] text-[#004c22] flex items-center justify-center active:scale-95 transition-transform hover:bg-[#dae2fd]"
            >
              <span className="material-symbols-outlined text-[20px]">volume_up</span>
            </button>
          </div>

          <div className="text-center mt-2">
            <span className="text-[11px] text-[#707a6f]">
              Prochain prélèvement automatique : 15 Novembre 2025
            </span>
          </div>
        </div>

        {/* Formule 3: Premium */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#fea619]/10 rounded-bl-full pointer-events-none"></div>

          <div className="flex items-start justify-between mb-1">
            <div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#855300] uppercase tracking-wider">
                <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
                Haute Performance & Export
              </span>
              <h3 className="text-base font-bold text-[#131b2e]">Mode Premium Coopérative</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#fea619] text-[#684000] text-[10px] font-bold">
              Pro & IA
            </span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#131b2e]">
                {billingCycle === 'mensuel' ? '5 000 FCFA' : '50 000 FCFA'}
              </span>
              <span className="text-xs text-[#404940]">
                {billingCycle === 'mensuel' ? ' / mois' : ' / an (2 mois offerts)'}
              </span>
            </div>
            <div className="text-[11px] font-semibold text-[#855300] mt-0.5">
              Standard + pilotage à distance de la pompe solaire
            </div>
          </div>

          <p className="text-xs text-[#404940] mb-3">
            Inclus : activation / arrêt de la pompe solaire par SMS ou 4G, prévisions météorologiques poussées, diagnostics automatiques et support prioritaire 24h.
          </p>

          <ul className="flex flex-col gap-2 mb-4 text-xs text-[#131b2e]">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[#855300] text-[18px] mt-0.5">auto_awesome</span>
              <div>
                <span className="font-bold">Diagnostics IA & SMS Prédictifs</span>
                <p className="text-[#404940] text-[11px] leading-tight">
                  Détection d'usure des panneaux, alertes ravageurs et conseils d'arrosage ciblés.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[#855300] text-[18px] mt-0.5">notifications_active</span>
              <div>
                <span className="font-bold">Alertes Ventes Directes Instantanées</span>
                <p className="text-[#404940] text-[11px] leading-tight">
                  Notification dès qu'un maquis ou hôtel valide une commande sur la plateforme.
                </p>
              </div>
            </li>

            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#855300] text-[18px]">build</span>
              <span>Intervention d'un technicien certifié sous 24h garantie</span>
            </li>

            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#855300] text-[18px]">groups</span>
              <span>Jusqu'à <strong>5 numéros d'équipe notifiés</strong> en temps réel</span>
            </li>
          </ul>

          <button
            type="button"
            onClick={() => {
              setActivePlan('premium');
              onTriggerSmsNotification("Demande de mise à niveau vers le Mode Premium Coopérative enregistrée.");
            }}
            className="w-full h-11 rounded-xl bg-[#dae2fd] text-[#131b2e] text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-[#eaedff]"
          >
            <span className="material-symbols-outlined text-[#855300] text-[18px]">upgrade</span>
            <span>Passer à la formule Premium</span>
          </button>
        </div>

        {/* Grille Tarifaire Officielle (Extrait du document projet NAFAMA) */}
        <div className="bg-[#f2f3ff] rounded-2xl p-4 border border-[#dae2fd] shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#004c22] text-[20px]">verified</span>
            <h4 className="text-xs font-bold text-[#131b2e] uppercase tracking-wide">
              Grille Tarifaire Officielle NAFAMA
            </h4>
          </div>
          <p className="text-[11px] text-[#404940] mb-3">
            Conforme au plan d'affaires officiel (KOICA / GENIE Cohorte 1 Korhogo & Digifemme CI) :
          </p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between p-2 rounded-xl bg-white text-xs border border-[#eaedff]">
              <div>
                <span className="font-bold text-[#131b2e]">Abonnement Gratuit</span>
                <p className="text-[11px] text-[#404940]">Suivi énergie basique (lecture seule)</p>
              </div>
              <span className="font-bold text-[#004c22]">0 FCFA / mois</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-white text-xs border border-[#eaedff]">
              <div>
                <span className="font-bold text-[#131b2e]">Abonnement Standard</span>
                <p className="text-[11px] text-[#404940]">Suivi énergie complet + conseils d'optimisation</p>
              </div>
              <span className="font-bold text-[#004c22]">2 000 FCFA / mois</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-white text-xs border border-[#eaedff]">
              <div>
                <span className="font-bold text-[#131b2e]">Abonnement Premium</span>
                <p className="text-[11px] text-[#404940]">Standard + pilotage à distance de la pompe</p>
              </div>
              <span className="font-bold text-[#855300]">5 000 FCFA / mois</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-white text-xs border border-[#eaedff]">
              <div>
                <span className="font-bold text-[#131b2e]">Commission Marché</span>
                <p className="text-[11px] text-[#404940]">Taux volontairement bas pour favoriser l'adoption</p>
              </div>
              <span className="font-bold text-[#005e87]">3 % / transaction</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-white text-xs border border-[#eaedff]">
              <div>
                <span className="font-bold text-[#131b2e]">Location de Kits Solaires</span>
                <p className="text-[11px] text-[#404940]">Kits de pompage en location pour maraîchers</p>
              </div>
              <span className="font-bold text-[#004c22]">15 000 FCFA / mois</span>
            </div>
          </div>
        </div>
      </section>

      {/* Illustration champ & capteur IoT en Côte d'Ivoire */}
      <section className="relative rounded-2xl overflow-hidden shadow-xs h-36 border border-[#eaedff]">
        <img
          className="w-full h-full object-cover"
          alt="Transmetteur GSM Nafama"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuChMbHJbGHnt4wXr-C60OpH-alpDXhR2EGc2cMc2kmE7MJh4J7yDTNpyEt279OCVFNQUjVuZ3vACZ1hLR1aZ1VyyCtDGz7JHmPi8959fPBJz8MeLi3B2mEvfXaMSAXWCliK-kaOdPjQucooUsp-5eO4BY6H41xzy9JWp6D2RMDfetpnZKyxZLWmOKk9Yx8zCvSyUHWPVig_YEQHRPPS8CkJ5MmZ-ebwwvxfqVdOl7-rbpID6DmrbOz4NA"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#283044]/90 via-[#283044]/30 to-transparent flex flex-col justify-end p-4 text-white">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#ffddb8]">
            <span className="material-symbols-outlined text-[16px]">cell_tower</span>
            <span>Transmetteur GSM Nafama-Link</span>
          </div>
          <p className="text-sm font-bold leading-tight mt-0.5">
            Opérationnel même sans connexion 4G
          </p>
        </div>
      </section>

      {/* Section Configuration Détaillée des SMS */}
      <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#a6f4b5] flex items-center justify-center text-[#00210b]">
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#131b2e]">Paramètres des SMS Reçus</h3>
              <p className="text-xs text-[#404940]">Activez ou ajustez selon vos priorités</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3.5 mt-2">
          {smsSettings.map((setting) => (
            <div key={setting.id} className="flex items-start justify-between gap-3 pb-2.5 border-b border-[#eaedff] last:border-b-0">
              <div className="flex items-start gap-2.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  setting.id === 'sms-pannes'
                    ? 'bg-[#ffdad6] text-[#ba1a1a]'
                    : setting.id === 'sms-meteo'
                    ? 'bg-[#ffddb8] text-[#855300]'
                    : setting.id === 'sms-ventes'
                    ? 'bg-[#c9e6ff] text-[#004565]'
                    : 'bg-[#eaedff] text-[#404940]'
                }`}>
                  <span className="material-symbols-outlined text-[18px]">
                    {setting.id === 'sms-pannes'
                      ? 'warning'
                      : setting.id === 'sms-meteo'
                      ? 'routine'
                      : setting.id === 'sms-ventes'
                      ? 'storefront'
                      : 'psychology'}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#131b2e]">{setting.title}</span>
                    {setting.isOption && (
                      <span className="bg-[#ffddb8] text-[#855300] text-[10px] font-bold px-1.5 rounded">Option</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#404940] leading-snug mt-0.5">
                    {setting.description}
                  </p>
                  <span className="inline-block mt-1 text-[10px] text-[#004c22] font-bold">
                    {setting.priority}
                  </span>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={setting.enabled}
                  onChange={() => toggleSmsSetting(setting.id)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#dae2fd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#004c22]"></div>
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* Section Gestion des Numéros de Réception */}
      <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#131b2e]">Numéros Destinataires (SMS)</h3>
          <span className="text-xs text-[#004c22] font-bold">
            {recipientList.length} / 2 configurés
          </span>
        </div>

        <div className="flex flex-col gap-2 mb-3">
          {recipientList.map((rec) => (
            <div key={rec.id} className="bg-[#f2f3ff] p-3 rounded-xl flex items-center justify-between border border-[#dae2fd]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#a6f4b5] text-[#00210b] flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[16px]">phone_android</span>
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-[#131b2e] flex items-center gap-1.5">
                    <span>{rec.phone}</span>
                    <span className="bg-[#004c22] text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase">
                      {rec.badge}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#404940] truncate">
                    {rec.name} • {rec.operator}
                  </div>
                </div>
              </div>

              {rec.badge !== 'Principal' ? (
                <button
                  type="button"
                  onClick={() => handleDeleteNumber(rec.id)}
                  className="text-[#707a6f] hover:text-[#ba1a1a] p-1"
                >
                  <span className="material-symbols-outlined text-[18px]">delete_outline</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => alert("Modification du numéro principal : contactez votre agence")}
                  className="text-[#707a6f] hover:text-[#004c22] p-1"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Action: Ajouter numéro */}
        {recipientList.length < 5 && (
          <button
            type="button"
            onClick={() => setIsAddNumberOpen(true)}
            className="w-full h-11 rounded-xl bg-[#eaedff] text-[#004c22] text-xs font-bold flex items-center justify-center gap-2 active:scale-98 transition-transform mb-2 hover:bg-[#dae2fd]"
          >
            <span className="material-symbols-outlined text-[18px]">add_call</span>
            <span>Ajouter un numéro d'alerte supplémentaire</span>
          </button>
        )}

        {/* Action Test SMS Immédiat */}
        <button
          type="button"
          onClick={handleSendTestSms}
          disabled={isSendingTest}
          className="w-full h-11 rounded-xl bg-white border border-[#855300] text-[#855300] text-xs font-bold flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-transform hover:bg-[#fea619]/10"
        >
          <span className="material-symbols-outlined text-[18px]">send_to_mobile</span>
          <span>
            {isSendingTest ? 'Envoi du SMS en cours...' : 'Envoyer un SMS test maintenant (Gratuit)'}
          </span>
        </button>

        {testSentSuccess && (
          <div className="mt-2 p-2.5 rounded-xl bg-[#a6f4b5] text-[#00210b] text-xs font-semibold text-center animate-fadeIn">
            ✓ SMS de diagnostic envoyé avec succès aux numéros configurés !
          </div>
        )}
      </section>

      {/* Moyens de paiement & Garanties */}
      <section className="bg-[#f2f3ff] rounded-2xl p-4 border border-[#eaedff]">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-[#004c22] text-[20px]">account_balance_wallet</span>
          <h4 className="text-xs font-bold text-[#131b2e]">Paiements Mobile Money Facilités</h4>
        </div>
        <p className="text-xs text-[#404940] mb-3">
          Réglez mensuellement sans frais cachés par votre portefeuille mobile habituel en Côte d'Ivoire :
        </p>

        {/* Badges Opérateurs */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="bg-white py-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs border border-[#eaedff]">
            <span className="text-[11px] font-black text-[#1DA1F2]">WAVE</span>
            <span className="text-[9px] text-[#404940]">0% frais</span>
          </div>
          <div className="bg-white py-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs border border-[#eaedff]">
            <span className="text-[11px] font-black text-[#FF6600]">ORANGE</span>
            <span className="text-[9px] text-[#404940]">Max It</span>
          </div>
          <div className="bg-white py-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs border border-[#eaedff]">
            <span className="text-[11px] font-black text-[#ca8a04]">MTN</span>
            <span className="text-[9px] text-[#404940]">MoMo</span>
          </div>
          <div className="bg-white py-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs border border-[#eaedff]">
            <span className="text-[11px] font-black text-[#006699]">MOOV</span>
            <span className="text-[9px] text-[#404940]">Money</span>
          </div>
        </div>

        <div className="flex items-start gap-2 pt-1">
          <span className="material-symbols-outlined text-[#004c22] text-[16px] mt-0.5">verified_user</span>
          <p className="text-[11px] text-[#404940]">
            <strong>Sans engagement de durée.</strong> Modifiez votre formule ou stoppez les prélèvements à tout instant d'un clic ou par simple mot-clé SMS au <strong>98024</strong>.
          </p>
        </div>
      </section>

      {/* Support Vocal Localisé & Appel Conseiller */}
      <section className="bg-[#004c22] text-white rounded-2xl p-4 shadow-md flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#166534] flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[22px] text-[#93e0a2]">support_agent</span>
            </div>
            <div>
              <div className="text-xs font-bold">Besoin d'aide pour choisir ?</div>
              <div className="text-[11px] text-[#a6f4b5] leading-tight">
                Écoutez les explications en Baoulé ou Dioula
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handlePlayVocalPlanGuide}
            className="h-9 px-3 rounded-full bg-[#fea619] text-[#684000] text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">play_circle</span>
            <span>Écouter</span>
          </button>
        </div>

        {/* Bouton Appel Direct Conseiller NAFAMA */}
        <a
          href="tel:+2256464843912"
          className="w-full py-2.5 px-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px] text-[#ffddb8]">call</span>
          <span>Joindre le Conseiller NAFAMA : +225 64 64 84 39 12</span>
        </a>
      </section>

      {/* Modal Add Recipient */}
      {isAddNumberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-[#eaedff]">
            <h3 className="text-sm font-bold text-[#131b2e] mb-1">Ajouter un numéro d'alerte</h3>
            <p className="text-xs text-[#404940] mb-3">
              Ce numéro recevra les alertes d'arrêt de pompe et bulletins météo.
            </p>

            <form onSubmit={handleAddNumber} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#404940]">Nom du contact</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Kouamé (Adjoint)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#f2f3ff] rounded-xl px-3 py-2 text-xs text-[#131b2e] focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#404940]">Numéro de téléphone (+225)</label>
                <input
                  type="tel"
                  required
                  placeholder="05 00 00 00 00"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-[#f2f3ff] rounded-xl px-3 py-2 text-xs text-[#131b2e] focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#404940]">Opérateur CI</label>
                <select
                  value={newOperator}
                  onChange={(e) => setNewOperator(e.target.value)}
                  className="w-full bg-[#f2f3ff] rounded-xl px-3 py-2 text-xs text-[#131b2e] focus:outline-none"
                >
                  <option>Orange CI</option>
                  <option>MTN CI</option>
                  <option>Moov Africa CI</option>
                  <option>Wave CI</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddNumberOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#f2f3ff] text-[#404940] text-xs font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#004c22] text-white text-xs font-bold shadow-xs hover:bg-[#166534]"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
