import React from 'react';
import { 
  Moon, 
  Sun, 
  TrendingUp, 
  Wallet, 
  Building2, 
  Sparkles, 
  Zap,
  ArrowRight,
  Newspaper,
  CheckCircle2
} from 'lucide-react';
import { MarketTrend, WarehouseLevel } from '../types/game';
import { sounds } from '../utils/audio';

interface DailySummaryModalProps {
  day: number;
  rentPaid: number;
  passiveEarned?: number;
  warehouse: WarehouseLevel;
  trends: MarketTrend[];
  onStartNextDay: () => void;
}

export const DailySummaryModal: React.FC<DailySummaryModalProps> = ({
  day,
  rentPaid,
  passiveEarned = 0,
  warehouse,
  trends,
  onStartNextDay,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header banner */}
        <div className="p-6 bg-amber-950/25 border-b border-neutral-800 text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
            <Moon className="w-7 h-7 fill-amber-400/20" />
          </div>
          <h3 className="text-xl font-black text-white">
            Ночь прошла успешно!
          </h3>
          <p className="text-xs text-neutral-400">
            Темщик выспался, энергия восстановлена на 100%. Рынок обновил цены и объявления.
          </p>
        </div>

        {/* Expenses & Status */}
        <div className="p-5 space-y-4 bg-neutral-950">
          {/* Finances */}
          <div className="bg-neutral-900 p-3.5 rounded-xl border border-neutral-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-neutral-300">
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-400" />
                Аренда склада ({warehouse.name}):
              </span>
              <span className="font-mono font-bold text-rose-400">
                {rentPaid > 0 ? `-${rentPaid} ₽` : '0 ₽ (Бесплатно)'}
              </span>
            </div>

            {passiveEarned > 0 && (
              <div className="flex items-center justify-between text-neutral-300 pt-2 border-t border-neutral-800">
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Пассивный доход от активов:
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  +{passiveEarned.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-neutral-300 pt-2 border-t border-neutral-800">
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Энергия темщика:
              </span>
              <span className="font-mono font-bold text-emerald-400">
                100% (Максимум)
              </span>
            </div>
          </div>

          {/* Morning Market News Snippets */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
              <Newspaper className="w-3.5 h-3.5 text-amber-400" />
              Утренние сводки рынка:
            </h4>
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
              {trends.slice(0, 3).map((trend) => (
                <div
                  key={trend.category}
                  className="bg-neutral-900 p-2.5 rounded-lg border border-neutral-800/80 text-xs text-neutral-300 flex items-start gap-2"
                >
                  <span className="text-amber-400 shrink-0 font-bold">•</span>
                  <span>{trend.newsHeadline}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Wake up button */}
          <button
            onClick={() => {
              sounds.playSuccess();
              onStartNextDay();
            }}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Sun className="w-4 h-4 fill-neutral-950" />
            <span>Начать День {day + 1}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
