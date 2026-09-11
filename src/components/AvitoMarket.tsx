import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MessageSquare, 
  ShoppingCart, 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  Laptop, 
  Smartphone, 
  Radio, 
  Wrench, 
  Package, 
  RefreshCw,
  Sparkles,
  Zap,
  Flame,
  Weight,
  Car,
  Shirt,
  Tv,
  ChevronDown,
  ChevronUp,
  Target
} from 'lucide-react';
import { Item, ItemCategory, Skills, WarehouseLevel, MarketTrend } from '../types/game';
import { CATEGORY_NAMES } from '../data/initialData';
import { sounds } from '../utils/audio';
import { TradeFocusSelector } from './TradeFocusSelector';

interface AvitoMarketProps {
  items: Item[];
  playerMoney: number;
  playerEnergy: number;
  skills: Skills;
  warehouse: WarehouseLevel;
  currentWarehouseWeight: number;
  currentWarehouseSlots: number;
  specialization?: ItemCategory | 'all';
  trends: MarketTrend[];
  onSelectSpecialization?: (spec: ItemCategory | 'all') => void;
  onBuyInstant: (item: Item) => void;
  onStartNegotiation: (item: Item) => void;
  onInspectItem: (itemId: string) => void;
  onRefreshFeed: () => void;
}

