import React, { useState } from 'react';
import { TelemetryData, LanguageCode, ScreenId } from '../types';
import { VOICE_PROMPTS } from '../data/mockData';
import { SolarProductionChart } from './SolarProductionChart';
import { SolarSavingsWidget } from './SolarSavingsWidget';
import { LocalWeatherCard } from './LocalWeatherCard';

interface ScreenSolaireProps {
  telemetry: TelemetryData;
  onTogglePump: () => void;
  onNavigate: (screen: ScreenId) => void;
  onOpenVoice: () => void;
  onTriggerSmsNotification: (message: string) => void;
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}

export const ScreenSolaire: React.FC<ScreenSolaireProps> = ({
  telemetry,
  onTogglePump,
  onNavigate,
  onOpenVoice,
  onTriggerSmsNotification,
  currentLang,
  onLanguageChange
}) => {
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [activeSensor, setActiveSensor] = useState<'S1' | 'S2' | 'S3' | null>(null);

  const langInfo = VOICE_PROMPTS[currentLang];

  const handleMicClick = () => {
    setIsListeningVoice(!isListeningVoice);
    if (!isListeningVoice) {
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance("Microphone activé. Écoute de votre commande agricole...");
        u.lang = 'fr-FR';
        window.speechSynthesis.speak(u);
      }
      setTimeout(() => {
        setIsListeningVoice(false);
      }, 3500);
    }
  };

  const handleSpeakAudioHelp = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(langInfo.prompt + ". " + langInfo.welcome);
      u.lang = 'fr-FR';
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  const handleLocateValve = () => {
    setActiveSensor('S3');
    onTriggerSmsNotification("Vanne Secteur Est localisée à la borne 3 (Parcelle Korhogo). Pression : 0.2 Bar.");
  };

  return (
    <div className="flex flex-col w-full px-4 pb-24 pt-2 gap-4 max-w-md mx-auto">
      {/* Voice Assistant Banner / Language Selector */}
      <section className="w-full bg-[#e2e7ff] rounded-2xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fea619] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#855300]"></span>
            </span>
            <span className="text-xs font-bold text-[#855300] uppercase tracking-wider">
              Assistant Vocal NAFAMA IA
            </span>
          </div>

          {/* Language Pill Selector */}
          <div className="flex bg-white rounded-full p-0.5 gap-0.5 shadow-xs">
            {(['fr', 'dioula', 'senoufo'] as LanguageCode[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => onLanguageChange(lang)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                  currentLang === lang
                    ? 'bg-[#004c22] text-white shadow-xs'
                    : 'text-[#404940] hover:text-[#004c22]'
                }`}
              >
                {lang === 'fr' ? 'FR' : lang === 'dioula' ? 'Dioula' : 'Sénoufo'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white rounded-xl p-2.5 shadow-sm">
          <button
            type="button"
            onClick={handleMicClick}
            aria-label="Appuyer pour parler"
            className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md active:scale-95 transition-all ${
              isListeningVoice
                ? 'bg-[#ba1a1a] text-white animate-pulse'
                : 'bg-[#fea619] text-[#684000]'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">
              {isListeningVoice ? 'graphic_eq' : 'mic'}
            </span>
          </button>

          <div className="flex-1 min-w-0" onClick={onOpenVoice}>
            <p className="text-sm font-bold text-[#131b2e] truncate cursor-pointer hover:text-[#004c22]">
              {isListeningVoice ? "Écoute en cours..." : langInfo.prompt}
            </p>
            <p className="text-xs text-[#404940] truncate">
              {isListeningVoice ? "Parlez maintenant" : langInfo.sub}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSpeakAudioHelp}
            aria-label="Écouter l'aide"
            className="w-8 h-8 rounded-full bg-[#e2e7ff] hover:bg-[#dae2fd] flex items-center justify-center text-[#004c22] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">volume_up</span>
          </button>
        </div>
      </section>

      {/* Realtime IoT Telemetry Bento Card */}
      <section className="w-full bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#004c22] animate-pulse"></span>
            <h2 className="text-base font-bold text-[#131b2e]">Centrale Solaire & Puits</h2>
          </div>
          <span className="text-[11px] bg-[#a6f4b5] text-[#00210b] px-2.5 py-1 rounded-full font-bold">
            {telemetry.solarProductionKw} kW EN PRODUCTION
          </span>
        </div>

        {/* Telemetry 4-Pillar Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Solar Production */}
          <div className="bg-[#f2f3ff] rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#404940]">Ensoleillement</span>
              <span className="material-symbols-outlined text-[#855300] text-[20px]">sunny</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-[#131b2e]">{telemetry.sunlightPercent}</span>
              <span className="text-xs font-semibold text-[#404940]">%</span>
            </div>
            <div className="w-full bg-[#dae2fd] rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-[#fea619] h-full rounded-full transition-all duration-500"
                style={{ width: `${telemetry.sunlightPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Battery Pack Status */}
          <div className="bg-[#f2f3ff] rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#404940]">Batterie Lithium</span>
              <span className="material-symbols-outlined text-[#004c22] text-[20px]">battery_charging_full</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-[#131b2e]">{telemetry.batteryPercent}</span>
              <span className="text-xs font-semibold text-[#404940]">%</span>
            </div>
            <div className="w-full bg-[#dae2fd] rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-[#004c22] h-full rounded-full transition-all duration-500"
                style={{ width: `${telemetry.batteryPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Pump Flow Rate */}
          <div className="bg-[#f2f3ff] rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#404940]">Débit Pompe</span>
              <span className="material-symbols-outlined text-[#005e87] text-[20px]">water_drop</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-[#131b2e]">
                {telemetry.pumpActive ? telemetry.pumpFlowM3h : '0.0'}
              </span>
              <span className="text-xs font-semibold text-[#404940]">m³/h</span>
            </div>
            <span className="text-[11px] font-semibold text-[#005e87] mt-1">
              {telemetry.pumpActive ? `Pression ${telemetry.pumpPressureBar} bars` : 'En veille'}
            </span>
          </div>

          {/* Soil Humidity Sensor Average */}
          <div className="bg-[#f2f3ff] rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#404940]">Humidité Sol</span>
              <span className="material-symbols-outlined text-[#004c22] text-[20px]">eco</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-[#131b2e]">{telemetry.soilHumidityPercent}</span>
              <span className="text-xs font-semibold text-[#404940]">%</span>
            </div>
            <span className="text-[11px] font-semibold text-[#004c22] mt-1">Zone Optimale</span>
          </div>
        </div>

        {/* Primary Smart Pump Controller Switch */}
        <div className="bg-[#eaedff] rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              telemetry.pumpActive ? 'bg-[#166534] text-[#93e0a2]' : 'bg-[#bfc9bd] text-white'
            }`}>
              <span className={`material-symbols-outlined text-[22px] ${telemetry.pumpActive ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }}>
                mode_fan
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#131b2e]">Pompe Immergée P-01</span>
              <span className={`text-[11px] font-bold ${telemetry.pumpActive ? 'text-[#004c22]' : 'text-[#707a6f]'}`}>
                {telemetry.pumpActive ? 'EN SERVICE - SOLAIRE DIRECT' : 'ARRÊTÉE MANUELLEMENT'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onTogglePump();
              onTriggerSmsNotification(
                telemetry.pumpActive 
                  ? "Pompe P-01 arrêtée manuellement. Débit 0 m3/h." 
                  : "Pompe P-01 démarrée en alimentation solaire directe. Débit 14.2 m3/h."
              );
            }}
            aria-label="Basculer la pompe"
            className={`w-16 h-9 rounded-full p-1 flex items-center transition-all shadow-inner ${
              telemetry.pumpActive ? 'bg-[#004c22] justify-end' : 'bg-[#707a6f] justify-start'
            }`}
          >
            <span className="w-7 h-7 rounded-full bg-white shadow-md block transform transition-transform"></span>
          </button>
        </div>
      </section>

      {/* 24-Hour Solar Production Line Chart with Recharts */}
      <SolarProductionChart
        currentProductionKw={telemetry.solarProductionKw}
        onTriggerSmsNotification={onTriggerSmsNotification}
      />

      {/* Local Weather & 3-Day Sunshine Forecast API Card */}
      <LocalWeatherCard
        onTriggerSmsNotification={onTriggerSmsNotification}
      />

      {/* Monthly Financial Savings vs Diesel Generator Widget */}
      <SolarSavingsWidget
        onTriggerSmsNotification={onTriggerSmsNotification}
        solarProductionKw={telemetry.solarProductionKw}
        pumpActive={telemetry.pumpActive}
      />

      {/* Active Farm Incident Alert */}
      {!alertDismissed && (
        <section className="w-full bg-[#ffdad6] text-[#93000a] rounded-2xl p-4 shadow-sm flex items-start gap-3 border border-[#ffdad6]">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#ba1a1a] flex-shrink-0 mt-0.5 shadow-xs">
            <span className="material-symbols-outlined text-[20px]">warning</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#93000a]">Alerte Fuite & Filtre Poro</h3>
              <span className="text-[10px] text-[#ba1a1a] bg-white px-2 py-0.5 rounded-full font-bold">
                URGENT
              </span>
            </div>
            <p className="text-xs text-[#93000a] mt-1 leading-snug">
              Baisse anormale de pression détectée sur la vanne secteur Est (Parcelle 3). Tamis d'aspiration à décrasser.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={handleLocateValve}
                className="bg-[#ba1a1a] text-white text-xs px-3 py-1.5 rounded-lg font-bold shadow-xs active:scale-95 transition-transform"
              >
                Localiser vanne
              </button>
              <button
                type="button"
                onClick={() => setAlertDismissed(true)}
                className="bg-white text-[#93000a] text-xs px-3 py-1.5 rounded-lg active:scale-95 transition-transform font-medium"
              >
                Ignorer 30m
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Interactive Map: Korhogo Agricultural Parcel & Sensors */}
      <section className="w-full bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#131b2e]">Parcelle Korhogo - Secteur Poro</h2>
            <p className="text-xs text-[#404940]">4.5 Hectares • Maraîchage & Maïs</p>
          </div>
          <div className="flex items-center gap-1 bg-[#e2e7ff] px-2.5 py-1 rounded-full">
            <span className="material-symbols-outlined text-[#004c22] text-[16px]">sensors</span>
            <span className="text-xs text-[#004c22] font-bold">6 Capteurs LoRa</span>
          </div>
        </div>

        {/* Map View Container */}
        <div
          className="w-full h-44 rounded-xl relative overflow-hidden bg-cover bg-center shadow-inner flex flex-col justify-between p-3 border border-[#eaedff]"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDd-9TJ26ANjpAOG6VVU7HIozqyL1ARWFT2mWnazFa_BN2fzNU-XB9xJk5lWZXPBjKKOzPzwjigjB7xrkoU0oVJtiBh3IvhcxT2zZ5g0AQO6PtFBQY5_pbIbMPJXdxtI17BfvY6NP7phW05W24gwN-GLwhoHwK7-nEBLJpGer41olWE9y4W_Jfc8cmv6JoDG8LHsLPMTi5xDJNsDforZJmiznpGJsDf0Mv69ySaLQ0wxoRwi6HLA2UWUg')`
          }}
        >
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#283044]/80 via-transparent to-[#283044]/40 pointer-events-none"></div>

          {/* Top Overlay Chips */}
          <div className="relative z-10 flex items-center justify-between w-full">
            <span className="bg-white/95 backdrop-blur-md text-[#131b2e] text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-[#855300] text-[14px]">my_location</span>
              Lat 9.458° N, Long 5.629° W
            </span>
            <span className="bg-[#004c22] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-xs">
              Irrigation Programmée 17h00
            </span>
          </div>

          {/* Soil Sensor Pins Overlay */}
          <div className="relative z-10 flex items-center justify-around w-full px-2">
            <button
              type="button"
              onClick={() => setActiveSensor('S1')}
              className={`flex flex-col items-center group transition-transform ${activeSensor === 'S1' ? 'scale-110' : ''}`}
            >
              <div className="w-8 h-8 rounded-full bg-[#004c22] text-white flex items-center justify-center text-xs font-bold shadow-md ring-2 ring-white">
                S1
              </div>
              <span className="text-[11px] text-white font-bold drop-shadow mt-0.5">68%</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSensor('S2')}
              className={`flex flex-col items-center group transition-transform ${activeSensor === 'S2' ? 'scale-110' : ''}`}
            >
              <div className="w-8 h-8 rounded-full bg-[#fea619] text-[#2a1700] flex items-center justify-center text-xs font-bold shadow-md ring-2 ring-white">
                S2
              </div>
              <span className="text-[11px] text-white font-bold drop-shadow mt-0.5">52%</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSensor('S3')}
              className={`flex flex-col items-center group transition-transform ${activeSensor === 'S3' ? 'scale-110' : ''}`}
            >
              <div className="w-8 h-8 rounded-full bg-[#ba1a1a] text-white flex items-center justify-center text-xs font-bold shadow-md ring-2 ring-white animate-bounce">
                S3
              </div>
              <span className="text-[11px] text-white font-bold drop-shadow mt-0.5">31%</span>
            </button>
          </div>
        </div>

        {/* Sensor details popup if selected */}
        {activeSensor && (
          <div className="p-2.5 rounded-xl bg-[#f2f3ff] text-xs flex items-center justify-between">
            <span className="text-[#131b2e]">
              Capteur <strong>{activeSensor}</strong> :{' '}
              {activeSensor === 'S1'
                ? 'Secteur Ouest (Tomates) - Humidité 68% (Optimale)'
                : activeSensor === 'S2'
                ? 'Secteur Sud (Maïs) - Humidité 52% (Correcte)'
                : 'Secteur Est (Vanne 3) - Humidité 31% (Basse - Décrassage requis)'}
            </span>
            <button
              onClick={() => setActiveSensor(null)}
              className="text-[#707a6f] hover:text-[#131b2e] ml-2 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Quick Stats Under Map */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-xs text-[#404940]">
            <span className="material-symbols-outlined text-[16px] text-[#005e87]">water</span>
            <span>
              Volume restant cuve :{' '}
              <strong className="text-[#131b2e] font-bold">
                {telemetry.tankRemainingLiters.toLocaleString('fr-FR')} L
              </strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('marche')}
            className="text-xs text-[#004c22] font-bold flex items-center gap-0.5 hover:underline"
          >
            <span>Voir le plan</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      </section>

      {/* Photo Insight of Installation */}
      <section className="w-full bg-white rounded-2xl p-3.5 shadow-sm border border-[#eaedff] flex items-center gap-3">
        <img
          className="w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-xs border border-[#eaedff]"
          alt="Générateur Solaire 12 Panneaux"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQx6BET5JMkUTTVEa48qyMer_5jEyvS3pbWLHMvwpk8VG2jg2DqGDZhmDEqZebulFIWCOBgbZ1AGn8d4R9VA5kMHxnveUYO_Dv1IOWwN1Srjt504D2wxBWsHEffqFbgwlEy_tOhPjNPpyzs8fIqna5NawgdZEaB52SCRKhE9-xhyF47Z1vKOrYogVOiRkR58shyglYrwJiz9-OXBR8wz60Dv9kkI1MH8uS6tsd5daqpSTRH2ttK5gwXg"
        />
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-bold text-[#855300] uppercase tracking-wider">
            État Matériel
          </span>
          <h3 className="text-sm font-bold text-[#131b2e] truncate">
            Générateur Solaire 12 Panneaux
          </h3>
          <p className="text-xs text-[#404940] line-clamp-2 mt-0.5 leading-snug">
            Rendement optimal. Prochaine maintenance préventive dans 14 jours.
          </p>
        </div>
      </section>

      {/* Quick Action & 24/7 Technician Emergency Dispatch */}
      <section className="w-full flex flex-col gap-2.5 pt-1">
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('formules')}
            className="py-3 px-3 bg-[#e2e7ff] rounded-xl text-[#131b2e] flex items-center justify-center gap-2 text-xs font-bold active:scale-95 transition-transform shadow-xs hover:bg-[#dae2fd]"
          >
            <span className="material-symbols-outlined text-[#004c22] text-[20px]">calendar_clock</span>
            <span>Programmer</span>
          </button>

          <button
            type="button"
            onClick={() => onTriggerSmsNotification("Rapport de débit : 142 m3 pompés sur les dernières 24h.")}
            className="py-3 px-3 bg-[#e2e7ff] rounded-xl text-[#131b2e] flex items-center justify-center gap-2 text-xs font-bold active:scale-95 transition-transform shadow-xs hover:bg-[#dae2fd]"
          >
            <span className="material-symbols-outlined text-[#855300] text-[20px]">history</span>
            <span>Journal Débit</span>
          </button>
        </div>

        {/* Emergency Advisor & Technician Direct Call Button */}
        <a
          href="tel:+2256464843912"
          onClick={() => {
            onTriggerSmsNotification("Appel direct du Conseiller Agricole NAFAMA au +225 64 64 84 39 12...");
          }}
          className="w-full min-h-[52px] bg-[#004c22] text-white rounded-xl flex items-center justify-center gap-2 px-4 py-3 shadow-md active:scale-98 transition-all hover:bg-[#166534]"
        >
          <span className="material-symbols-outlined text-[22px] text-[#ffddb8]">support_agent</span>
          <span className="text-sm font-bold">Appeler mon Conseiller (+225 64 64 84 39 12)</span>
        </a>
      </section>
    </div>
  );
};
