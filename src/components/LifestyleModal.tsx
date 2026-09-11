import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Car, 
  Home, 
  Flame, 
  Laptop, 
  Check, 
  Heart, 
  Coffee, 
  Zap, 
  Award, 
  Shield, 
  Watch, 
  Smartphone,
  Crown,
  TrendingUp,
  Building,
  Building2
} from 'lucide-react';
import { CharacterStats, FlexItem } from '../types/game';
import { LIFESTYLE_ITEMS, getCharacterTitle } from '../data/lifestyleData';
import { sounds } from '../utils/audio';

interface LifestyleModalProps {
  playerMoney: number;
  playerEnergy: number;
  character: CharacterStats;
  onClose: () => void;
  onBuyFlex: (item: FlexItem) => void;
}

type TabType = 'fun' | 'gear' | 'cars' | 'real_estate';

export const LifestyleModal: React.FC<LifestyleModalProps> = ({
  playerMoney,
  playerEnergy,
  character,
  onClose,
  onBuyFlex,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('fun');
  const currentTitle = getCharacterTitle(character.aura);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coffee': return <Coffee className="w-5 h-5 text-amber-600" />;
      case 'Flame': return <Flame className="w-5 h-5 text-orange-500" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'Heart': return <Heart className="w-5 h-5 text-rose-500" />;
      case 'Zap': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'Smartphone': return <Smartphone className="w-5 h-5 text-slate-700" />;
      case 'Laptop': return <Laptop className="w-5 h-5 text-blue-600" />;
      case 'Award': return <Award className="w-5 h-5 text-amber-600" />;
      case 'Shield': return <Shield className="w-5 h-5 text-emerald-600" />;
      case 'Watch': return <Watch className="w-5 h-5 text-yellow-600" />;
      case 'Car': return <Car className="w-5 h-5 text-indigo-600" />;
      case 'Home': return <Home className="w-5 h-5 text-emerald-600" />;
      case 'Building': return <Building className="w-5 h-5 text-sky-600" />;
      case 'Building2': return <Building2 className="w-5 h-5 text-purple-600" />;
      default: return <Sparkles className="w-5 h-5 text-amber-500" />;
    }
  };

  const isPurchased = (item: FlexItem) => {
    if (item.isRepeatable) return false;
    if (item.category === 'cars') return character.ownedCars.includes(item.id);
    if (item.category === 'real_estate') return character.ownedProperties.includes(item.id);
    return character.purchasedItems.includes(item.id);
  };

  const filteredItems = LIFESTYLE_ITEMS.filter((it) => it.category === activeTab);

  const handlePurchase = (item: FlexItem) => {
    if (playerMoney < item.cost) {
      alert('Недостаточно денег на балансе! Заработай еще на сделках.');
      return;
    }
    if (isPurchased(item)) {
      return;
    }
    sounds.playCash();
    onBuyFlex(item);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-3xl shadow-inner">
                😎
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5" /> Характеристики темщика
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {currentTitle}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Спускай заработанные деньги на роскошь, поднимай авторитет и открывай новый уровень жизни!
                </p>
              </div>
            </div>

            {/* Stat Counters */}
            <div className="flex flex-wrap items-center gap-3 self-stretch sm:self-auto">
              <div className="bg-white/10 border border-white/10 rounded-xl px-3 py-2 flex-1 sm:flex-none">
                <div className="text-[11px] text-slate-300 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-400" /> Авторитет
                </div>
                <div className="text-lg font-bold text-amber-300">
                  {character.aura} <span className="text-xs text-amber-200/70 font-normal">pts</span>
                </div>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-xl px-3 py-2 flex-1 sm:flex-none">
                <div className="text-[11px] text-slate-300 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-400" /> Запас сил
                </div>
                <div className="text-lg font-bold text-yellow-300">
                  {playerEnergy} <span className="text-xs text-yellow-200/70 font-normal">/ {character.maxEnergy}</span>
                </div>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-xl px-3 py-2 flex-1 sm:flex-none">
                <div className="text-[11px] text-slate-300 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" /> Спущено на кайфы
                </div>
                <div className="text-lg font-bold text-emerald-300">
                  {character.totalSpentOnFlex.toLocaleString('ru-RU')} ₽
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('fun')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'fun'
                ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Flame className="w-4 h-4 text-orange-500" />
            Кайфы и развлечения
          </button>

          <button
            onClick={() => setActiveTab('gear')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'gear'
                ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Laptop className="w-4 h-4 text-blue-500" />
            Сетап и блатные вещи
          </button>

          <button
            onClick={() => setActiveTab('cars')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'cars'
                ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Car className="w-4 h-4 text-indigo-600" />
            Личный автопарк ({character.ownedCars.length})
          </button>

          <button
            onClick={() => setActiveTab('real_estate')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'real_estate'
                ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Home className="w-4 h-4 text-emerald-600" />
            Недвижимость ({character.ownedProperties.length})
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => {
              const bought = isPurchased(item);
              const canAfford = playerMoney >= item.cost;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl border p-4 flex flex-col justify-between transition-all ${
                    bought 
                      ? 'border-emerald-200 bg-emerald-50/20' 
                      : 'border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/80">
                          {getIcon(item.icon)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 text-sm leading-snug">
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold text-indigo-600">
                              {item.cost.toLocaleString('ru-RU')} ₽
                            </span>
                            {item.isRepeatable && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                                Повторяемое
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {bought && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full shrink-0">
                          <Check className="w-3 h-3" /> В собственности
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-2">
                      {item.description}
                    </p>

                    <blockquote className="text-[11px] italic text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 mb-3">
                      {item.flavor}
                    </blockquote>

                    {/* Bonuses */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <div className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 font-medium px-2 py-0.5 rounded-md border border-amber-200/50">
                        <Flame className="w-3 h-3 text-amber-500" />
                        +{item.auraBonus} Авторитета
                      </div>

                      {item.energyBonus && (
                        <div className="inline-flex items-center gap-1 text-xs bg-yellow-50 text-yellow-700 font-medium px-2 py-0.5 rounded-md border border-yellow-200/50">
                          <Zap className="w-3 h-3 text-yellow-500" />
                          +{item.energyBonus} Энергии
                        </div>
                      )}

                      {item.maxEnergyBonus && (
                        <div className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded-md border border-emerald-200/50">
                          <Zap className="w-3 h-3 text-emerald-500" />
                          +{item.maxEnergyBonus} к макс. запасу сил
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Purchase Action Button */}
                  <div>
                    {bought ? (
                      <button
                        disabled
                        className="w-full py-2 px-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-default"
                      >
                        <Check className="w-4 h-4" /> Приобретено
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePurchase(item)}
                        disabled={!canAfford}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                          canAfford
                            ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        {item.isRepeatable ? 'Купить и кайфануть' : 'Купить в собственность'} ({item.cost.toLocaleString('ru-RU')} ₽)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-white p-4 px-6 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Баланс: <span className="font-bold text-slate-900">{playerMoney.toLocaleString('ru-RU')} ₽</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Вернуться к делам
          </button>
        </div>

      </div>
    </div>
  );
};