export const AvitoMarket: React.FC<AvitoMarketProps> = ({
  items,
  playerMoney,
  playerEnergy,
  skills,
  warehouse,
  currentWarehouseWeight,
  currentWarehouseSlots,
  specialization = 'all',
  trends,
  onSelectSpecialization,
  onBuyInstant,
  onStartNegotiation,
  onInspectItem,
  onRefreshFeed,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyUnderpriced, setOnlyUnderpriced] = useState<boolean>(false);
  const [showFocusSelector, setShowFocusSelector] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<'default' | 'profit' | 'price_asc' | 'price_desc'>('default');
  const [displayCount, setDisplayCount] = useState<number>(18);

  const getCategoryIcon = (category: ItemCategory) => {
    switch (category) {
      case 'gpus': return <Cpu className="w-5 h-5 text-purple-400" />;
      case 'computers': return <Laptop className="w-5 h-5 text-blue-400" />;
      case 'smartphones': return <Smartphone className="w-5 h-5 text-emerald-400" />;
      case 'auto_parts': return <Car className="w-5 h-5 text-orange-400" />;
      case 'clothes_fashion': return <Shirt className="w-5 h-5 text-rose-400" />;
      case 'appliances': return <Tv className="w-5 h-5 text-pink-400" />;
      case 'audio_retro': return <Radio className="w-5 h-5 text-amber-400" />;
      case 'tools_equipment': return <Wrench className="w-5 h-5 text-yellow-400" />;
      case 'wholesale_junk': return <Package className="w-5 h-5 text-red-400" />;
      default: return <Package className="w-5 h-5 text-neutral-400" />;
    }
  };

  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase()) && !item.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (onlyUnderpriced) {
      const askingPrice = item.boughtPrice || item.baseValue;
      if (askingPrice >= item.currentMarketValue) return false;
    }
    return true;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    const priceA = a.boughtPrice || a.baseValue;
    const priceB = b.boughtPrice || b.baseValue;
    const profitA = a.currentMarketValue - priceA;
    const profitB = b.currentMarketValue - priceB;

    if (sortOrder === 'profit') return profitB - profitA;
    if (sortOrder === 'price_asc') return priceA - priceB;
    if (sortOrder === 'price_desc') return priceB - priceA;
    return 0; // default feed order
  });

  const displayedItems = sortedItems.slice(0, displayCount);

  const getConditionBadge = (condition: Item['condition']) => {
    switch (condition) {
      case 'mint':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">Идеал / Пломбы</span>;
      case 'good':
        return <span className="bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">Рабочий</span>;
      case 'worn':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">Потертый</span>;
      case 'trash':
        return <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">На запчасти / Труп</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Interactive Trend & Niche Focus Selector */}
      {onSelectSpecialization && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setShowFocusSelector(!showFocusSelector)}
              className="text-xs font-bold text-neutral-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
            >
              <Target className="w-4 h-4 text-amber-400" />
              <span>Тренды рынка и специализация темщика</span>
              {showFocusSelector ? (
                <ChevronUp className="w-3.5 h-3.5 text-neutral-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
              )}
            </button>
            <span className="text-[11px] text-amber-400/90 font-medium">
              Спец: {specialization === 'all' ? 'Универсал' : CATEGORY_NAMES[specialization]?.label} (+15% торг)
            </span>
          </div>

          {showFocusSelector && (
            <TradeFocusSelector
              specialization={specialization}
              trends={trends}
              onSelectSpecialization={onSelectSpecialization}
              onFilterByCategory={(cat) => setSelectedCategory(cat)}
              activeFilterCategory={selectedCategory}
            />
          )}
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск по объявлениям (iPhone, шины, Nokian, Jordan, Dyson, RTX...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* Quick Filters and Refresh */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOnlyUnderpriced(!onlyUnderpriced)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                onlyUnderpriced
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Ниже рынка</span>
            </button>

            <button
              onClick={() => {
                sounds.playTap();
                onRefreshFeed();
              }}
              className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl border border-neutral-700 transition cursor-pointer"
              title="Обновить ленту объявлений (новые продавцы с учетом твоей специализации)"
            >
              <RefreshCw className="w-4 h-4 text-neutral-300" />
            </button>
          </div>
        </div>

        {/* Categories Pills - cleanly wrapped, NO horizontal scrollbar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-750'
            }`}
          >
            Все ({items.length})
          </button>
          {Object.entries(CATEGORY_NAMES).map(([key, value]) => {
            const count = items.filter((it) => it.category === key).length;
            const isMySpecialization = specialization === key;

            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === key
                    ? 'bg-amber-500 text-neutral-950 shadow-sm font-bold'
                    : isMySpecialization
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                    : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-750'
                }`}
              >
                {isMySpecialization && <Sparkles className="w-3 h-3 text-amber-400" />}
                <span>{value.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === key ? 'bg-neutral-900 text-amber-400' : 'bg-neutral-900/60 text-neutral-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sub-bar: Sorting & Counter */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Сортировка:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="bg-neutral-950 border border-neutral-700/80 rounded-lg px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="default">Лента Авито (по умолчанию)</option>
              <option value="profit">Максимальная маржа</option>
              <option value="price_asc">Сначала дешевые</option>
              <option value="price_desc">Сначала дорогие</option>
            </select>
          </div>

          <div className="text-neutral-400 font-mono text-[11px]">
            Найдено: <strong className="text-amber-400">{filteredItems.length}</strong> объявлений (показано {displayedItems.length})
          </div>
        </div>
      </div>

      {/* Feed list */}
      {filteredItems.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center text-neutral-400">
          <p className="text-base font-semibold text-neutral-300 mb-1">Объявлений не найдено</p>
          <p className="text-xs text-neutral-500 mb-4">Попробуйте изменить категорию или нажмите кнопку обновить ленту.</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              onRefreshFeed();
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Сбросить фильтры и обновить
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {displayedItems.map((item) => {
              const askingPrice = item.boughtPrice || item.baseValue;
              const isAffordable = playerMoney >= askingPrice;
              const hasSpace =
                currentWarehouseWeight + item.weightKg <= warehouse.maxWeightKg &&
                currentWarehouseSlots < warehouse.maxSlots;

              // Profit estimate preview
              const potentialProfit = item.currentMarketValue - askingPrice;
              const isItemSpecialized = specialization !== 'all' && specialization === item.category;

              return (
                <div
                  key={item.id}
                  className={`bg-neutral-900 border rounded-2xl p-4 shadow-sm flex flex-col justify-between transition group relative ${
                    isItemSpecialized
                      ? 'border-amber-500/60 bg-gradient-to-b from-neutral-900 to-amber-950/10'
                      : 'border-neutral-800 hover:border-neutral-700/80'
                  }`}
                >
                  {/* Specialization Badge */}
                  {isItemSpecialized && (
                    <div className="absolute -top-2.5 right-3 bg-amber-500 text-neutral-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3 h-3 stroke-[3]" />
                      Твой профиль (+15% торг)
                    </div>
                  )}

                  {/* Card Top */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0 shadow-inner">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm sm:text-base leading-snug group-hover:text-amber-300 transition">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            {getConditionBadge(item.condition)}
                            <span className="text-[11px] text-neutral-400 flex items-center gap-1 font-mono">
                              <Weight className="w-3 h-3 text-neutral-500" />
                              {item.weightKg} кг
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description & Seller remark */}
                    <p className="text-xs text-neutral-300 line-clamp-2 mb-2 italic">
                      «{item.description}»
                    </p>

                    {item.sellerNotes && (
                      <div className="inline-block bg-neutral-950 px-2 py-0.5 rounded text-[11px] text-neutral-400 border border-neutral-800 mb-3">
                        👤 {item.sellerNotes}
                      </div>
                    )}

                    {/* Defect or Scam Status */}
                    {item.isDefectDiscovered ? (
                      item.isScam ? (
                        <div className="p-2.5 rounded-xl text-xs flex items-start gap-2 mb-3 border bg-rose-950/60 border-rose-600/70 text-rose-200 shadow-sm">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                          <div>
                            <strong className="block text-rose-300 font-bold uppercase tracking-wider text-[10px]">🚨 ОСТОРОЖНО: СКАМ / ПОДДЕЛКА!</strong>
                            <span className="text-[11px] text-rose-200">{item.scamReason}</span>
                            <div className="mt-1 text-[10px] text-rose-400 font-mono">
                              Реальная цена муляжа: <strong>{item.scamRealValue?.toLocaleString('ru-RU')} ₽</strong>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className={`p-2 rounded-xl text-xs flex items-center gap-2 mb-3 border ${
                          item.hiddenDefect 
                            ? 'bg-rose-950/30 border-rose-800/50 text-rose-300' 
                            : 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                        }`}>
                          {item.hiddenDefect ? (
                            <>
                              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                              <span>Дефект: <strong>{item.hiddenDefect}</strong></span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                              <span>Дефектов не обнаружено. Чистый оригинал.</span>
                            </>
                          )}
                        </div>
                      )
                    ) : (
                      <button
                        onClick={() => onInspectItem(item.id)}
                        disabled={playerEnergy < 5}
                        className="w-full text-left p-1.5 mb-3 rounded-lg bg-neutral-950 hover:bg-neutral-800/60 border border-neutral-800 text-[11px] text-neutral-400 hover:text-sky-300 transition flex items-center justify-between cursor-pointer disabled:opacity-40"
                      >
                        <span className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-sky-400" />
                          Осмотреть товар (Глаз-алмаз ур.{skills.assessment})
                        </span>
                        <span className="text-neutral-500 flex items-center gap-0.5 text-[10px]">
                          -5 <Zap className="w-3 h-3 text-amber-400" />
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Price & Actions Box */}
                  <div className="pt-3 border-t border-neutral-800/80 flex flex-col gap-2.5">
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">
                          Цена продавца
                        </span>
                        <span className="text-lg font-black text-amber-400 font-mono">
                          {askingPrice.toLocaleString('ru-RU')} ₽
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">
                          Оценка рынка
                        </span>
                        <span className="text-xs font-mono font-bold text-neutral-300">
                          ~{item.currentMarketValue.toLocaleString('ru-RU')} ₽
                        </span>
                        {potentialProfit > 0 && (
                          <span className="text-[10px] font-mono text-emerald-400 block font-bold">
                            +{potentialProfit.toLocaleString('ru-RU')} ₽
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Buy / Negotiate Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          sounds.playTap();
                          onStartNegotiation(item);
                        }}
                        className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold text-xs rounded-xl border border-neutral-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Торговаться</span>
                      </button>

                      <button
                        onClick={() => {
                          sounds.playCash();
                          onBuyInstant(item);
                        }}
                        disabled={!isAffordable || !hasSpace}
                        className={`px-3 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
                          !isAffordable || !hasSpace
                            ? 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold'
                        }`}
                        title={
                          !isAffordable
                            ? 'Недостаточно денег'
                            : !hasSpace
                            ? 'На складе нет места или перевес'
                            : 'Купить сразу без торга'
                        }
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>
                          {!isAffordable ? 'Нет денег' : !hasSpace ? 'Склад полон' : 'Купить сразу'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination / Load More Button for 50+ items */}
          {displayedItems.length < sortedItems.length && (
            <div className="text-center pt-2 pb-2">
              <button
                onClick={() => setDisplayCount((prev) => prev + 18)}
                className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-amber-400 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer shadow-sm inline-flex items-center gap-2"
              >
                <span>Показать еще 18 объявлений</span>
                <span className="text-[11px] text-neutral-400 font-mono">
                  (Осталось {sortedItems.length - displayedItems.length} из {sortedItems.length})
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
