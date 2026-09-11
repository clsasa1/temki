import React, { useState } from 'react';
import { 
  X, 
  Coins, 
  Zap, 
  Briefcase, 
  TrendingUp, 
  CheckCircle2, 
  Warehouse, 
  Cpu, 
  Store, 
  Package, 
  Wrench, 
  Laptop, 
  Car, 
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { PassiveBusiness, SideGig } from '../types/game';
import { SIDE_GIGS } from '../data/initialData';
import { sounds } from '../utils/audio';

interface PassiveIncomeModalProps {
  playerMoney: number;
  playerEnergy: number;
  businesses: PassiveBusiness[];
  onBuyBusiness: (business: PassiveBusiness) => void;
  onDoSideGig: (gig: SideGig) => void;
  onClose: () => void;
}

export const PassiveIncomeModal: React.FC<PassiveIncomeModalProps> = ({
  playerMoney,
  playerEnergy,
  businesses,
  onBuyBusiness,
  onDoSideGig,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'passive' | 'gigs'>('passive');
  const [lastGigMessage, setLastGigMessage] = useState<string | null>(null);

  const totalPassiveIncome = businesses
    .filter((b) => b.isUnlocked)
    .reduce((sum, b) => sum + b.dailyIncome, 0);

  const getBusinessIcon = (iconName: string) => {
    switch (iconName) {
      case 'Warehouse': return <Warehouse className="w-5 h-5 text-amber-400" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'Store': return <Store className="w-5 h-5 text-emerald-400" />;
      case 'Package': return <Package className="w-5 h-5 text-indigo-400" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-violet-400" />;
      case 'Zap': return <Zap className="w-5 h-5 text-yellow-400" />;
      default: return <Coins className="w-5 h-5 text-amber-400" />;
    }
  };

  const getGigIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wrench': return <Wrench className="w-5 h-5 text-amber-400" />;
      case 'Laptop': return <Laptop className="w-5 h-5 text-sky-400" />;
      case 'Car': return <Car className="w-5 h-5 text-emerald-400" />;
      case 'DollarSign': return <DollarSign className="w-5 h-5 text-yellow-400" />;
      default: return <Zap className="w-5 h-5 text-amber-400" />;
    }
  };

  const handleGigExecute = (gig: SideGig) => {
    if (playerEnergy < gig.energyCost) {
      alert('Недостаточно энергии! Отдохните или ложитесь спать.');
      return;
    }
    sounds.playCash();
    onDoSideGig(gig);
    setLastGigMessage(`+${gig.reward.toLocaleString('ru-RU')} ₽ получено за «${gig.title}»!`);
    setTimeout(() => setLastGigMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-neutral-800/95 border-b border-neutral-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-white text-base sm:text-lg flex items-center gap-2">
                Пассивный доход & Калым
              </h3>
              <p className="text-xs text-neutral-400">
                Запускайте сторонние темки для ежедневного кэша или подрабатывайте на калымах.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats banner */}
        <div className="px-5 py-3 bg-neutral-950 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Текущий пассивный доход:</span>
            <span className="text-emerald-400 font-mono font-black text-sm">
              +{totalPassiveIncome.toLocaleString('ru-RU')} ₽ / день
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span>Баланс: <strong className="text-white font-bold">{playerMoney.toLocaleString('ru-RU')} ₽</strong></span>
            <span className="flex items-center gap-1">
              Энергия: <strong className="text-amber-400 font-bold">{playerEnergy}%</strong>
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-900 px-5 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('passive')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'passive'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Пассивные активы ({businesses.filter(b => b.isUnlocked).length}/{businesses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('gigs')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'gigs'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Быстрый калым (Если 0 ₽)</span>
          </button>
        </div>

        {/* Success toast message */}
        {lastGigMessage && (
          <div className="mx-5 mt-3 p-2.5 bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs font-bold rounded-xl text-center animate-in fade-in">
            {lastGigMessage}
          </div>
        )}

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-3 bg-neutral-900/60 flex-1">
          {activeTab === 'passive' ? (
            <div className="space-y-3">
              <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 text-xs text-neutral-400 leading-relaxed">
                💡 <strong className="text-neutral-200">Как это работает:</strong> Купленные темки приносят стабильный пассивный доход каждое утро, когда вы нажимаете <strong>«Следующий день»</strong>. Даже если на балансе 0 ₽, вы никогда не останетесь без оборотных средств!
              </div>

              {businesses.map((biz) => {
                const canAfford = playerMoney >= biz.cost;

                return (
                  <div
                    key={biz.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                      biz.isUnlocked
                        ? 'bg-neutral-950/90 border-emerald-900/60'
                        : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center shrink-0">
                        {getBusinessIcon(biz.icon)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">{biz.name}</h4>
                          <span className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400 font-mono">
                            {biz.category}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {biz.description}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs font-mono">
                          <span className="text-emerald-400 font-bold">
                            +{biz.dailyIncome.toLocaleString('ru-RU')} ₽ / день
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center self-end sm:self-center">
                      {biz.isUnlocked ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-xl">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Работает</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            sounds.playSuccess();
                            onBuyBusiness(biz);
                          }}
                          disabled={!canAfford}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                            canAfford
                              ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md'
                              : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                          }`}
                        >
                          <span>Запустить</span>
                          <span className="font-mono bg-neutral-950/40 px-1.5 py-0.5 rounded text-[11px]">
                            {biz.cost.toLocaleString('ru-RU')} ₽
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 text-xs text-neutral-400 leading-relaxed">
                ⚡ <strong className="text-neutral-200">Срочная подработка:</strong> Спустили все деньги на улучшения или неудачную сделку? Не беда! Выполняйте быстрые калымы, чтобы моментально получить живые наличные в обмен на энергию.
              </div>

              {SIDE_GIGS.map((gig) => {
                const canDo = playerEnergy >= gig.energyCost;

                return (
                  <div
                    key={gig.id}
                    className="p-4 rounded-xl border bg-neutral-950 border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-neutral-700 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center shrink-0">
                        {getGigIcon(gig.icon)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{gig.title}</h4>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {gig.description}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs font-mono">
                          <span className="text-emerald-400 font-bold">
                            +{gig.reward.toLocaleString('ru-RU')} ₽ наличными
                          </span>
                          <span className="text-neutral-500 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-400" />
                            {gig.energyCost}% энергии
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleGigExecute(gig)}
                      disabled={!canDo}
                      className={`shrink-0 self-end sm:self-center px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                        canDo
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-md'
                          : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Сделать калым</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
