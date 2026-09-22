import React, { useState } from 'react';

interface SolarSavingsWidgetProps {
  onTriggerSmsNotification?: (message: string) => void;
  solarProductionKw?: number;
  pumpActive?: boolean;
}

export const SolarSavingsWidget: React.FC<SolarSavingsWidgetProps> = ({
  onTriggerSmsNotification,
  solarProductionKw = 4.2,
  pumpActive = true
}) => {
  // Current month reference (defaults to September in current app context, 22 days elapsed)
  const [currentDayOfMonth, setCurrentDayOfMonth] = useState<number>(22);
  const totalDaysInMonth = 30;
  const monthName = 'Septembre 2026';

  // Customizable parameters with default CI market standards
  const [dieselPricePerLiter, setDieselPricePerLiter] = useState<number>(715); // Prix officiel gasoil en CI ~715 FCFA/L
  const [dailyPumpingHours, setDailyPumpingHours] = useState<number>(6.5); // Heures solaires moyennes utiles / jour
  const [dieselConsumptionLitersPerHour, setDieselConsumptionLitersPerHour] = useState<number>(1.4); // Conso groupe 3.5 kW ~1.4L/h
  const [generatorMaintenanceCostPerMonth, setGeneratorMaintenanceCostPerMonth] = useState<number>(15000); // Vidange, filtres, bougies (FCFA/mois)
  const [isCustomizing, setIsCustomizing] = useState<boolean>(false);

  // Calculations for elapsed days in the current month
  const elapsedHours = currentDayOfMonth * dailyPumpingHours;
  const dieselLitersSaved = Math.round(elapsedHours * dieselConsumptionLitersPerHour);
  const fuelSavingsFcfa = Math.round(dieselLitersSaved * dieselPricePerLiter);
  const maintenanceSavingsFcfa = Math.round((generatorMaintenanceCostPerMonth / totalDaysInMonth) * currentDayOfMonth);
  const totalSavingsFcfa = fuelSavingsFcfa + maintenanceSavingsFcfa;

  // Projected savings for full month (30 days)
  const fullMonthHours = totalDaysInMonth * dailyPumpingHours;
  const projectedLiters = Math.round(fullMonthHours * dieselConsumptionLitersPerHour);
  const projectedSavingsFcfa = Math.round(projectedLiters * dieselPricePerLiter + generatorMaintenanceCostPerMonth);

  // Ecological impact (1L diesel ≈ 2.68 kg CO2 eq)
  const co2AvoidedKg = Math.round(dieselLitersSaved * 2.68);

  const handleShareSms = () => {
    if (onTriggerSmsNotification) {
      onTriggerSmsNotification(
        `NAFAMA ÉCONOMIES (${monthName}) : ${totalSavingsFcfa.toLocaleString('fr-FR')} FCFA épargnés grâce au pompage solaire vs groupe électrogène (${dieselLitersSaved} L de gasoil et ${co2AvoidedKg} kg CO2 évités).`
      );
    }
  };

  return (
    <section className="w-full bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff] flex flex-col gap-3.5 relative overflow-hidden">
      {/* Decorative subtle background badge */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#a6f4b5]/20 to-transparent rounded-bl-full pointer-events-none" />

      {/* Header with Icon, Month Badge and Details */}
      <div className="flex items-start justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#004c22] text-[#a6f4b5] flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[24px]">savings</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-extrabold text-[#131b2e]">
                Économies Solaire vs Diesel
              </h2>
              <span className="bg-[#a6f4b5] text-[#00210b] text-[10px] font-black px-1.5 py-0.2 rounded">
                FCFA
              </span>
            </div>
            <p className="text-xs text-[#404940] flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-[#004c22]">
                calendar_month
              </span>
              Mois en cours : <strong>{monthName}</strong> ({currentDayOfMonth}/{totalDaysInMonth}j)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCustomizing(!isCustomizing)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border flex items-center gap-1 ${
            isCustomizing
              ? 'bg-[#004c22] text-white border-[#004c22]'
              : 'bg-[#f2f3ff] text-[#404940] border-[#eaedff] hover:text-[#004c22]'
          }`}
          title="Ajuster les hypothèses de calcul"
        >
          <span className="material-symbols-outlined text-[14px]">tune</span>
          <span>{isCustomizing ? 'Fermer' : 'Ajuster'}</span>
        </button>
      </div>

      {/* Big Hero Savings Metric Card */}
      <div className="w-full bg-gradient-to-br from-[#f2fdf5] via-[#e8f8ed] to-[#d6f5df] rounded-2xl p-4 border border-[#a6f4b5]/60 shadow-xs flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#004c22] uppercase tracking-wide flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            Économies nettes cumulées ce mois
          </span>
          <span className="text-[10px] bg-white/80 backdrop-blur-xs text-[#004c22] font-extrabold px-2 py-0.5 rounded-full border border-[#a6f4b5]">
            +100% Solaire
          </span>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl sm:text-4xl font-black text-[#004c22] tracking-tight">
            {totalSavingsFcfa.toLocaleString('fr-FR')}
          </span>
          <span className="text-sm sm:text-base font-extrabold text-[#004c22]">
            FCFA
          </span>
        </div>

        {/* Progress Bar of Month Elapsed & Projection */}
        <div className="flex flex-col gap-1 pt-1">
          <div className="w-full bg-white/80 rounded-full h-2 overflow-hidden border border-[#a6f4b5]">
            <div
              className="bg-[#004c22] h-full rounded-full transition-all duration-500"
              style={{ width: `${(currentDayOfMonth / totalDaysInMonth) * 100}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-[#404940]">
            <span>Réalisé au {currentDayOfMonth}e jour</span>
            <span className="font-bold text-[#004c22]">
              Projection fin de mois : ~{projectedSavingsFcfa.toLocaleString('fr-FR')} FCFA
            </span>
          </div>
        </div>
      </div>

      {/* 3 Detail KPI Cards (Gasoil, Entretien, Écologie) */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#f2f3ff] rounded-xl p-2.5 border border-[#dae2fd] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#404940]">
            <span className="text-[10px] font-bold">Gasoil évité</span>
            <span className="material-symbols-outlined text-[15px] text-[#855300]">
              local_gas_station
            </span>
          </div>
          <div className="mt-1">
            <span className="text-sm font-extrabold text-[#131b2e] block">
              {dieselLitersSaved} L
            </span>
            <span className="text-[10px] text-[#855300] font-semibold">
              {fuelSavingsFcfa.toLocaleString('fr-FR')} F
            </span>
          </div>
        </div>

        <div className="bg-[#f2f3ff] rounded-xl p-2.5 border border-[#dae2fd] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#404940]">
            <span className="text-[10px] font-bold">Maintenance</span>
            <span className="material-symbols-outlined text-[15px] text-[#005e87]">
              build
            </span>
          </div>
          <div className="mt-1">
            <span className="text-sm font-extrabold text-[#131b2e] block">
              0 F
            </span>
            <span className="text-[10px] text-[#005e87] font-semibold">
              +{maintenanceSavingsFcfa.toLocaleString('fr-FR')} F évités
            </span>
          </div>
        </div>

        <div className="bg-[#f2f3ff] rounded-xl p-2.5 border border-[#dae2fd] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#404940]">
            <span className="text-[10px] font-bold">CO₂ évité</span>
            <span className="material-symbols-outlined text-[15px] text-[#004c22]">
              eco
            </span>
          </div>
          <div className="mt-1">
            <span className="text-sm font-extrabold text-[#004c22] block">
              {co2AvoidedKg} kg
            </span>
            <span className="text-[10px] text-[#004c22] font-semibold">
              Air pur Poro
            </span>
          </div>
        </div>
      </div>

      {/* Visual Comparison: Solaire vs Groupe Diesel */}
      <div className="bg-[#fafbff] rounded-xl p-3 border border-[#eaedff] flex flex-col gap-2 text-xs">
        <span className="text-[10px] font-bold text-[#707a6f] uppercase tracking-wider">
          Comparatif direct dépenses d'exploitation ({monthName})
        </span>

        {/* Solaire line */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#004c22]" />
            <span className="font-bold text-[#131b2e]">Pompage NAFAMA Solaire</span>
          </div>
          <span className="font-extrabold text-[#004c22] bg-[#a6f4b5]/40 px-2 py-0.5 rounded-md">
            0 FCFA (Carburant gratuit)
          </span>
        </div>

        {/* Diesel line */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]" />
            <span className="font-medium text-[#404940]">Groupe Électrogène Diesel</span>
          </div>
          <span className="font-extrabold text-[#ba1a1a] line-through">
            {totalSavingsFcfa.toLocaleString('fr-FR')} FCFA
          </span>
        </div>
      </div>

      {/* Interactive Customization Drawer */}
      {isCustomizing && (
        <div className="bg-[#f2f3ff] rounded-xl p-3.5 border border-[#dae2fd] text-xs flex flex-col gap-3 animate-fadeIn">
          <div className="flex items-center justify-between pb-1 border-b border-[#dae2fd]">
            <span className="font-bold text-[#131b2e] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#004c22]">settings</span>
              Paramètres de l'exploitation agricole (CI)
            </span>
            <button
              type="button"
              onClick={() => {
                setDieselPricePerLiter(715);
                setDailyPumpingHours(6.5);
                setDieselConsumptionLitersPerHour(1.4);
                setGeneratorMaintenanceCostPerMonth(15000);
                setCurrentDayOfMonth(22);
              }}
              className="text-[10px] text-[#004c22] font-bold hover:underline"
            >
              Réinitialiser
            </button>
          </div>

          {/* Slider 1: Prix du Gasoil FCFA / L */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-[#404940]">
              <span>Prix du Gasoil en station CI :</span>
              <strong className="text-[#131b2e] font-extrabold">{dieselPricePerLiter} FCFA / L</strong>
            </div>
            <input
              type="range"
              min="650"
              max="900"
              step="5"
              value={dieselPricePerLiter}
              onChange={(e) => setDieselPricePerLiter(Number(e.target.value))}
              className="w-full accent-[#004c22] cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-[#707a6f]">
              <span>650 FCFA</span>
              <span>715 FCFA (Officiel)</span>
              <span>900 FCFA</span>
            </div>
          </div>

          {/* Slider 2: Heures de pompage solaire / jour */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-[#404940]">
              <span>Pompage solaire journalier :</span>
              <strong className="text-[#131b2e] font-extrabold">{dailyPumpingHours} h / jour</strong>
            </div>
            <input
              type="range"
              min="2"
              max="10"
              step="0.5"
              value={dailyPumpingHours}
              onChange={(e) => setDailyPumpingHours(Number(e.target.value))}
              className="w-full accent-[#004c22] cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-[#707a6f]">
              <span>2 h/j</span>
              <span>6.5 h/j (Moyenne Poro)</span>
              <span>10 h/j</span>
            </div>
          </div>

          {/* Slider 3: Consommation équivalente du groupe L/h */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-[#404940]">
              <span>Consommation groupe diesel :</span>
              <strong className="text-[#131b2e] font-extrabold">{dieselConsumptionLitersPerHour} L / heure</strong>
            </div>
            <input
              type="range"
              min="0.8"
              max="3.0"
              step="0.1"
              value={dieselConsumptionLitersPerHour}
              onChange={(e) => setDieselConsumptionLitersPerHour(Number(e.target.value))}
              className="w-full accent-[#004c22] cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-[#707a6f]">
              <span>0.8 L/h (Petite pompe)</span>
              <span>1.4 L/h (3.5 kW)</span>
              <span>3.0 L/h (Grande pompe)</span>
            </div>
          </div>

          {/* Slider 4: Jours écoulés dans le mois */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-[#404940]">
              <span>Jour du mois en cours :</span>
              <strong className="text-[#131b2e] font-extrabold">{currentDayOfMonth} / 30 jours</strong>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={currentDayOfMonth}
              onChange={(e) => setCurrentDayOfMonth(Number(e.target.value))}
              className="w-full accent-[#004c22] cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Action footer: Trigger SMS Summary */}
      <div className="flex items-center justify-between pt-1 border-t border-[#f2f3ff]">
        <span className="text-[11px] text-[#707a6f] flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px] text-[#004c22]">verified</span>
          Rentabilité constatée : <strong>Amorti</strong>
        </span>

        <button
          type="button"
          onClick={handleShareSms}
          className="text-xs font-bold text-[#004c22] hover:text-[#166534] flex items-center gap-1 bg-[#f2fdf5] hover:bg-[#e8f8ed] px-3 py-1.5 rounded-lg border border-[#a6f4b5] active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[15px]">sms</span>
          <span>Recevoir le bilan SMS</span>
        </button>
      </div>
    </section>
  );
};
