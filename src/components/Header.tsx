import React from 'react';
import { 
  Wallet, 
  Sun, 
  Moon, 
  Zap, 
  Star, 
  Package, 
  Volume2, 
  VolumeX, 
  TrendingUp, 
  Award,
  AlertCircle,
  Coins,
  Flame
} from 'lucide-react';
import { GameState, WarehouseLevel } from '../types/game';
import { sounds } from '../utils/audio';

interface HeaderProps {
  state: GameState;
  warehouse: WarehouseLevel;
  totalWeight: number;
  onEndDay: () => void;
  onOpenTrends: () => void;
  onOpenReviews: () => void;
  onOpenSkills: () => void;
  onOpenPassiveIncome: () => void;
  onOpenLifestyle: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  warehouse,
  totalWeight,
  onEndDay,
  onOpenTrends,
  onOpenReviews,
  onOpenSkills,
  onOpenPassiveIncome,
  onOpenLifestyle,
  soundEnabled,
  onToggleSound,
}) => {
  const isWeightOverloaded = totalWeight > warehouse.maxWeightKg;
  const isSlotsFull = state.inventory.length >= warehouse.maxSlots;
  const maxEnergy = state.character?.maxEnergy || 100;
  const aura = state.character?.aura || 0;

  const totalPassiveIncome = (state.passiveBusinesses || [])
    .filter((b) => b.isUnlocked)
    .reduce((sum, b) => sum + b.dailyIncome, 0);

  return (
    <header className="bg-neutral-950 border-b border-neutral-800 text-neutral-200 sm:sticky sm:top-0 z-30">
      {/* Top Banner / Stats Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md bg-amber-500 flex items-center justify-center text-neutral-950 font-black text-base">
            ₽
          </div>
          <div>
            <h1 className="font-black tracking-tight text-white text-sm sm:text-base leading-tight">
              Симулятор Темщика
            </h1>
            <span className="text-[11px] text-neutral-400">
              День {state.day}
            </span>
          </div>
        </div>

        {/* Vital Indicators */}
        <div className="w-full sm:w-auto grid grid-cols-2 sm:flex items-center gap-1.5 sm:gap-2">
          {/* Balance */}
          <div 
            id="wallet-badge" 
            className="flex items-center gap-2 bg-neutral-900 px-3 py-2 rounded-md border border-neutral-700"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-[10px] text-neutral-400 leading-none">
                Баланс
              </span>
              <span className="text-emerald-400 font-bold text-xs sm:text-sm font-mono leading-tight">
                {state.money.toLocaleString('ru-RU')} ₽
              </span>
            </div>
          </div>

          {/* Passive Income Button */}
          <button
            id="passive-income-btn"
            onClick={() => {
              sounds.playTap();
              onOpenPassiveIncome();
            }}
            className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 px-3 py-2 rounded-md border border-neutral-700 text-neutral-200 transition cursor-pointer"
            title="Пассивный доход и халтура"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-neutral-400 leading-none">
                Пассив / Халтура
              </span>
              <span className="text-xs font-mono font-medium leading-tight">
                {totalPassiveIncome > 0 ? (
                  <span className="text-emerald-400">+{totalPassiveIncome.toLocaleString('ru-RU')} ₽/д</span>
                ) : (
                  <span className="text-neutral-400">Открыть</span>
                )}
              </span>
            </div>
          </button>

          {/* Lifestyle / Character Button */}
          <button
            id="lifestyle-btn"
            onClick={() => {
              sounds.playTap();
              onOpenLifestyle();
            }}
            className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 px-3 py-2 rounded-md border border-neutral-700 text-neutral-200 transition cursor-pointer"
            title="Персонаж, гараж, недвижимость и кайфы"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-neutral-400 leading-none">
                Авторитет / Кайфы
              </span>
              <span className="text-xs font-mono font-bold text-amber-300 leading-tight">
                {aura} pts
              </span>
            </div>
          </button>

          {/* Energy */}
          <div className="flex items-center gap-2 bg-neutral-900 px-3 py-2 rounded-md border border-neutral-700">
            <Zap className={`w-3.5 h-3.5 ${state.energy < 20 ? 'text-rose-400' : 'text-amber-400'}`} />
            <div className="w-12 sm:w-16 h-1.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-700">
              <div 
                className={`h-full transition-all duration-300 ${
                  state.energy > 50 ? 'bg-amber-400' : state.energy > 20 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, Math.round((state.energy / maxEnergy) * 100))}%` }}
              />
            </div>
            <span className="text-xs font-mono font-medium text-neutral-300">
              {state.energy}/{maxEnergy}
            </span>
          </div>

          {/* Reputation Badge */}
          <button
            id="reputation-btn"
            onClick={onOpenReviews}
            className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 px-2.5 py-2 rounded-md border border-neutral-700 transition text-left cursor-pointer"
            title="Отзывы на Авито"
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-white">
              {state.reputation.toFixed(1)}
            </span>
            <span className="text-[10px] text-neutral-400">
              ({state.reviews.length})
            </span>
          </button>

          {/* Storage Meter */}
          <div 
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-md border text-xs ${
              isWeightOverloaded || isSlotsFull 
                ? 'bg-rose-950/30 border-rose-700/60 text-rose-300' 
                : 'bg-neutral-800/80 border-neutral-700/80 text-neutral-300'
            }`}
            title={`Склад: ${warehouse.name}`}
          >
            <Package className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="text-[11px] font-mono">
              {totalWeight.toFixed(0)}/{warehouse.maxWeightKg} кг • {state.inventory.length}/{warehouse.maxSlots}
            </span>
            {(isWeightOverloaded || isSlotsFull) && (
              <AlertCircle className="w-3 h-3 text-rose-400" />
            )}
          </div>

          {/* Fast Action Buttons */}
          <div className="col-span-2 sm:col-span-1 flex items-center justify-end gap-1">
            <button
              id="market-trends-btn"
              onClick={onOpenTrends}
              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 text-sky-400 transition cursor-pointer"
              title="Динамика рынка"
              aria-label="Открыть динамику рынка"
            >
              <TrendingUp className="w-4 h-4" />
            </button>

            <button
              id="skills-modal-btn"
              onClick={onOpenSkills}
              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 text-amber-400 transition cursor-pointer"
              title="Навыки темщика"
              aria-label="Открыть навыки темщика"
            >
              <Award className="w-4 h-4" />
            </button>

            <button
              id="sound-toggle-btn"
              onClick={onToggleSound}
              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 text-neutral-400 hover:text-neutral-200 transition cursor-pointer"
              title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
              aria-label={soundEnabled ? 'Выключить звук' : 'Включить звук'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              id="end-day-btn"
              onClick={() => {
                sounds.playTap();
                onEndDay();
              }}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 border border-amber-400 font-black px-3.5 py-2 rounded-md text-xs transition cursor-pointer ml-1"
            >
              <Moon className="w-3.5 h-3.5 fill-current" />
              <span>Спать</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
