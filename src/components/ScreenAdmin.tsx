import React, { useState } from 'react';
import { HarvestLot, TechnicalAlert, TransactionRecord, ScreenId, UserAccount } from '../types';
import { INITIAL_HARVEST_LOTS, INITIAL_TECHNICAL_ALERTS, INITIAL_TRANSACTIONS } from '../data/mockData';

interface ScreenAdminProps {
  onNavigate: (screen: ScreenId) => void;
  onTriggerSmsNotification: (message: string) => void;
  currentUser?: UserAccount;
  onElevateToAdmin?: () => void;
}

export const ScreenAdmin: React.FC<ScreenAdminProps> = ({
  onNavigate,
  onTriggerSmsNotification,
  currentUser,
  onElevateToAdmin
}) => {
  const [harvestLots, setHarvestLots] = useState<HarvestLot[]>(INITIAL_HARVEST_LOTS);
  const [techAlerts, setTechAlerts] = useState<TechnicalAlert[]>(INITIAL_TECHNICAL_ALERTS);
  const [transactions, setTransactions] = useState<TransactionRecord[]>(INITIAL_TRANSACTIONS);

  // Admin access unlock form states
  const [adminUnlockKey, setAdminUnlockKey] = useState('');
  const [keyError, setKeyError] = useState<string | null>(null);

  // Modals
  const [selectedAlertForAssign, setSelectedAlertForAssign] = useState<TechnicalAlert | null>(null);
  const [technicianName, setTechnicianName] = useState('Koffi Kouamé (Base Bouaké)');
  const [reportGenerated, setReportGenerated] = useState(false);

  // Access Control Guard: Only Principal Admin can view this screen
  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex flex-col w-full px-4 pb-24 pt-6 gap-5 max-w-md mx-auto">
        <div className="bg-white rounded-3xl p-6 border border-[#ffdad6] shadow-sm flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mb-3 shadow-xs">
            <span className="material-symbols-outlined text-[32px]">admin_panel_settings</span>
          </div>

          <span className="text-[10px] font-bold uppercase tracking-wider text-[#ba1a1a] bg-[#fff8f6] px-2.5 py-1 rounded-full border border-[#ffdad6]">
            Accès Strictement Restreint
          </span>

          <h2 className="text-xl font-black text-[#131b2e] mt-3">
            Espace Administrateur Principal
          </h2>

          <p className="text-xs text-[#404940] mt-2 leading-relaxed">
            Seul l'<strong>Administrateur Principal NAFAMA</strong> est autorisé à accéder à la supervision nationale, l'arbitrage des transactions Mobile Money et l'affectation des techniciens.
          </p>

          <div className="w-full mt-4 p-3 rounded-2xl bg-[#f2f3ff] border border-[#dae2fd] text-left">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#131b2e]">
              <span className="material-symbols-outlined text-[18px] text-[#004c22]">account_circle</span>
              <span>Compte actuellement connecté :</span>
            </div>
            <p className="text-xs text-[#404940] mt-1 pl-6">
              {currentUser?.prenom} {currentUser?.nom} • Statut : <strong className="capitalize text-[#004c22]">
                {currentUser?.role === 'producer' ? 'Producteur Agricole' : currentUser?.role === 'technician' ? 'Technicien Maintenance' : currentUser?.role === 'buyer' ? 'Acheteur' : 'Utilisateur'}
              </strong>
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const validKeys = ['ADMIN2026', 'ADMIN', '0000', '9999'];
              if (validKeys.includes(adminUnlockKey.trim().toUpperCase())) {
                setKeyError(null);
                onElevateToAdmin?.();
                onTriggerSmsNotification("Droits Administrateur Principal accordés avec succès.");
              } else {
                setKeyError("Clé de sécurité administrateur incorrecte. Entrez le code secret valide (ex: ADMIN2026).");
              }
            }}
            className="w-full flex flex-col gap-3 mt-4"
          >
            <div className="flex flex-col gap-1 text-left">
              <label className="text-xs font-bold text-[#131b2e]">
                Déverrouiller avec la clé administrateur :
              </label>
              <div className="flex items-center bg-[#f2f3ff] rounded-xl px-3 py-2.5 border border-[#eaedff]">
                <span className="material-symbols-outlined text-[#707a6f] text-[18px] mr-2">key</span>
                <input
                  type="password"
                  value={adminUnlockKey}
                  onChange={(e) => setAdminUnlockKey(e.target.value)}
                  placeholder="Clé secrète (ex: ADMIN2026)"
                  className="w-full bg-transparent text-xs font-bold tracking-widest text-[#131b2e] focus:outline-none"
                />
              </div>
              {keyError && (
                <p className="text-[11px] font-semibold text-[#ba1a1a] mt-1">{keyError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-[#ba1a1a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all hover:bg-[#93000a]"
            >
              <span className="material-symbols-outlined text-[18px]">lock_open</span>
              <span>Déverrouiller l'Espace Superviseur</span>
            </button>
          </form>

          <button
            type="button"
            onClick={() => onNavigate(currentUser?.role === 'buyer' ? 'marche' : 'solaire')}
            className="w-full h-11 rounded-xl bg-[#eaedff] text-[#004c22] font-bold text-xs flex items-center justify-center gap-1.5 mt-2 hover:bg-[#dae2fd] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Retour à mon espace ({currentUser?.role === 'technician' ? 'Technicien' : currentUser?.role === 'buyer' ? 'Marché Vivrier' : 'Solaire IoT'})</span>
          </button>
        </div>
      </div>
    );
  }

  const handleApproveLot = (id: string, name: string) => {
    setHarvestLots((prev) => prev.filter((lot) => lot.id !== id));
    onTriggerSmsNotification(`Lot certifié : "${name}" publié avec succès sur le Marché NAFAMA.`);
  };

  const handleRejectLot = (id: string, name: string) => {
    setHarvestLots((prev) => prev.filter((lot) => lot.id !== id));
    onTriggerSmsNotification(`Lot "${name}" renvoyé au producteur pour calibrage.`);
  };

  const handleAssignTechnician = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlertForAssign) return;

    setTechAlerts((prev) =>
      prev.map((a) =>
        a.id === selectedAlertForAssign.id
          ? { ...a, assignedTo: technicianName, severity: 'warning', tag: 'Assigné' }
          : a
      )
    );
    onTriggerSmsNotification(
      `Technicien ${technicianName} dépêché sur l'équipement : ${selectedAlertForAssign.title}`
    );
    setSelectedAlertForAssign(null);
  };

  const handleValidatePendingTx = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'valide' } : t))
    );
    onTriggerSmsNotification("Règlement MTN MoMo validé et débloqué sur le compte coopératif.");
  };

  const handleDownloadReport = () => {
    setReportGenerated(true);
    setTimeout(() => {
      onTriggerSmsNotification("Rapport d'activité nationale NAFAMA CI (Octobre 2025) exporté.");
      setReportGenerated(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col w-full px-4 pb-24 pt-2 gap-4 max-w-md mx-auto">
      {/* Overview Header */}
      <div className="flex flex-col pt-1">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#855300]">
                Supervision Nationale CI
              </span>
              <span className="text-[9px] font-extrabold bg-[#ffdad6] text-[#ba1a1a] px-2 py-0.5 rounded-full border border-[#ffdad6]">
                Superviseur Principal
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#131b2e]">Espace Administration</h2>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e2e7ff] text-[#004c22] text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#004c22] animate-pulse"></span>
            <span>Système Stable</span>
          </div>
        </div>
        <p className="text-xs text-[#404940] mt-1 leading-snug">
          Connecté : <strong>{currentUser?.prenom} {currentUser?.nom}</strong> ({currentUser?.phone || '+225 07 58 42 19 80'}). Pilotage global du parc de pompes, certification des récoltes et arbitrage Mobile Money.
        </p>
      </div>

      {/* Key Metrics Bento Row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white p-3 rounded-2xl shadow-xs border border-[#eaedff] flex flex-col items-center text-center">
          <div className="w-9 h-9 rounded-full bg-[#a6f4b5] flex items-center justify-center text-[#004c22] mb-1">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              solar_power
            </span>
          </div>
          <span className="text-xl font-black text-[#004c22] leading-tight">142</span>
          <span className="text-[10px] text-[#404940] mt-0.5 leading-tight">Pompes IoT Actives</span>
        </div>

        <div className="bg-white p-3 rounded-2xl shadow-xs border border-[#eaedff] flex flex-col items-center text-center">
          <div className="w-9 h-9 rounded-full bg-[#ffddb8] flex items-center justify-center text-[#855300] mb-1">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              nature_people
            </span>
          </div>
          <span className="text-xl font-black text-[#131b2e] leading-tight">380</span>
          <span className="text-[10px] text-[#404940] mt-0.5 leading-tight">Producteurs</span>
        </div>

        <div className="bg-white p-3 rounded-2xl shadow-xs border border-[#eaedff] flex flex-col items-center text-center">
          <div className="w-9 h-9 rounded-full bg-[#c9e6ff] flex items-center justify-center text-[#004565] mb-1">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              restaurant
            </span>
          </div>
          <span className="text-xl font-black text-[#004565] leading-tight">85</span>
          <span className="text-[10px] text-[#404940] mt-0.5 leading-tight">Maquis & Restos</span>
        </div>
      </div>

      {/* Financial Cards / Platform Revenues */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#131b2e] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#855300] text-[20px]">payments</span>
            Commissions & Recettes
          </h3>
          <span className="text-[10px] font-bold text-[#855300] bg-[#ffddb8]/60 px-2 py-0.5 rounded-full">
            Ce mois
          </span>
        </div>

        {/* Main Commission Card */}
        <div className="bg-[#004c22] text-white p-4 rounded-2xl shadow-md relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#a6f4b5]/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <span className="text-[10px] font-bold text-[#a6f4b5] uppercase tracking-wider">
                Ventes Agricoles NAFAMA
              </span>
              <div className="text-2xl font-black mt-1">
                2 450 000 <span className="text-sm font-semibold">FCFA</span>
              </div>
              <span className="text-[11px] text-[#8bd79b] flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[15px]">trending_up</span>
                +18.4% vs mois dernier
              </span>
            </div>
            <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <span className="material-symbols-outlined text-[24px] text-[#a6f4b5]">point_of_sale</span>
            </div>
          </div>
        </div>

        {/* Secondary Revenues Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white p-3.5 rounded-2xl shadow-xs border border-[#eaedff] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#404940]">Abonnements (Standard & Premium)</span>
              <span className="material-symbols-outlined text-[18px] text-[#004c22]">sms</span>
            </div>
            <div className="mt-2">
              <div className="text-base font-extrabold text-[#004c22]">
                4 860 000 <span className="text-xs font-normal text-[#404940]">FCFA</span>
              </div>
              <span className="text-[10px] font-semibold text-[#004c22]">90 std (2000F) + 45 prem (5000F)</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl shadow-xs border border-[#eaedff] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#404940]">Location Kits Solaires (15 000F)</span>
              <span className="material-symbols-outlined text-[18px] text-[#855300]">solar_power</span>
            </div>
            <div className="mt-2">
              <div className="text-base font-extrabold text-[#131b2e]">1 800 000 <span className="text-xs font-normal text-[#404940]">FCFA</span></div>
              <span className="text-[10px] font-semibold text-[#855300]">20 kits pompage en location</span>
            </div>
          </div>
        </div>

        {/* Business Model Summary Card from document */}
        <div className="bg-[#f2f3ff] p-3 rounded-2xl border border-[#dae2fd] text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-[#131b2e] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#004c22]">description</span>
              Plan Financier Année 1 (Document NAFAMA)
            </span>
            <span className="font-bold text-[#004c22] bg-[#a6f4b5] px-2 py-0.5 rounded-full text-[10px]">
              Total : 6 960 000 FCFA
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#404940] mt-2">
            <div className="bg-white p-2 rounded-xl border border-[#eaedff]">
              <span className="font-semibold text-[#131b2e]">Commissions 3%</span>: 300 000 F (sur 10M de transactions)
            </div>
            <div className="bg-white p-2 rounded-xl border border-[#eaedff]">
              <span className="font-semibold text-[#131b2e]">Kits 15 000 F/m</span>: 1 800 000 F (20 kits pompage)
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-bold text-[#131b2e] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#004c22] text-[18px]">bolt</span>
          Actions Prioritaires
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setSelectedAlertForAssign(techAlerts[0] || null)}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-[#e2e7ff] hover:bg-[#dae2fd] active:scale-95 transition-all text-center shadow-xs"
          >
            <div className="w-10 h-10 rounded-full bg-[#004c22] flex items-center justify-center text-white shadow-xs">
              <span className="material-symbols-outlined text-[20px]">engineering</span>
            </div>
            <span className="text-[11px] font-bold text-[#131b2e] leading-snug">Affecter Technicien</span>
          </button>

          <button
            type="button"
            onClick={() => onTriggerSmsNotification("Tous les versements coopératifs Wave et Orange Money ont été validés.")}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-[#e2e7ff] hover:bg-[#dae2fd] active:scale-95 transition-all text-center shadow-xs"
          >
            <div className="w-10 h-10 rounded-full bg-[#855300] flex items-center justify-center text-white shadow-xs">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
            </div>
            <span className="text-[11px] font-bold text-[#131b2e] leading-snug">Valider Versement</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadReport}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-[#e2e7ff] hover:bg-[#dae2fd] active:scale-95 transition-all text-center shadow-xs"
          >
            <div className="w-10 h-10 rounded-full bg-[#004565] flex items-center justify-center text-white shadow-xs">
              <span className="material-symbols-outlined text-[20px]">
                {reportGenerated ? 'hourglass_top' : 'file_download'}
              </span>
            </div>
            <span className="text-[11px] font-bold text-[#131b2e] leading-snug">
              {reportGenerated ? 'Génération...' : 'Rapport Activité'}
            </span>
          </button>
        </div>
      </div>

      {/* Urgent Field Alerts & Maintenance */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#131b2e]">Alertes Techniques Urgentes</h3>
            <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] text-[10px] font-bold">
              {techAlerts.length} critiques
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('solaire')}
            className="text-xs font-bold text-[#004c22] hover:underline"
          >
            Tout voir
          </button>
        </div>

        {techAlerts.map((alt) => (
          <div key={alt.id} className="bg-white p-3.5 rounded-2xl shadow-xs border border-[#eaedff] flex flex-col gap-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  alt.severity === 'critical' ? 'bg-[#ba1a1a]/10 text-[#ba1a1a]' : 'bg-[#fea619]/20 text-[#855300]'
                }`}>
                  <span className="material-symbols-outlined text-[22px]">
                    {alt.severity === 'critical' ? 'warning' : 'wifi_off'}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#131b2e]">{alt.title}</h4>
                  <span className="text-[11px] text-[#404940] flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[13px] text-[#ba1a1a]">location_on</span>
                    {alt.location}
                  </span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-md shrink-0 ${
                alt.severity === 'critical' ? 'bg-[#ffdad6] text-[#93000a]' : 'bg-[#ffddb8] text-[#653e00]'
              }`}>
                {alt.tag}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[#eaedff]">
              <div className="flex items-center gap-1.5 text-[#404940] text-[11px]">
                <span className="material-symbols-outlined text-[15px] text-[#855300]">battery_alert</span>
                <span>{alt.metric}</span>
              </div>

              {alt.assignedTo ? (
                <span className="text-[11px] text-[#004c22] font-bold">
                  ✓ {alt.assignedTo}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedAlertForAssign(alt)}
                  className="px-3 py-1.5 bg-[#004c22] text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-transform hover:bg-[#166534]"
                >
                  <span className="material-symbols-outlined text-[15px]">person_add</span>
                  Assigner
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Produce Verification Pipeline */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#131b2e]">Produits en Attente de Validation</h3>
            <p className="text-[11px] text-[#404940]">
              Vérification qualité & calibrage avant publication sur le marché
            </p>
          </div>
          <span className="px-2 py-0.5 bg-[#dae2fd] rounded-full text-[#131b2e] text-[10px] font-bold">
            {harvestLots.length} lots
          </span>
        </div>

        {harvestLots.length === 0 ? (
          <div className="bg-white p-4 rounded-2xl text-center text-xs text-[#404940] border border-[#eaedff]">
            Tous les lots agricoles ont été traités et publiés avec succès !
          </div>
        ) : (
          harvestLots.map((lot) => (
            <div
              key={lot.id}
              className="bg-white p-3.5 rounded-2xl shadow-xs border border-[#eaedff] flex flex-col gap-3"
            >
              <div className="flex gap-3 items-center">
                <img
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#eaedff]"
                  alt={lot.name}
                  src={lot.image}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-[#131b2e] truncate">{lot.name}</h4>
                    <span className="text-xs text-[#004c22] font-black whitespace-nowrap">
                      {lot.quantity}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#404940] truncate mt-0.5">
                    Producteur : {lot.producer}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-[#855300] bg-[#ffddb8]/60 px-2 py-0.5 rounded-full">
                      {lot.tag}
                    </span>
                    <span className="text-[11px] font-bold text-[#131b2e]">
                      {lot.pricePerKg} FCFA/kg
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleApproveLot(lot.id, lot.name)}
                  className="flex-1 h-10 bg-[#004c22] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 active:scale-98 transition-transform hover:bg-[#166534]"
                >
                  <span className="material-symbols-outlined text-[17px]">verified</span>
                  Publier au Marché
                </button>
                <button
                  type="button"
                  onClick={() => handleRejectLot(lot.id, lot.name)}
                  aria-label="Rejeter"
                  className="w-10 h-10 bg-[#e2e7ff] text-[#404940] hover:text-[#ba1a1a] rounded-xl flex items-center justify-center active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mobile Money Settlement Feed */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#131b2e] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#855300] text-[20px]">account_balance_wallet</span>
            Règlements Mobile Money Récents
          </h3>
          <span className="text-xs text-[#004c22] font-bold">Live API</span>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#eaedff] flex flex-col gap-3">
          {transactions.map((tx, idx) => (
            <React.Fragment key={tx.id}>
              {idx > 0 && <div className="h-px bg-[#eaedff] w-full"></div>}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    tx.operator === 'wave'
                      ? 'bg-[#1DC3F4]/20 text-[#0284c7]'
                      : tx.operator === 'orange'
                      ? 'bg-[#FF7900]/20 text-[#ea580c]'
                      : 'bg-[#FFCC00]/25 text-[#ca8a04]'
                  }`}>
                    <span className="material-symbols-outlined text-[18px]">
                      {tx.operator === 'wave' ? 'smartphone' : tx.operator === 'orange' ? 'payments' : 'send_to_mobile'}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#131b2e]">{tx.title}</div>
                    <div className="text-[11px] text-[#404940]">{tx.sender}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-black text-[#004c22]">
                    +{tx.amount.toLocaleString('fr-FR')} F
                  </div>
                  {tx.status === 'valide' ? (
                    <div className="text-[10px] text-[#004c22] font-semibold flex items-center justify-end gap-0.5">
                      <span className="material-symbols-outlined text-[12px]">done_all</span> Validé
                    </div>
                  ) : (
                    <button
                      onClick={() => handleValidatePendingTx(tx.id)}
                      className="text-[10px] text-[#855300] bg-[#ffddb8] px-1.5 py-0.5 rounded font-bold hover:bg-[#fea619]"
                    >
                      Valider
                    </button>
                  )}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Operator Hotline */}
      <div className="p-3.5 rounded-2xl bg-[#ffddb8]/40 border border-[#ffddb8] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[#855300] text-[24px]">support_agent</span>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#131b2e]">Assistance Opérateurs CI</span>
            <span className="text-[11px] text-[#404940]">Canal direct Baoulé, Dioula & Français</span>
          </div>
        </div>
        <a
          href="tel:1301"
          aria-label="Lancer appel opérateur"
          className="w-9 h-9 rounded-full bg-[#855300] text-white flex items-center justify-center shadow-xs active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[18px]">call</span>
        </a>
      </div>

      {/* Technician Assignment Modal */}
      {selectedAlertForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-[#eaedff]">
            <h3 className="text-sm font-bold text-[#131b2e] mb-1">
              Affecter un technicien certifié
            </h3>
            <p className="text-xs text-[#404940] mb-3">
              Intervention d'urgence sur : <strong>{selectedAlertForAssign.title}</strong>
            </p>

            <form onSubmit={handleAssignTechnician} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#404940]">Technicien assigné</label>
                <select
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  className="w-full bg-[#f2f3ff] rounded-xl px-3 py-2 text-xs text-[#131b2e] focus:outline-none"
                >
                  <option>Koffi Kouamé (Base Bouaké - 18 min)</option>
                  <option>Diallo Souleymane (Base Korhogo - 35 min)</option>
                  <option>Ouattara Moussa (Équipe Mobile Poro)</option>
                </select>
              </div>

              <div className="p-2.5 rounded-xl bg-[#f2f3ff] text-[11px] text-[#404940]">
                Un ordre de mission et les coordonnées GPS de la vanne lui seront transmis par SMS automatique.
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedAlertForAssign(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#f2f3ff] text-[#404940] text-xs font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#004c22] text-white text-xs font-bold shadow-xs hover:bg-[#166534]"
                >
                  Dépêcher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
