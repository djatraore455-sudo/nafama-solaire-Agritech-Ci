import React, { useState, useEffect } from 'react';
import { LanguageCode } from '../types';
import { VOICE_PROMPTS } from '../data/mockData';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand: (command: string) => void;
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onExecuteCommand,
  currentLang,
  onLanguageChange
}) => {
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const langData = VOICE_PROMPTS[currentLang];

  useEffect(() => {
    if (isOpen) {
      setSpokenText(langData.prompt);
    }
  }, [isOpen, currentLang]);

  if (!isOpen) return null;

  const playSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLang === 'fr' ? 'fr-FR' : 'fr-FR';
      utterance.rate = 0.9;
      setIsPlayingAudio(true);

      utterance.onend = () => {
        setIsPlayingAudio(false);
      };
      utterance.onerror = () => {
        setIsPlayingAudio(false);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleToggleMic = () => {
    if (isListening) {
      setIsListening(false);
      playSpeech("Commande vocale reçue. Action en cours d'exécution.");
    } else {
      setIsListening(true);
      setSpokenText("Écoute en cours... Parlez en Français, Dioula ou Sénoufo");
      setTimeout(() => {
        setIsListening(false);
        setSpokenText("« Démarrer l'arrosage parcelle 2 »");
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div 
        className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#eaedff] flex flex-col gap-4 relative animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#eaedff] pb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fea619] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#855300]"></span>
            </span>
            <span className="text-xs font-bold text-[#855300] uppercase tracking-wider">
              Assistant Vocal NAFAMA IA
            </span>
          </div>
          <button
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-[#f2f3ff] text-[#404940] flex items-center justify-center hover:bg-[#eaedff]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Language Tabs */}
        <div className="flex bg-[#f2f3ff] p-1 rounded-xl justify-between">
          {(['fr', 'dioula', 'senoufo', 'baoule'] as LanguageCode[]).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                onLanguageChange(lang);
                const info = VOICE_PROMPTS[lang];
                playSpeech(info.welcome);
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                currentLang === lang
                  ? 'bg-[#004c22] text-white shadow-xs'
                  : 'text-[#404940] hover:text-[#004c22]'
              }`}
            >
              {VOICE_PROMPTS[lang].label}
            </button>
          ))}
        </div>

        {/* Central Audio / Mic Visualizer */}
        <div className="bg-[#faf8ff] border border-[#dae2fd] rounded-2xl p-5 flex flex-col items-center text-center gap-3">
          <div className="relative">
            {isListening && (
              <div className="absolute inset-0 rounded-full bg-[#fea619]/40 animate-ping"></div>
            )}
            <button
              onClick={handleToggleMic}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 relative z-10 ${
                isListening
                  ? 'bg-[#ba1a1a] text-white animate-pulse'
                  : isPlayingAudio
                  ? 'bg-[#004c22] text-white'
                  : 'bg-[#fea619] text-[#684000]'
              }`}
            >
              <span className="material-symbols-outlined text-[36px]">
                {isListening ? 'graphic_eq' : isPlayingAudio ? 'volume_up' : 'mic'}
              </span>
            </button>
          </div>

          <div>
            <p className="text-base font-bold text-[#131b2e]">{spokenText}</p>
            <p className="text-xs text-[#404940] mt-1">{langData.sub}</p>
          </div>

          {/* Quick Voice Play Trigger */}
          <button
            onClick={() => playSpeech(langData.welcome)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#eaedff] text-[#004c22] rounded-full text-xs font-semibold hover:bg-[#dae2fd] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">play_circle</span>
            <span>Écouter les explications orales</span>
          </button>
        </div>

        {/* Suggested Voice Commands */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-[#404940] uppercase tracking-wider">
            Commandes vocales rapides
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            <button
              onClick={() => {
                onExecuteCommand('toggle_pump');
                playSpeech(langData.pump_on);
                onClose();
              }}
              className="w-full text-left p-2.5 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-xs font-medium text-[#131b2e] flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004c22] text-[18px]">solar_power</span>
                <span>« Activer la pompe solaire »</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-[#707a6f]">chevron_right</span>
            </button>

            <button
              onClick={() => {
                onExecuteCommand('check_sensors');
                playSpeech("Humidité sol à 64%, niveau de cuve à 18 500 litres.");
                onClose();
              }}
              className="w-full text-left p-2.5 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-xs font-medium text-[#131b2e] flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#005e87] text-[18px]">water_drop</span>
                <span>« État de l'eau et capteurs sol »</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-[#707a6f]">chevron_right</span>
            </button>

            <button
              onClick={() => {
                onExecuteCommand('call_tech');
                playSpeech("Mise en relation avec l'assistance technique NAFAMA...");
                onClose();
              }}
              className="w-full text-left p-2.5 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-xs font-medium text-[#131b2e] flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#855300] text-[18px]">support_agent</span>
                <span>« Joindre un technicien certifié »</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-[#707a6f]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
