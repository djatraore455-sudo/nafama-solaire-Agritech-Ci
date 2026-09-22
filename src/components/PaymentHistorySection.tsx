import React, { useState } from 'react';
import { MomoOperator, UserAccount } from '../types';

export interface PaymentHistoryRecord {
  id: string;
  ref: string;
  title: string;
  operator: MomoOperator;
  amount: number;
  status: 'Payé' | 'En attente';
  date: string;
  recipient: string;
  userName: string;
  userPhone: string;
  location: string;
  category: string;
  paymentType?: 'marche' | 'abonnement' | 'kit';
}

interface PaymentHistorySectionProps {
  history: PaymentHistoryRecord[];
  currentUser: UserAccount;
  onSelectReceipt?: (record: PaymentHistoryRecord) => void;
  onTriggerSmsNotification?: (message: string) => void;
  onGoToCheckout?: () => void;
}

const OPERATOR_STYLE: Record<
  MomoOperator,
  { label: string; icon: string; bg: string; text: string; border: string }
> = {
  wave: {
    label: 'Wave CI',
    icon: 'waves',
    bg: 'bg-[#1DC3F4]/15',
    text: 'text-[#0284c7]',
    border: 'border-[#1DC3F4]/40'
  },
  orange: {
    label: 'Orange Money',
    icon: 'currency_exchange',
    bg: 'bg-[#FF7900]/15',
    text: 'text-[#ea580c]',
    border: 'border-[#FF7900]/40'
  },
  mtn: {
    label: 'MTN MoMo',
    icon: 'payments',
    bg: 'bg-[#FFCC00]/25',
    text: 'text-[#855300]',
    border: 'border-[#ca8a04]/40'
  },
  moov: {
    label: 'Moov Money',
    icon: 'account_balance_wallet',
    bg: 'bg-[#005CA9]/15',
    text: 'text-[#0284c7]',
    border: 'border-[#005CA9]/40'
  }
};

