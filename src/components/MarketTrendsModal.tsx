import React from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Newspaper, 
  Flame, 
  ArrowUpRight, 
  ArrowDownRight,
  Cpu,
  Laptop,
  Smartphone,
  Radio,
  Wrench,
  Package,
  Car,
  Shirt,
  Tv
} from 'lucide-react';
import { MarketTrend, ItemCategory } from '../types/game';

interface MarketTrendsModalProps {
  trends: MarketTrend[];
  onClose: () => void;
}

export const MarketTrendsModal: React.FC<MarketTrendsModalProps> = ({
  trends,
  onClose,
}) => {
  const getCategoryIcon = (cat: ItemCategory) => {
    switch (cat) {
      case 'gpus': return <Cpu className="w-5 h-5 text-purple-400" />;
      case 'computers': return <Laptop className="w-5 h-5 text-blue-400" />;
      case 'smartphones': return <Smartphone className="w-5 h-5 text-emerald-400" />;
      case 'auto_parts': return <Car className="w-5 h-5 text-orange-400" />;
      case 'clothes_fashion': return <Shirt className="w-5 h-5 text-rose-400" />;
      case 'appliances': return <Tv className="w-5 h-5 text-pink-400" />;
      case 'audio_retro': return <Radio className="w-5 h-5 text-amber-400" />;
      case 'tools_equipment': return <Wrench className="w-5 h-5 text-orange-400" />;
      case 'wholesale_junk': return <Package className="w-5 h-5 text-rose-400" />;
      default: return <Package className="w-5 h-5 text-neutral-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-neutral-800/90 border-b border-neutral-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Newspaper className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-white text-base sm:text-lg flex items-center gap-2">
                Динамика рынка и новости
                <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-bold">
                  LIVE
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Цены на товары динамически колеблются каждое утро под влиянием новостей и трендов.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 bg-neutral-950">
          <div className="bg-neutral-900/80 border border-neutral-800 p-3.5 rounded-xl text-xs text-neutral-300 flex items-start gap-2.5">
            <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong>Совет опытного темщика:</strong> Скупайте категории с падающим трендом по дешевке и придерживайте на складе. Когда тренд развернется вверх — выставляйте с максимальной наценкой!
            </p>
          </div>

          <div className="space-y-2.5">
            {trends.map((trend) => {
              const percentDiff = Math.round((trend.multiplier - 1.0) * 100);

              return (
                <div
                  key={trend.category}
                  className="bg-neutral-900 border border-neutral-800/90 hover:border-neutral-700 rounded-2xl p-4 transition"
                >
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                        {getCategoryIcon(trend.category)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          {trend.categoryName}
                        </h4>
                        <span className="text-[10px] text-neutral-400">
                          Индекс цен: {trend.multiplier.toFixed(2)}x
                        </span>
                      </div>
                    </div>

                    {/* Trend Badge */}
                    <div className="flex items-center gap-1.5">
                      {trend.trendDirection === 'up' ? (
                        <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold px-2.5 py-1 rounded-lg">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          +{percentDiff}%
                        </span>
                      ) : trend.trendDirection === 'down' ? (
                        <span className="flex items-center gap-1 bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-bold px-2.5 py-1 rounded-lg">
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          {percentDiff}%
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 bg-neutral-800 text-neutral-400 border border-neutral-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                          <Minus className="w-3.5 h-3.5" />
                          0%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* News Headline */}
                  <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 text-xs text-neutral-300 mt-2 italic flex items-center gap-2">
                    <span className="text-amber-400 shrink-0 font-bold">Сводка:</span>
                    <span>{trend.newsHeadline}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
