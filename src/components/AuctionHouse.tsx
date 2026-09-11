import React, { useState, useEffect } from 'react';
import { 
  Gavel, 
  Clock, 
  Building2, 
  Layers, 
  TrendingUp, 
  AlertCircle, 
  Award, 
  CheckCircle, 
  Plus, 
  ShieldAlert,
  Flame,
  Weight
} from 'lucide-react';
import { AuctionLot, Skills, WarehouseLevel } from '../types/game';
import { sounds } from '../utils/audio';

interface AuctionHouseProps {
  lots: AuctionLot[];
  playerMoney: number;
  playerEnergy?: number;
  skills: Skills;
  warehouse: WarehouseLevel;
  currentWarehouseWeight: number;
  currentWarehouseSlots: number;
  onPlaceBid: (lotId: string, newBid: number) => void;
  onClaimLot: (lotId: string) => void;
  onGenerateNewLots: () => void;
  onInspectLot?: (lotId: string) => void;
}

export const AuctionHouse: React.FC<AuctionHouseProps> = ({
  lots,
  playerMoney,
  playerEnergy = 100,
  skills,
  warehouse,
  currentWarehouseWeight,
  currentWarehouseSlots,
  onPlaceBid,
  onClaimLot,
  onGenerateNewLots,
  onInspectLot,
}) => {
  const [selectedLotId, setSelectedLotId] = useState<string>(lots[0]?.id || '');
  const [tierFilter, setTierFilter] = useState<'all' | 'small' | 'vehicles' | 'real_estate'>('all');

  const filteredLots = lots.filter((l) => {
    if (tierFilter === 'all') return true;
    return (l.tier || 'small') === tierFilter;
  });

  // Select first lot if none selected or not matching filter
  const activeLot = filteredLots.find((l) => l.id === selectedLotId) || filteredLots[0] || lots[0];

  const handleBid = (amountToAdd: number) => {
    if (!activeLot || activeLot.isCompleted) return;
    const newBid = activeLot.currentBid + amountToAdd;
    if (newBid > playerMoney) {
      alert('Недостаточно средств для этой ставки!');
      return;
    }
    sounds.playHammer();
    onPlaceBid(activeLot.id, newBid);
  };

  const getLotTotalWeight = (lot: AuctionLot) => {
    return lot.items.reduce((acc, it) => acc + it.weightKg, 0);
  };

  // Dynamic bid step calculation based on lot value
  const getBidSteps = (currentBid: number) => {
    if (currentBid >= 1500000) {
      return [50000, 100000, 250000];
    } else if (currentBid >= 150000) {
      return [10000, 25000, 50000];
    }
    return [1000, 3000, 5000];
  };

  const bidSteps = activeLot ? getBidSteps(activeLot.currentBid) : [1000, 3000, 5000];

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/40 border border-amber-900/30 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <Gavel className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              Банковские торги и банкротство
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Конфискат
              </span>
            </h2>
            <p className="text-xs text-neutral-400">
              Скупка залогового имущества, списаний компаний и арестованных активов оптовыми лотами.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playTap();
            onGenerateNewLots();
          }}
          className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold text-xs rounded-xl border border-neutral-700 transition cursor-pointer self-stretch sm:self-auto text-center"
        >
          Запросить новые лоты
        </button>
      </div>

      {/* Main Layout: List on left, Active bidding room on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Lots sidebar */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Лоты на торгах ({filteredLots.length})
            </h3>
          </div>

          {/* Tier Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setTierFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                tierFilter === 'all'
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => setTierFilter('small')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                tierFilter === 'small'
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              📦 Потреб-конфискат
            </button>
            <button
              onClick={() => setTierFilter('vehicles')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                tierFilter === 'vehicles'
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              🚗 Автопарк
            </button>
            <button
              onClick={() => setTierFilter('real_estate')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                tierFilter === 'real_estate'
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              🏢 Недвижимость
            </button>
          </div>

          {filteredLots.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center text-neutral-400">
              <p className="text-sm font-semibold text-neutral-300">В этой категории нет активных торгов</p>
              <p className="text-xs text-neutral-500 mt-1">Переключите фильтр или нажмите «Запросить новые лоты».</p>
            </div>
          ) : (
            filteredLots.map((lot) => {
              const isSelected = activeLot?.id === lot.id;
              const lotWeight = getLotTotalWeight(lot);
              const isWinning = lot.currentLeader === 'Вы (Игрок)';

              return (
                <div
                  key={lot.id}
                  onClick={() => {
                    sounds.playTap();
                    setSelectedLotId(lot.id);
                  }}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-neutral-850 border-amber-500/80 shadow-md ring-1 ring-amber-500/30'
                      : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-semibold text-amber-400 truncate max-w-[210px] block">
                      {lot.source}
                    </span>
                    {lot.isCompleted ? (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        lot.wonByPlayer
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        {lot.wonByPlayer ? 'Вы выиграли!' : 'Торги закрыты'}
                      </span>
                    ) : (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isWinning
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {lot.secondsLeft} сек
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-white text-xs sm:text-sm line-clamp-1 mb-1">
                    {lot.title}
                  </h4>

                  <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-neutral-800/80">
                    <div className="text-neutral-400">
                      Ставка: <span className="font-bold font-mono text-emerald-400">{lot.currentBid.toLocaleString('ru-RU')} ₽</span>
                    </div>
                    <div className="text-neutral-400 text-[11px] font-mono flex items-center gap-1">
                      <Weight className="w-3 h-3 text-neutral-500" />
                      {lotWeight.toFixed(1)} кг • {lot.items.length} поз.
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Lot Detail & Live Bidding Panel */}
        <div className="lg:col-span-7">
          {activeLot ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg space-y-4">
              {/* Header */}
              <div className="border-b border-neutral-800 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold text-amber-400">
                    🏛️ {activeLot.source}
                  </span>
                  {!activeLot.isCompleted && (
                    <div className="flex items-center gap-1.5 bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800 text-xs font-mono font-bold text-amber-400">
                      <Clock className="w-3.5 h-3.5 animate-pulse" />
                      <span>Осталось: {activeLot.secondsLeft} сек</span>
                    </div>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {activeLot.title}
                </h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  {activeLot.description}
                </p>
              </div>

              {/* Items Inside the Lot */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-sky-400" />
                  Содержимое лота ({activeLot.items.length} предметов):
                </h4>
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {activeLot.items.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1">
                        <span className="font-bold text-white block truncate">{item.name}</span>
                        <span className="text-[11px] text-neutral-400 truncate block">
                          {item.description}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-amber-400 font-mono font-bold block">
                          ~{item.currentMarketValue.toLocaleString('ru-RU')} ₽
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {item.weightKg} кг
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Summary Box */}
              <div className="bg-neutral-950 rounded-2xl p-4 border border-neutral-800 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-neutral-400 block">
                      Заявленная оценка
                    </span>
                    <span className="text-sm sm:text-base font-extrabold font-mono text-neutral-200">
                      ~{activeLot.estimatedValue.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-neutral-400 block">
                      Текущая ставка
                    </span>
                    <span className="text-base sm:text-lg font-black font-mono text-emerald-400">
                      {activeLot.currentBid.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[10px] uppercase font-semibold text-neutral-400 block">
                      Лидер торгов
                    </span>
                    <span className={`text-xs font-bold truncate block ${
                      activeLot.currentLeader === 'Вы (Игрок)' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {activeLot.currentLeader}
                    </span>
                  </div>
                </div>

                {/* Appraisal verification info or inspect button */}
                {activeLot.isAppraisalVerified ? (
                  <div className={`p-2.5 rounded-xl text-xs border flex items-center justify-between ${
                    (activeLot.actualMarketValue || activeLot.estimatedValue) > activeLot.estimatedValue
                      ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
                      : (activeLot.actualMarketValue || activeLot.estimatedValue) < activeLot.estimatedValue
                      ? 'bg-rose-950/40 border-rose-700/60 text-rose-300'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-300'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 shrink-0" />
                      <div>
                        <span className="font-bold block">
                          {(activeLot.actualMarketValue || activeLot.estimatedValue) > activeLot.estimatedValue
                            ? '💎 ДЖЕКПОТ (Оценка занижена приставами)'
                            : (activeLot.actualMarketValue || activeLot.estimatedValue) < activeLot.estimatedValue
                            ? '⚠️ ЛОВУШКА (Лот переоценен, реальная стоимость ниже)'
                            : 'Справедливая рыночная оценка'}
                        </span>
                        <span className="text-[11px] font-mono opacity-90">
                          Реальная стоимость лота: {(activeLot.actualMarketValue || activeLot.estimatedValue).toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-950/60 border border-neutral-800">
                      Проверено
                    </span>
                  </div>
                ) : (
                  onInspectLot && (
                    <button
                      onClick={() => onInspectLot(activeLot.id)}
                      disabled={playerEnergy < 8}
                      className="w-full py-2 px-3 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500/50 rounded-xl text-xs text-neutral-300 hover:text-amber-300 transition flex items-center justify-between cursor-pointer disabled:opacity-40"
                      title="Провести юридическую и техническую экспертизу лота"
                    >
                      <span className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>Экспертиза лота: проверить реальную рыночную стоимость</span>
                      </span>
                      <span className="text-[10px] text-amber-400 font-mono">-8 ⚡</span>
                    </button>
                  )
                )}
              </div>

              {/* Bidding Controls or Claim Box */}
              {activeLot.isCompleted ? (
                <div className="pt-2">
                  {activeLot.wonByPlayer ? (
                    <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-2xl p-4 text-center space-y-3">
                      <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
                        <CheckCircle className="w-5 h-5" />
                        <span>Поздравляем! Вы выиграли этот лот за {activeLot.currentBid.toLocaleString('ru-RU')} ₽</span>
                      </div>
                      <p className="text-xs text-neutral-300">
                        Товары готовы к перемещению на ваш склад (Общий вес: {getLotTotalWeight(activeLot).toFixed(1)} кг).
                      </p>
                      <button
                        onClick={() => {
                          sounds.playCash();
                          onClaimLot(activeLot.id);
                        }}
                        className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs sm:text-sm rounded-xl transition shadow-lg cursor-pointer"
                      >
                        Забрать товары на склад
                      </button>
                    </div>
                  ) : (
                    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-center text-neutral-400 text-xs">
                      Аукцион завершен. Победил участник <strong>{activeLot.currentLeader}</strong> со ставкой {activeLot.currentBid.toLocaleString('ru-RU')} ₽.
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>Сделать шаг ставки:</span>
                    <span>Ваш баланс: <strong className="text-emerald-400 font-mono">{playerMoney.toLocaleString('ru-RU')} ₽</strong></span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleBid(bidSteps[0])}
                      disabled={playerMoney < activeLot.currentBid + bidSteps[0]}
                      className="px-3 py-2.5 bg-neutral-800 hover:bg-neutral-750 disabled:opacity-40 text-white font-bold text-xs rounded-xl border border-neutral-700 transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      <span>+{bidSteps[0].toLocaleString('ru-RU')} ₽</span>
                    </button>

                    <button
                      onClick={() => handleBid(bidSteps[1])}
                      disabled={playerMoney < activeLot.currentBid + bidSteps[1]}
                      className="px-3 py-2.5 bg-neutral-800 hover:bg-neutral-750 disabled:opacity-40 text-white font-bold text-xs rounded-xl border border-neutral-700 transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      <span>+{bidSteps[1].toLocaleString('ru-RU')} ₽</span>
                    </button>

                    <button
                      onClick={() => handleBid(bidSteps[2])}
                      disabled={playerMoney < activeLot.currentBid + bidSteps[2]}
                      className="px-3 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-neutral-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-1 shadow-md cursor-pointer"
                    >
                      <Gavel className="w-3.5 h-3.5" />
                      <span>+{bidSteps[2].toLocaleString('ru-RU')} ₽</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center text-neutral-500">
              Выберите лот из списка слева для участия в торгах.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
