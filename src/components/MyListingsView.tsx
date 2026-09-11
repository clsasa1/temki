import React, { useState } from 'react';
import { 
  ShoppingBag, 
  MessageSquare, 
  Check, 
  X, 
  AlertCircle, 
  User, 
  DollarSign, 
  Sparkles,
  Flame,
  ArrowRight,
  AlertTriangle,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { Item, IncomingBuyerOffer } from '../types/game';
import { sounds } from '../utils/audio';

interface MyListingsViewProps {
  listedItems: Item[];
  incomingOffers: IncomingBuyerOffer[];
  onAcceptOffer: (offer: IncomingBuyerOffer, item: Item) => void;
  onRejectOffer: (offerId: string) => void;
  onStartSellNegotiation: (offer: IncomingBuyerOffer, item: Item) => void;
  onUnlist: (itemId: string) => void;
}

export const MyListingsView: React.FC<MyListingsViewProps> = ({
  listedItems,
  incomingOffers,
  onAcceptOffer,
  onRejectOffer,
  onStartSellNegotiation,
  onUnlist,
}) => {
  const [lossModal, setLossModal] = useState<{ offer: IncomingBuyerOffer; item: Item; diff: number } | null>(null);

  const handleSellClick = (offer: IncomingBuyerOffer, item: Item) => {
    const diff = offer.offeredPrice - (item.boughtPrice || 0);
    if (diff < 0) {
      // Show confirmation warning!
      sounds.playTap();
      setLossModal({ offer, item, diff });
    } else {
      sounds.playCash();
      onAcceptOffer(offer, item);
    }
  };

  const confirmLossSell = () => {
    if (!lossModal) return;
    sounds.playCash();
    onAcceptOffer(lossModal.offer, lossModal.item);
    setLossModal(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            Мои объявления на Авито ({listedItems.length})
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Следите за предложениями покупателей! Некоторые нагло сбивают цену ниже закупки — торгуйтесь, чтобы не уйти в минус.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800">
            <span className="text-neutral-500">Входящих предложений: </span>
            <span className="text-amber-400 font-bold">{incomingOffers.length}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Listings + Their Offers */}
      {listedItems.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center text-neutral-400">
          <ShoppingBag className="w-12 h-12 mx-auto text-neutral-600 mb-3" />
          <p className="text-base font-semibold text-neutral-300 mb-1">
            У вас нет активных объявлений
          </p>
          <p className="text-xs text-neutral-500">
            Перейдите во вкладку «Склад» и нажмите «Продать» на любом товаре.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {listedItems.map((item) => {
            // Find offers for this item
            const itemOffers = incomingOffers.filter((o) => o.itemId === item.id);
            const listedPrice = item.listedPrice || item.currentMarketValue;
            const boughtPrice = item.boughtPrice || 0;

            return (
              <div
                key={item.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-sm space-y-3"
              >
                {/* Item Listing Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800">
                  <div>
                    <h3 className="font-extrabold text-white text-base leading-tight">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
                      <span>Куплен за: <strong className="text-neutral-200 font-mono font-bold">{boughtPrice.toLocaleString('ru-RU')} ₽</strong></span>
                      <span>•</span>
                      <span>Рыночная цена: <strong className="text-neutral-300 font-mono">~{item.currentMarketValue.toLocaleString('ru-RU')} ₽</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-semibold text-neutral-400 block">
                        Выставлено на Авито
                      </span>
                      <span className="text-base sm:text-lg font-black font-mono text-emerald-400">
                        {listedPrice.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>

                    <button
                      onClick={() => onUnlist(item.id)}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-400 hover:text-white text-xs font-semibold rounded-lg border border-neutral-700 transition cursor-pointer"
                    >
                      Снять
                    </button>
                  </div>
                </div>

                {/* Buyer Offers list for this item */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                    Сообщения от покупателей ({itemOffers.length}):
                  </h4>

                  {itemOffers.length === 0 ? (
                    <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-center text-xs text-neutral-500">
                      Объявление висит в поиске... Новые покупатели напишут в течение дня или на следующее утро.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {itemOffers.map((offer) => {
                        const diff = offer.offeredPrice - boughtPrice;
                        const isLoss = diff < 0;

                        return (
                          <div
                            key={offer.id}
                            className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                              isLoss 
                                ? 'bg-rose-950/20 border-rose-900/60 hover:border-rose-700' 
                                : 'bg-neutral-950 border-neutral-800/90 hover:border-neutral-700'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold text-sm shrink-0 ${
                                isLoss 
                                  ? 'bg-rose-950/60 border-rose-800 text-rose-300' 
                                  : 'bg-neutral-800 border-neutral-700 text-amber-400'
                              }`}>
                                {offer.buyerAvatar}
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-white text-xs sm:text-sm">
                                    {offer.buyerName}
                                  </span>
                                  <span className="text-[10px] bg-neutral-800 px-2 py-0.5 rounded text-neutral-300 font-mono">
                                    Предлагает: <strong className={isLoss ? 'text-rose-400 font-black' : 'text-emerald-400 font-black'}>
                                      {offer.offeredPrice.toLocaleString('ru-RU')} ₽
                                    </strong>
                                  </span>
                                  {isLoss && (
                                    <span className="text-[10px] bg-rose-900/80 text-rose-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                      <TrendingDown className="w-3 h-3" />
                                      НИЖЕ ЗАКУПКИ
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-neutral-300 italic mt-1">
                                  «{offer.message}»
                                </p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className={`text-[11px] font-mono font-bold flex items-center gap-1 ${
                                    isLoss ? 'text-rose-400' : 'text-emerald-400'
                                  }`}>
                                    {isLoss ? (
                                      <>
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        Убыток при продаже: {diff.toLocaleString('ru-RU')} ₽ (Покупка: {boughtPrice.toLocaleString('ru-RU')} ₽)
                                      </>
                                    ) : (
                                      <>
                                        <TrendingUp className="w-3.5 h-3.5" />
                                        Чистая прибыль: +{diff.toLocaleString('ru-RU')} ₽
                                      </>
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                              <button
                                onClick={() => {
                                  sounds.playTap();
                                  onStartSellNegotiation(offer, item);
                                }}
                                className={`px-3.5 py-1.5 text-xs font-black rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                                  isLoss 
                                    ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 ring-2 ring-amber-400/40' 
                                    : 'bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-neutral-700'
                                }`}
                                title="Поторговаться в чате и поднять цену"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Торговаться</span>
                              </button>

                              <button
                                onClick={() => handleSellClick(offer, item)}
                                className={`px-3.5 py-1.5 text-xs font-black rounded-lg transition flex items-center gap-1 shadow-sm cursor-pointer ${
                                  isLoss 
                                    ? 'bg-neutral-800 hover:bg-rose-900/60 text-rose-300 border border-rose-800/80' 
                                    : 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                <span>{isLoss ? 'Слить в минус' : 'Продать'}</span>
                              </button>

                              <button
                                onClick={() => {
                                  sounds.playTap();
                                  onRejectOffer(offer.id);
                                }}
                                className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-rose-400 rounded-lg border border-neutral-700 transition cursor-pointer"
                                title="Отклонить предложение"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Loss Confirmation Modal */}
      {lossModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-rose-800/80 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 bg-rose-950/60 border-b border-rose-900/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-white text-base">
                  Внимание: Сделка в минус!
                </h3>
                <p className="text-xs text-rose-300">
                  Вы продаёте вещь дешевле цены её закупки!
                </p>
              </div>
            </div>

            <div className="p-5 space-y-3 bg-neutral-950 text-xs text-neutral-300">
              <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Товар:</span>
                  <span className="text-white font-bold">{lossModal.item.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Куплен вами за:</span>
                  <span className="text-neutral-200 font-bold">{lossModal.item.boughtPrice?.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Предложение покупателя:</span>
                  <span className="text-rose-400 font-bold">{lossModal.offer.offeredPrice.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="pt-2 border-t border-neutral-800 flex justify-between text-sm">
                  <span className="text-rose-400 font-bold">Ваш убыток:</span>
                  <span className="text-rose-400 font-black">{lossModal.diff.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>

              <p className="text-neutral-400 leading-relaxed">
                Покупатель <strong className="text-white">{lossModal.offer.buyerName}</strong> нагло сбивает цену. 
                Рекомендуем нажать <strong>«Торговаться»</strong> — с помощью навыков и аргументов вы сможете поднять его предложение до рыночной цены и остаться в плюсе!
              </p>
            </div>

            <div className="p-4 bg-neutral-900 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-end gap-2">
              <button
                onClick={() => {
                  const o = lossModal.offer;
                  const it = lossModal.item;
                  setLossModal(null);
                  onStartSellNegotiation(o, it);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Перейти в торг (Рекомендуется)</span>
              </button>

              <button
                onClick={confirmLossSell}
                className="w-full sm:w-auto px-3 py-2 bg-neutral-800 hover:bg-rose-950 text-rose-400 hover:text-rose-300 font-bold rounded-xl text-xs border border-neutral-700 transition cursor-pointer"
              >
                Всё равно слить в минус
              </button>

              <button
                onClick={() => setLossModal(null)}
                className="w-full sm:w-auto px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-xl text-xs transition cursor-pointer"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
