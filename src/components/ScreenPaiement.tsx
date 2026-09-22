import React, { useState, useEffect } from 'react';
import { CartItem, DeliveryMode, MomoOperator, ScreenId, UserAccount } from '../types';
import { PaymentHistorySection, PaymentHistoryRecord } from './PaymentHistorySection';

interface ScreenPaiementProps {
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onNavigate: (screen: ScreenId) => void;
  onTriggerSmsNotification: (message: string) => void;
  currentUser?: UserAccount;
}

export const ScreenPaiement: React.FC<ScreenPaiementProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onNavigate,
  onTriggerSmsNotification,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'checkout' | 'historique'>('checkout');
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('express');
  const [selectedLocation, setSelectedLocation] = useState('Maquis & Restaurant (Cocody Angré, Abidjan)');
  const [selectedOperator, setSelectedOperator] = useState<MomoOperator>('wave');
  const [momoPhone, setMomoPhone] = useState(currentUser?.phone || '07 58 42 19 80');

  // Active user data
  const effectiveUser: UserAccount = currentUser || {
    nom: 'Koné',
    prenom: 'Ibrahim',
    phone: '07 58 42 19 80',
    location: 'Korhogo',
    pin: '2025',
    isLoggedIn: true
  };

  // Seed simulated transaction history tailored to user data
  const [historyList, setHistoryList] = useState<PaymentHistoryRecord[]>(() => {
    return [
      {
        id: 'tx-hist-1',
        ref: 'CI-NAF-849201',
        title: 'Achat Tomates fraîches & Piments Korhogo (Marché NAFAMA)',
        operator: 'wave',
        amount: 27500,
        status: 'Payé',
        date: '21 Sept 2026, 11:24',
        recipient: 'Coopérative Yêrêflô (Korhogo)',
        userName: `${effectiveUser.prenom} ${effectiveUser.nom}`,
        userPhone: effectiveUser.phone,
        location: effectiveUser.location,
        category: 'Récolte Vivrière',
        paymentType: 'marche'
      },
      {
        id: 'tx-hist-2',
        ref: 'CI-NAF-732918',
        title: 'Abonnement Solaire Formule Standard (Septembre)',
        operator: 'orange',
        amount: 2000,
        status: 'Payé',
        date: '15 Sept 2026, 09:12',
        recipient: 'NAFAMA SOLAIRE CI',
        userName: `${effectiveUser.prenom} ${effectiveUser.nom}`,
        userPhone: effectiveUser.phone,
        location: effectiveUser.location,
        category: 'Abonnement SMS & IoT',
        paymentType: 'abonnement'
      },
      {
        id: 'tx-hist-3',
        ref: 'CI-NAF-619024',
        title: 'Location Mensuelle Kit Pompe Solaire 3.5 kW',
        operator: 'mtn',
        amount: 15000,
        status: 'En attente',
        date: '22 Sept 2026, 08:45',
        recipient: 'Dépôt Technique Régional Korhogo',
        userName: `${effectiveUser.prenom} ${effectiveUser.nom}`,
        userPhone: effectiveUser.phone,
        location: effectiveUser.location,
        category: 'Location Kit Solaire',
        paymentType: 'kit'
      },
      {
        id: 'tx-hist-4',
        ref: 'CI-NAF-503812',
        title: 'Achat Caisse Maïs grain sec séchoir solaire (25 kg)',
        operator: 'moov',
        amount: 6500,
        status: 'Payé',
        date: '08 Sept 2026, 16:30',
        recipient: 'Coopérative Djiboua',
        userName: `${effectiveUser.prenom} ${effectiveUser.nom}`,
        userPhone: effectiveUser.phone,
        location: effectiveUser.location,
        category: 'Récolte Vivrière',
        paymentType: 'marche'
      }
    ];
  });

  // Sync phone if currentUser changes
  useEffect(() => {
    if (currentUser?.phone) {
      setMomoPhone(currentUser.phone);
    }
  }, [currentUser]);

  // Checkout modal states
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinDigits, setPinDigits] = useState('');
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'success'>('idle');
  const [transactionRef, setTransactionRef] = useState('');

  // Calculations (Commission Marché 3% selon document projet KOICA/GENIE)
  const subtotal = cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const deliveryFee = deliveryMode === 'express' ? 5000 : 0;
  const platformFee = Math.round(subtotal * 0.03);
  const total = subtotal + deliveryFee + platformFee;

  const handleStartPayment = () => {
    if (cartItems.length === 0) {
      alert("Votre panier est vide.");
      return;
    }
    setPinDigits('');
    setPaymentState('idle');
    setIsPinModalOpen(true);
  };

  const handleConfirmPin = () => {
    if (pinDigits.length < 4) {
      alert("Veuillez saisir votre code secret Mobile Money à 4 chiffres.");
      return;
    }
    setPaymentState('processing');

    setTimeout(() => {
      const refId = `CI-NAF-${Math.floor(100000 + Math.random() * 900000)}`;
      setTransactionRef(refId);
      setPaymentState('success');

      // Add to user transaction history
      const now = new Date();
      const formattedDate =
        "Aujourd'hui, " +
        now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

      const newTx: PaymentHistoryRecord = {
        id: `tx-new-${Date.now()}`,
        ref: refId,
        title:
          cartItems.length > 0
            ? cartItems.map((i) => i.name).slice(0, 2).join(' + ') +
              (cartItems.length > 2 ? ` (+${cartItems.length - 2})` : '')
            : 'Commande Marché Vivrier Solaire',
        operator: selectedOperator,
        amount: total,
        status: 'Payé',
        date: formattedDate,
        recipient: 'NAFAMA SOLAIRE COOP',
        userName: `${effectiveUser.prenom} ${effectiveUser.nom}`,
        userPhone: momoPhone || effectiveUser.phone,
        location:
          deliveryMode === 'express'
            ? selectedLocation
            : `${effectiveUser.location} (Retrait Coop)`,
        category: 'Marché Vivrier',
        paymentType: 'marche'
      };

      setHistoryList((prev) => [newTx, ...prev]);

      onTriggerSmsNotification(
        `Paiement de ${total.toLocaleString('fr-FR')} FCFA validé via ${selectedOperator.toUpperCase()} CI. Réf: ${refId}. Préparation fraîcheur en cours.`
      );
    }, 1800);
  };

  return (
    <div className="flex flex-col w-full px-4 pb-24 pt-2 gap-4 max-w-md mx-auto">
      {/* Top Segmented Navigation: Panier vs Historique */}
      <div className="flex bg-[#e2e7ff] p-1 rounded-2xl text-xs font-bold shadow-inner">
        <button
          type="button"
          onClick={() => setActiveTab('checkout')}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'checkout'
              ? 'bg-white text-[#004c22] shadow-sm'
              : 'text-[#404940] hover:text-[#004c22]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">shopping_cart_checkout</span>
          <span>Panier & Paiement ({cartItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('historique')}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'historique'
              ? 'bg-white text-[#004c22] shadow-sm'
              : 'text-[#404940] hover:text-[#004c22]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">history_edu</span>
          <span>Historique ({historyList.length})</span>
        </button>
      </div>

      {/* VIEW 1: Full Historique View */}
      {activeTab === 'historique' && (
        <PaymentHistorySection
          history={historyList}
          currentUser={effectiveUser}
          onTriggerSmsNotification={onTriggerSmsNotification}
          onGoToCheckout={() => setActiveTab('checkout')}
        />
      )}

      {/* VIEW 2: Checkout & Cart View */}
      {activeTab === 'checkout' && (
        <>
          {/* Fresh Harvest Banner Info */}
          <div className="w-full bg-[#f2f3ff] rounded-2xl p-4 shadow-sm flex items-center justify-between border border-[#eaedff]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#a6f4b5] flex items-center justify-center flex-shrink-0 text-[#004c22]">
                <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  eco
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-[#131b2e]">Circuit Court Solaire</p>
                <p className="text-xs text-[#404940]">Récolté sous irrigation Nafama</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#fea619]/20 text-[#855300]">
              {cartItems.length} Articles
            </span>
          </div>

      {/* Cart Product Items */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-[#131b2e]">Produits commandés</h2>
          <button 
            onClick={() => onNavigate('marche')}
            className="text-xs font-bold text-[#004c22] hover:underline"
          >
            + Ajouter
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-[#eaedff]">
            <p className="text-sm text-[#404940]">Votre panier est actuellement vide.</p>
            <button
              onClick={() => onNavigate('marche')}
              className="mt-3 px-4 py-2 bg-[#004c22] text-white rounded-xl text-xs font-bold"
            >
              Découvrir les récoltes solaires
            </button>
          </div>
        ) : (
          cartItems.map((item) => (
            <div
              key={item.id}
              className="w-full bg-white rounded-2xl p-3.5 shadow-sm border border-[#eaedff] flex gap-3 items-center"
            >
              <img
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-[#eaedff] border border-[#eaedff]"
                alt={item.name}
                src={item.image}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h3 className="text-xs font-bold text-[#131b2e] truncate">{item.name}</h3>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    aria-label="Supprimer"
                    className="text-[#707a6f] hover:text-[#ba1a1a] transition-colors p-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#404940] truncate">{item.spec}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-extrabold text-[#004c22]">
                    {(item.unitPrice * item.quantity).toLocaleString('fr-FR')} FCFA
                  </span>
                  <div className="flex items-center space-x-2 bg-[#f2f3ff] px-2 py-0.5 rounded-lg border border-[#dae2fd]">
                    <button
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="text-[#404940] font-bold text-sm hover:text-[#004c22] px-1"
                    >
                      −
                    </button>
                    <span className="text-xs font-bold text-[#131b2e] px-1">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="text-[#404940] font-bold text-sm hover:text-[#004c22] px-1"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delivery Method Selection */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-[#131b2e]">Mode d'acheminement</h2>
          <span className="text-[10px] font-bold text-[#ba1a1a] bg-[#ffdad6] px-2 py-0.5 rounded-full">
            Requis
          </span>
        </div>

        {/* Option 1: Express Réfrigéré */}
        <label
          onClick={() => setDeliveryMode('express')}
          className={`block w-full rounded-2xl p-3.5 shadow-sm cursor-pointer transition-all border ${
            deliveryMode === 'express'
              ? 'bg-[#004c22]/5 border-[#004c22] ring-1 ring-[#004c22]'
              : 'bg-white border-[#eaedff]'
          }`}
        >
          <div className="flex items-start space-x-3">
            <input
              type="radio"
              name="shipping_mode"
              checked={deliveryMode === 'express'}
              onChange={() => setDeliveryMode('express')}
              className="mt-1 accent-[#004c22] w-4 h-4 flex-shrink-0 cursor-pointer"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-[#131b2e]">NAFAMA Express Froid</span>
                  <span className="material-symbols-outlined text-[#005e87] text-[18px]">ac_unit</span>
                </div>
                <span className="text-xs font-extrabold text-[#004c22]">+5 000 FCFA</span>
              </div>
              <p className="text-[11px] text-[#404940] mt-0.5">
                Camionnette solaire réfrigérée. Préservation absolue de fraîcheur bord-champ.
              </p>

              {deliveryMode === 'express' && (
                <div className="mt-3 bg-[#f2f3ff] p-2.5 rounded-xl space-y-2 border border-[#dae2fd]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#404940] uppercase tracking-wider">
                      Lieu de déchargement
                    </span>
                    <span className="text-[11px] font-semibold text-[#004c22] flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[15px]">my_location</span> GPS Actif
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-[#eaedff]">
                    <span className="material-symbols-outlined text-[#855300] text-[18px]">storefront</span>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="bg-transparent text-xs text-[#131b2e] font-medium w-full focus:outline-none"
                    >
                      <option>Maquis & Restaurant (Cocody Angré, Abidjan)</option>
                      <option>Hôtel Le Baobab (Plateau)</option>
                      <option>Entrepôt Central Marché Gouro (Adjamé)</option>
                      <option>Restaurant Chez Tantie Alice (Yopougon)</option>
                      <option>Autre adresse professionnelle (Saisir repère)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </label>

        {/* Option 2: Retrait direct à la Ferme */}
        <label
          onClick={() => setDeliveryMode('pickup')}
          className={`block w-full rounded-2xl p-3.5 shadow-sm cursor-pointer transition-all border ${
            deliveryMode === 'pickup'
              ? 'bg-[#004c22]/5 border-[#004c22] ring-1 ring-[#004c22]'
              : 'bg-white border-[#eaedff]'
          }`}
        >
          <div className="flex items-start space-x-3">
            <input
              type="radio"
              name="shipping_mode"
              checked={deliveryMode === 'pickup'}
              onChange={() => setDeliveryMode('pickup')}
              className="mt-1 accent-[#004c22] w-4 h-4 flex-shrink-0 cursor-pointer"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#131b2e]">Retrait direct à la Ferme</span>
                <span className="text-xs font-bold text-[#404940]">Gratuit (0 F)</span>
              </div>
              <p className="text-[11px] text-[#404940] mt-0.5">
                À retirer sous 24h à la Coopérative Agro-Solaire de Nambékaha (Korhogo).
              </p>
            </div>
          </div>
        </label>
      </div>

      {/* Transparent Cost Summary */}
      <div className="w-full bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff] space-y-2.5">
        <h3 className="text-sm font-bold text-[#131b2e]">Détail transparent</h3>
        <div className="space-y-1.5 text-xs text-[#404940]">
          <div className="flex justify-between">
            <span>Sous-total produits ({cartItems.length})</span>
            <span className="text-[#131b2e] font-semibold">{subtotal.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1">
              Acheminement express froid
              <span className="material-symbols-outlined text-[15px] text-[#005e87]">info</span>
            </span>
            <span className="text-[#131b2e] font-semibold">
              {deliveryFee > 0 ? `${deliveryFee.toLocaleString('fr-FR')} FCFA` : 'Gratuit (0 F)'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1">
              Commission Marché NAFAMA (3%)
              <span className="material-symbols-outlined text-[15px] text-[#004c22]">verified_user</span>
            </span>
            <span className="text-[#131b2e] font-semibold">{platformFee.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>

        <div className="w-full h-px bg-[#eaedff] my-1"></div>

        <div className="flex justify-between items-baseline pt-1">
          <div>
            <p className="text-sm font-bold text-[#131b2e]">Total à payer</p>
            <p className="text-[10px] text-[#404940]">TTC incluant garantie fraîcheur</p>
          </div>
          <p className="text-2xl font-black text-[#004c22]">
            {total.toLocaleString('fr-FR')} <span className="text-xs font-bold text-[#404940]">FCFA</span>
          </p>
        </div>
      </div>

      {/* Mobile Money Operator Selection */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-1.5">
            <span className="material-symbols-outlined text-[#855300] text-[18px]">lock</span>
            <h2 className="text-base font-bold text-[#131b2e]">Paiement Mobile Money</h2>
          </div>
          <span className="text-[11px] text-[#404940]">Instantané & Sécurisé</span>
        </div>

        {/* 4 Operator Badges Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Wave */}
          <button
            type="button"
            onClick={() => setSelectedOperator('wave')}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all border ${
              selectedOperator === 'wave'
                ? 'bg-[#1DC3F4]/10 border-[#0284c7] ring-2 ring-[#0284c7] shadow-sm'
                : 'bg-white border-[#eaedff]'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-[#1DC3F4]/20 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[#0284c7] text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                waves
              </span>
            </div>
            <span className="text-xs font-bold text-[#131b2e]">Wave CI</span>
            <span className="text-[11px] font-semibold text-[#004c22] mt-0.5">0% de frais</span>
          </button>

          {/* Orange Money */}
          <button
            type="button"
            onClick={() => setSelectedOperator('orange')}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all border ${
              selectedOperator === 'orange'
                ? 'bg-[#FF7900]/10 border-[#ea580c] ring-2 ring-[#ea580c] shadow-sm'
                : 'bg-white border-[#eaedff]'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-[#FF7900]/20 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[#ea580c] text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                currency_exchange
              </span>
            </div>
            <span className="text-xs font-bold text-[#131b2e]">Orange Money</span>
            <span className="text-[11px] text-[#404940] mt-0.5">Code #144#</span>
          </button>

          {/* MTN MoMo */}
          <button
            type="button"
            onClick={() => setSelectedOperator('mtn')}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all border ${
              selectedOperator === 'mtn'
                ? 'bg-[#FFCC00]/15 border-[#ca8a04] ring-2 ring-[#ca8a04] shadow-sm'
                : 'bg-white border-[#eaedff]'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-[#FFCC00]/25 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[#855300] text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                payments
              </span>
            </div>
            <span className="text-xs font-bold text-[#131b2e]">MTN MoMo</span>
            <span className="text-[11px] text-[#404940] mt-0.5">Code *133#</span>
          </button>

          {/* Moov Money */}
          <button
            type="button"
            onClick={() => setSelectedOperator('moov')}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all border ${
              selectedOperator === 'moov'
                ? 'bg-[#005CA9]/10 border-[#0284c7] ring-2 ring-[#0284c7] shadow-sm'
                : 'bg-white border-[#eaedff]'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-[#005CA9]/20 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[#0284c7] text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                account_balance_wallet
              </span>
            </div>
            <span className="text-xs font-bold text-[#131b2e]">Moov Money</span>
            <span className="text-[11px] text-[#404940] mt-0.5">Code *155#</span>
          </button>
        </div>

        {/* Phone Number Input */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff] space-y-2">
          <label className="block text-xs font-bold text-[#131b2e]" htmlFor="phone-momo">
            Numéro de compte Mobile Money (Côte d'Ivoire)
          </label>
          <div className="flex items-center bg-[#f2f3ff] px-3 py-2.5 rounded-xl space-x-2 border border-[#dae2fd]">
            <span className="text-xs font-bold text-[#404940]">+225</span>
            <input
              id="phone-momo"
              type="tel"
              maxLength={14}
              value={momoPhone}
              onChange={(e) => setMomoPhone(e.target.value)}
              placeholder="07 00 00 00 00"
              className="w-full bg-transparent text-sm font-semibold text-[#131b2e] focus:outline-none tracking-wider"
            />
            <span className="material-symbols-outlined text-[#004c22] text-[20px]">check_circle</span>
          </div>
          <p className="text-[11px] text-[#404940]">
            Une notification push de validation PIN sera envoyée sur ce téléphone.
          </p>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleStartPayment}
          className="w-full h-14 bg-[#004c22] text-white rounded-2xl text-sm font-bold shadow-md hover:bg-[#166534] active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
        >
          <span className="material-symbols-outlined text-[24px]">verified</span>
          <span>Valider et Payer avec mon Mobile Money</span>
        </button>

        <div className="flex items-center justify-center space-x-2 mt-3 text-center">
          <span className="material-symbols-outlined text-[#707a6f] text-[16px]">shield</span>
          <p className="text-xs text-[#404940]">
            Paiement sous séquestre coopérative NAFAMA SOLAIRE
          </p>
        </div>
      </div>

      {/* Inline Quick History Preview Section */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff] flex flex-col gap-3 mt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#004c22] text-[20px]">
              history
            </span>
            <h3 className="text-xs font-bold text-[#131b2e]">
              Historique récent ({effectiveUser.prenom})
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('historique')}
            className="text-xs font-bold text-[#004c22] hover:underline flex items-center gap-0.5"
          >
            <span>Voir tout ({historyList.length})</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {historyList.slice(0, 2).map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveTab('historique')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] transition-colors cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 ${
                    item.status === 'Payé'
                      ? 'bg-[#a6f4b5] text-[#00210b]'
                      : 'bg-[#ffddb8] text-[#855300]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {item.status === 'Payé' ? 'check' : 'schedule'}
                  </span>
                </span>
                <div className="min-w-0 truncate">
                  <p className="font-bold text-[#131b2e] truncate">{item.title}</p>
                  <p className="text-[10px] text-[#707a6f]">{item.date}</p>
                </div>
              </div>
              <div className="text-right shrink-0 pl-2">
                <span className="font-extrabold text-[#004c22] block">
                  {item.amount.toLocaleString('fr-FR')} F
                </span>
                <span
                  className={`text-[9px] font-bold ${
                    item.status === 'Payé' ? 'text-[#004c22]' : 'text-[#855300]'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )}

      {/* Simulated Mobile Money PIN & Receipt Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#eaedff] flex flex-col gap-4">
            {paymentState === 'idle' && (
              <>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-2 bg-[#f2f3ff] text-[#004c22]">
                    <span className="material-symbols-outlined text-[32px]">cell_tower</span>
                  </div>
                  <h3 className="text-base font-bold text-[#131b2e]">
                    Demande de débit {selectedOperator.toUpperCase()} CI
                  </h3>
                  <p className="text-xs text-[#404940] mt-1">
                    Confirmez le débit vers <strong>NAFAMA SOLAIRE COOP</strong>
                  </p>
                </div>

                <div className="p-3 bg-[#f2f3ff] rounded-2xl text-center border border-[#dae2fd]">
                  <span className="text-xs text-[#404940]">Montant exact</span>
                  <div className="text-2xl font-black text-[#004c22]">
                    {total.toLocaleString('fr-FR')} FCFA
                  </div>
                  <span className="text-[11px] text-[#404940]">Compte : +225 {momoPhone}</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#131b2e] text-center">
                    Entrez votre Code Secret PIN
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={pinDigits}
                    onChange={(e) => setPinDigits(e.target.value)}
                    placeholder="••••"
                    className="w-full h-12 bg-[#eaedff] rounded-xl text-center text-2xl font-bold tracking-[0.4em] focus:outline-none"
                    autoFocus
                  />
                  <span className="text-[10px] text-[#707a6f] text-center">
                    Simulateur sécurisé • Saisissez n'importe quels 4 chiffres
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPinModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-[#f2f3ff] text-[#404940] text-xs font-bold"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPin}
                    className="flex-1 py-3 rounded-xl bg-[#004c22] text-white text-xs font-bold shadow-md hover:bg-[#166534]"
                  >
                    Confirmer
                  </button>
                </div>
              </>
            )}

            {paymentState === 'processing' && (
              <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-12 h-12 border-4 border-[#004c22] border-t-transparent rounded-full animate-spin"></div>
                <h4 className="text-sm font-bold text-[#131b2e]">Traitement Mobile Money en cours...</h4>
                <p className="text-xs text-[#404940]">Liaison avec l'opérateur {selectedOperator.toUpperCase()} CI</p>
              </div>
            )}

            {paymentState === 'success' && (
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-[#a6f4b5] text-[#00210b] flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[32px]">check</span>
                </div>

                <div>
                  <h3 className="text-base font-black text-[#004c22]">Paiement Confirmé !</h3>
                  <p className="text-xs text-[#404940] mt-0.5">
                    Votre commande bord-champ a été transmise à la coopérative.
                  </p>
                </div>

                {/* Digital Receipt Card */}
                <div className="w-full bg-[#f2f3ff] p-3 rounded-2xl text-left text-xs space-y-1.5 border border-[#dae2fd]">
                  <div className="flex justify-between">
                    <span className="text-[#404940]">Référence :</span>
                    <strong className="text-[#131b2e]">{transactionRef}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#404940]">Montant débité :</span>
                    <strong className="text-[#004c22]">{total.toLocaleString('fr-FR')} FCFA</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#404940]">Mode :</span>
                    <strong className="text-[#131b2e]">
                      {deliveryMode === 'express' ? 'NAFAMA Express Froid' : 'Retrait Coop'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#404940]">Lieu :</span>
                    <strong className="text-[#131b2e] truncate max-w-[150px]">
                      {deliveryMode === 'express' ? selectedLocation : 'Nambékaha (Korhogo)'}
                    </strong>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPinModalOpen(false);
                      setActiveTab('historique');
                    }}
                    className="w-full py-3 rounded-xl bg-[#004c22] text-white text-xs font-bold shadow-md hover:bg-[#166534] flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                  >
                    <span className="material-symbols-outlined text-[16px]">history_edu</span>
                    <span>Consulter dans mon Historique</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsPinModalOpen(false);
                      onNavigate('solaire');
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#f2f3ff] text-[#404940] text-xs font-bold hover:bg-[#eaedff]"
                  >
                    Retour au suivi de l'exploitation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
