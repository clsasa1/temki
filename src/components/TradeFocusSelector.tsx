import React from 'react';
import { 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target, 
  Check, 
  Zap, 
  Car, 
  Shirt, 
  Tv, 
  Smartphone, 
  Laptop, 
  Cpu, 
  Radio, 
  Wrench, 
  Package,
  Layers,
  Sparkles
} from 'lucide-react';
import { ItemCategory, MarketTrend } from '../types/game';
import { CATEGORY_NAMES } from '../data/initialData';
import { sounds } from '../utils/audio';

interface TradeFocusSelectorProps {
  specialization: ItemCategory | 'all';
  trends: MarketTrend[];
  onSelectSpecialization: (spec: ItemCategory | 'all') => void;
  onFilterByCategory: (category: ItemCategory | 'all') => void;
  activeFilterCategory: string;
}

interface NicheOption {
  id: ItemCategory | 'all';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tag: string;
}

export const TradeFocusSelector: React.FC<TradeFocusSelectorProps> = ({
  specialization,
  trends,
  onSelectSpecialization,
  onFilterByCategory,
  activeFilterCategory,
}) => {
  const niches: NicheOption[] = [
    {
      id: 'all',
      title: 'Универсальный темщик',
      subtitle: 'Беру всё подряд, от видеокарт до старых шин',
      icon: <Layers className="w-4 h-4 text-amber-400" />,
      tag: 'Баланс',
    },
    {
      id: 'auto_parts',
      title: 'Автоперекуп: шины и диски',
      subtitle: 'Nokian, Michelin, ковка ВСМПО, турбины, автозвук',
      icon: <Car className="w-4 h-4 text-orange-400" />,
      tag: 'Сезонный бум',
    },
    {
      id: 'clothes_fashion',
      title: 'Шмоточник и ресейлер',
      subtitle: 'Nike Jordan, The North Face, Stone Island, винтаж',
      icon: <Shirt className="w-4 h-4 text-rose-400" />,
      tag: 'Хайп & Маржа',
    },
    {
      id: 'smartphones',
      title: 'Яблочник & Гаджеты',
      subtitle: 'iPhone 15 Pro, Galaxy Ultra, AirPods Pro, Apple Watch',
      icon: <Smartphone className="w-4 h-4 text-emerald-400" />,
      tag: 'Быстрый оборот',
    },
    {
      id: 'appliances',
      title: 'Бытовая техника & Дайсоны',
      subtitle: 'Фены Dyson Supersonic, кофемашины, роботы-пылесосы',
      icon: <Tv className="w-4 h-4 text-pink-400" />,
      tag: 'Высокий средний чек',
    },
    {
      id: 'computers',
      title: 'ПК-боярин & Ноуты',
      subtitle: 'Steam Deck, ThinkPad, игровые сборки и ноутбуки',
      icon: <Laptop className="w-4 h-4 text-blue-400" />,
      tag: 'Стабильно',
    },
    {
      id: 'gpus',
      title: 'Майнинг & Видеокарты',
      subtitle: 'RTX 4080, 3060, RX 580, фермы и видеочипы',
      icon: <Cpu className="w-4 h-4 text-purple-400" />,
      tag: 'Волатильно',
    },
    {
      id: 'tools_equipment',
      title: 'Специнструмент & Приборы',
      subtitle: 'Осциллографы, паяльные станции, перфораторы',
      icon: <Wrench className="w-4 h-4 text-yellow-400" />,
      tag: 'Для профи',
    },
    {
      id: 'wholesale_junk',
      title: 'Конфискат & Банковские партии',
      subtitle: 'Оптовые залоговые партии со складов и ликвидаций',
      icon: <Package className="w-4 h-4 text-red-400" />,
      tag: 'Тяжелый опт',
    },
  ];

  // Find hottest category right now
  const sortedTrends = [...trends].sort((a, b) => b.multiplier - a.multiplier);
  const hottestTrend = sortedTrends[0];
  const lowestTrend = sortedTrends[sortedTrends.length - 1];

  const handleSelectHottest = () => {
    if (hottestTrend) {
      sounds.playTap();
      onSelectSpecialization(hottestTrend.category);
      onFilterByCategory(hottestTrend.category);
    }
  };

  const currentSpecializationName = niches.find((n) => n.id === specialization)?.title || 'Все подряд';

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-sm sm:text-base">
                Выбор специализации и тренды торговли
              </h3>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                ВЫБИРАЛКА
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Чем торгуем сегодня? Выберите специализацию для бонуса к торгам (+15% к переговорам в выбранной нише).
            </p>
          </div>
        </div>

        {/* Hot Trend Quick Action Button */}
        {hottestTrend && (
          <button
            onClick={handleSelectHottest}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-600/30 to-rose-600/30 hover:from-amber-600/50 hover:to-rose-600/50 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0"
            title="Автоматически сфокусироваться на самом прибыльном товаре дня"
          >
            <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
            <div className="text-left">
              <div className="text-[10px] text-neutral-400 uppercase leading-none">Хит дня:</div>
              <div className="leading-tight text-white">{hottestTrend.categoryName} (+{Math.round((hottestTrend.multiplier - 1) * 100)}%)</div>
            </div>
          </button>
        )}
      </div>

      {/* Market Radar Ticker */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {/* Highest trend highlight */}
        {hottestTrend && (
          <div className="bg-neutral-950 border border-emerald-500/30 p-2.5 rounded-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-emerald-400 font-bold block uppercase tracking-wider">
                  🔥 Топ-хайп (Сверхспрос)
                </span>
                <span className="text-xs font-semibold text-white truncate block">
                  {hottestTrend.categoryName}
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-black text-emerald-400 shrink-0 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
              +{Math.round((hottestTrend.multiplier - 1) * 100)}%
            </span>
          </div>
        )}

        {/* Lowest trend highlight (great for buying on the dip) */}
        {lowestTrend && (
          <div className="bg-neutral-950 border border-rose-500/30 p-2.5 rounded-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-rose-400 font-bold block uppercase tracking-wider">
                  📉 Дно рынка (Скупай дешево!)
                </span>
                <span className="text-xs font-semibold text-white truncate block">
                  {lowestTrend.categoryName}
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-black text-rose-400 shrink-0 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/50">
              {Math.round((lowestTrend.multiplier - 1) * 100)}%
            </span>
          </div>
        )}

        {/* Current Active Specialization Status */}
        <div className="bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl flex items-center justify-between gap-2 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider">
                Твой активный фокус
              </span>
              <span className="text-xs font-semibold text-white truncate block">
                {currentSpecializationName}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-bold text-neutral-300 shrink-0 bg-neutral-800 px-2 py-0.5 rounded border border-neutral-700">
            +15% скил торга
          </span>
        </div>
      </div>

      {/* Selectable Niches Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {niches.map((niche) => {
          const isSelected = specialization === niche.id;
          const trendObj = niche.id !== 'all' ? trends.find((t) => t.category === niche.id) : null;
          const trendPercent = trendObj ? Math.round((trendObj.multiplier - 1) * 100) : null;

          return (
            <div
              key={niche.id}
              onClick={() => {
                sounds.playTap();
                onSelectSpecialization(niche.id);
              }}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 relative group ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-500/70 shadow-sm shadow-amber-500/10'
                  : 'bg-neutral-950/80 hover:bg-neutral-800/80 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg border ${
                      isSelected 
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                        : 'bg-neutral-800 border-neutral-700 text-neutral-300'
                    }`}>
                      {niche.icon}
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold leading-tight ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                        {niche.title}
                      </h4>
                      <span className="text-[10px] text-neutral-400 block font-medium">
                        {niche.tag}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1">
                  {niche.subtitle}
                </p>
              </div>

              {/* Bottom trend & filter trigger */}
              <div className="pt-2 border-t border-neutral-800/70 flex items-center justify-between text-[11px]">
                {trendPercent !== null ? (
                  <span className={`font-mono font-bold flex items-center gap-0.5 ${
                    trendPercent > 0 ? 'text-emerald-400' : trendPercent < 0 ? 'text-rose-400' : 'text-neutral-400'
                  }`}>
                    {trendPercent > 0 ? `+${trendPercent}%` : `${trendPercent}%`} тренд
                  </span>
                ) : (
                  <span className="text-neutral-500 font-mono">Все рынки</span>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sounds.playTap();
                    onFilterByCategory(niche.id);
                  }}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded transition ${
                    activeFilterCategory === niche.id
                      ? 'bg-amber-500 text-neutral-950'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                  }`}
                  title="Показать только эти товары в ленте Авито"
                >
                  {activeFilterCategory === niche.id ? 'В ленте' : 'Фильтр ленты'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