export const PaymentHistorySection: React.FC<PaymentHistorySectionProps> = ({
  history,
  currentUser,
  onSelectReceipt,
  onTriggerSmsNotification,
  onGoToCheckout
}) => {
  const [filterStatus, setFilterStatus] = useState<'tous' | 'Payé' | 'En attente'>('tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<PaymentHistoryRecord | null>(null);

  // Filter transactions
  const filteredList = history.filter((item) => {
    const matchesStatus = filterStatus === 'tous' || item.status === filterStatus;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.userName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPaidAmount = history
    .filter((item) => item.status === 'Payé')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const paidCount = history.filter((item) => item.status === 'Payé').length;
  const pendingCount = history.filter((item) => item.status === 'En attente').length;

  const handleOpenReceipt = (record: PaymentHistoryRecord) => {
    setSelectedTx(record);
    if (onSelectReceipt) {
      onSelectReceipt(record);
    }
  };

  const handleSendReceiptSms = (record: PaymentHistoryRecord) => {
    if (onTriggerSmsNotification) {
      onTriggerSmsNotification(
        `Reçu NAFAMA ${record.ref}: Montant ${record.amount.toLocaleString(
          'fr-FR'
        )} FCFA (${record.status.toUpperCase()}) le ${record.date}. Envoyé au +225 ${
          record.userPhone
        }.`
      );
    }
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* User Context & KPI Banner */}
      <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#004c22] text-white flex items-center justify-center font-bold text-sm shadow-xs overflow-hidden">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.prenom}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{currentUser.prenom?.charAt(0) || 'U'}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-[#131b2e]">
                  {currentUser.prenom} {currentUser.nom}
                </h3>
                <span className="bg-[#a6f4b5] text-[#00210b] text-[10px] font-bold px-1.5 py-0.2 rounded">
                  Compte MoMo
                </span>
              </div>
              <p className="text-xs text-[#404940] flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-[#004c22]">
                  phone_iphone
                </span>
                +225 {currentUser.phone} • {currentUser.location}
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono text-[#707a6f] bg-[#f2f3ff] px-2 py-1 rounded-lg border border-[#eaedff]">
            {history.length} Opérations
          </span>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#f2f3ff]">
          <div className="bg-[#f2f3ff] rounded-xl p-2.5 border border-[#dae2fd]">
            <span className="text-[10px] text-[#404940] font-bold block">Total Payé</span>
            <span className="text-sm font-extrabold text-[#004c22] block mt-0.5">
              {totalPaidAmount.toLocaleString('fr-FR')}{' '}
              <span className="text-[9px] font-normal">F</span>
            </span>
            <span className="text-[9px] text-[#004c22] font-semibold">{paidCount} réglés</span>
          </div>

          <div className="bg-[#f2f3ff] rounded-xl p-2.5 border border-[#dae2fd]">
            <span className="text-[10px] text-[#404940] font-bold block">En attente</span>
            <span className="text-sm font-extrabold text-[#855300] block mt-0.5">
              {pendingCount}{' '}
              <span className="text-[9px] font-normal text-[#404940]">trans.</span>
            </span>
            <span className="text-[9px] text-[#855300] font-semibold">Validation MoMo</span>
          </div>

          <div className="bg-[#f2f3ff] rounded-xl p-2.5 border border-[#dae2fd]">
            <span className="text-[10px] text-[#404940] font-bold block">Sécurité</span>
            <span className="text-sm font-extrabold text-[#131b2e] block mt-0.5">100%</span>
            <span className="text-[9px] text-[#004c22] font-semibold">Séquestre CI</span>
          </div>
        </div>
      </section>

      {/* Filter and Search Controls */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-1">
          <div className="flex bg-[#f2f3ff] p-1 rounded-xl text-xs font-bold gap-1 border border-[#eaedff] flex-1">
            <button
              type="button"
              onClick={() => setFilterStatus('tous')}
              className={`flex-1 py-1.5 rounded-lg text-[11px] transition-all flex items-center justify-center gap-1 ${
                filterStatus === 'tous'
                  ? 'bg-[#004c22] text-white shadow-xs'
                  : 'text-[#404940] hover:text-[#004c22]'
              }`}
            >
              <span>Tous</span>
              <span className="text-[10px] opacity-80 font-mono">({history.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('Payé')}
              className={`flex-1 py-1.5 rounded-lg text-[11px] transition-all flex items-center justify-center gap-1 ${
                filterStatus === 'Payé'
                  ? 'bg-[#004c22] text-white shadow-xs'
                  : 'text-[#404940] hover:text-[#004c22]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#a6f4b5]"></span>
              <span>Payé</span>
              <span className="text-[10px] opacity-80 font-mono">({paidCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('En attente')}
              className={`flex-1 py-1.5 rounded-lg text-[11px] transition-all flex items-center justify-center gap-1 ${
                filterStatus === 'En attente'
                  ? 'bg-[#004c22] text-white shadow-xs'
                  : 'text-[#404940] hover:text-[#004c22]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#fea619]"></span>
              <span>En attente</span>
              <span className="text-[10px] opacity-80 font-mono">({pendingCount})</span>
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="flex items-center bg-white px-3 py-2 rounded-xl border border-[#eaedff] text-xs space-x-2 shadow-2xs">
          <span className="material-symbols-outlined text-[#707a6f] text-[18px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par référence, produit, coopérative..."
            className="w-full bg-transparent text-[#131b2e] focus:outline-none placeholder-[#707a6f]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-[#707a6f] hover:text-[#131b2e]"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex flex-col gap-2.5">
        {filteredList.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#eaedff] flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[#f2f3ff] text-[#707a6f] flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">receipt_long</span>
            </div>
            <p className="text-sm font-bold text-[#131b2e]">Aucune transaction trouvée</p>
            <p className="text-xs text-[#404940] max-w-xs">
              {searchQuery
                ? 'Aucun résultat ne correspond à votre recherche.'
                : 'Effectuez un paiement Mobile Money pour le retrouver ici.'}
            </p>
            {onGoToCheckout && (
              <button
                type="button"
                onClick={onGoToCheckout}
                className="mt-2 px-4 py-2 bg-[#004c22] text-white rounded-xl text-xs font-bold"
              >
                Aller au panier & paiement
              </button>
            )}
          </div>
        ) : (
          filteredList.map((tx) => {
            const op = OPERATOR_STYLE[tx.operator] || OPERATOR_STYLE.wave;
            const isPaid = tx.status === 'Payé';

            return (
              <div
                key={tx.id}
                onClick={() => handleOpenReceipt(tx)}
                className="w-full bg-white rounded-2xl p-3.5 shadow-sm border border-[#eaedff] flex flex-col gap-2.5 hover:border-[#004c22]/40 active:scale-[0.99] transition-all cursor-pointer"
              >
                {/* Top Row: Operator Badge & Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${op.bg} ${op.text} border ${op.border}`}
                    >
                      <span className="material-symbols-outlined text-[13px]">{op.icon}</span>
                      {op.label}
                    </span>
                    <span className="text-[10px] font-mono text-[#707a6f]">{tx.ref}</span>
                  </div>

                  {/* Status Badge with Icon */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      isPaid
                        ? 'bg-[#a6f4b5] text-[#00210b]'
                        : 'bg-[#ffddb8] text-[#855300]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      {isPaid ? 'check_circle' : 'schedule'}
                    </span>
                    {tx.status}
                  </span>
                </div>

                {/* Middle Row: Title & Amount */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#131b2e] leading-snug line-clamp-2">
                      {tx.title}
                    </h4>
                    <p className="text-[11px] text-[#404940] mt-0.5 truncate">
                      {tx.recipient}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm font-black ${
                        isPaid ? 'text-[#004c22]' : 'text-[#855300]'
                      }`}
                    >
                      {tx.amount.toLocaleString('fr-FR')} FCFA
                    </span>
                    <span className="block text-[10px] text-[#707a6f]">
                      {tx.category}
                    </span>
                  </div>
                </div>

                {/* Bottom Row: User Info & Date */}
                <div className="flex items-center justify-between text-[11px] text-[#707a6f] pt-1 border-t border-[#f2f3ff]">
                  <span className="flex items-center gap-1 text-[#404940] font-medium">
                    <span className="material-symbols-outlined text-[13px] text-[#004c22]">
                      account_circle
                    </span>
                    {tx.userName} (+225 {tx.userPhone})
                  </span>

                  <span className="flex items-center gap-1 font-medium text-[#131b2e]">
                    <span className="material-symbols-outlined text-[13px] text-[#855300]">
                      calendar_today
                    </span>
                    {tx.date}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Digital Receipt Modal when clicking any transaction */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#eaedff] flex flex-col gap-4">
            <div className="text-center">
              <div
                className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-2 ${
                  selectedTx.status === 'Payé'
                    ? 'bg-[#a6f4b5] text-[#00210b]'
                    : 'bg-[#ffddb8] text-[#855300]'
                }`}
              >
                <span className="material-symbols-outlined text-[32px]">
                  {selectedTx.status === 'Payé' ? 'check' : 'hourglass_top'}
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#707a6f] uppercase tracking-wider">
                Reçu Numérique NAFAMA
              </span>
              <h3 className="text-base font-bold text-[#131b2e] mt-0.5">
                {selectedTx.status === 'Payé' ? 'Transaction Validée' : 'Paiement En Attente'}
              </h3>
              <p className="text-xs text-[#404940] mt-0.5">{selectedTx.ref}</p>
            </div>

            {/* Amount Banner */}
            <div className="p-3 bg-[#f2f3ff] rounded-2xl text-center border border-[#dae2fd]">
              <span className="text-xs text-[#404940]">Montant débité</span>
              <div className="text-2xl font-black text-[#004c22]">
                {selectedTx.amount.toLocaleString('fr-FR')} FCFA
              </div>
              <span className="text-[11px] font-bold text-[#131b2e]">
                Via {OPERATOR_STYLE[selectedTx.operator]?.label || 'Mobile Money'}
              </span>
            </div>

            {/* Receipt metadata table */}
            <div className="w-full bg-[#fafbff] p-3 rounded-2xl text-xs space-y-2 border border-[#eaedff]">
              <div className="flex justify-between items-center">
                <span className="text-[#404940]">Date & Heure :</span>
                <strong className="text-[#131b2e]">{selectedTx.date}</strong>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#404940]">Statut :</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedTx.status === 'Payé'
                      ? 'bg-[#a6f4b5] text-[#00210b]'
                      : 'bg-[#ffddb8] text-[#855300]'
                  }`}
                >
                  {selectedTx.status}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#404940]">Client :</span>
                <strong className="text-[#131b2e]">{selectedTx.userName}</strong>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#404940]">Téléphone :</span>
                <strong className="text-[#131b2e]">+225 {selectedTx.userPhone}</strong>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#404940]">Bénéficiaire :</span>
                <strong className="text-[#131b2e] truncate max-w-[170px]">
                  {selectedTx.recipient}
                </strong>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#404940]">Localité :</span>
                <strong className="text-[#131b2e]">{selectedTx.location}</strong>
              </div>

              <div className="pt-1.5 border-t border-[#eaedff] flex justify-between items-start">
                <span className="text-[#404940]">Intitulé :</span>
                <strong className="text-[#131b2e] text-right truncate max-w-[180px]">
                  {selectedTx.title}
                </strong>
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleSendReceiptSms(selectedTx)}
                className="w-full py-2.5 rounded-xl bg-[#004c22] text-white text-xs font-bold shadow-md hover:bg-[#166534] flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-[16px]">sms</span>
                <span>Renvoyer reçu par SMS</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="w-full py-2 rounded-xl bg-[#f2f3ff] text-[#404940] text-xs font-bold hover:bg-[#eaedff]"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
