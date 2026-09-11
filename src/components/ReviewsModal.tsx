import React from 'react';
import { 
  X, 
  Star, 
  ShieldCheck, 
  Award, 
  ThumbsUp, 
  AlertCircle, 
  MessageSquare,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { Review } from '../types/game';

interface ReviewsModalProps {
  reputation: number;
  reviews: Review[];
  totalDeals: number;
  onClose: () => void;
}

export const ReviewsModal: React.FC<ReviewsModalProps> = ({
  reputation,
  reviews,
  totalDeals,
  onClose,
}) => {
  const getReputationStatus = (rep: number) => {
    if (rep >= 4.9) return { title: 'Легенда Горбушки', color: 'text-amber-400', badge: 'bg-amber-500/20 border-amber-500/40 text-amber-300', perk: 'Покупатели забирают товары по полной цене без торга! Максимальное доверие.' };
    if (rep >= 4.6) return { title: 'Проверенный продавец Авито', color: 'text-emerald-400', badge: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300', perk: 'Отметка «Документы проверены». Поток покупателей увеличен на 30%.' };
    if (rep >= 4.0) return { title: 'Нормальный продавец', color: 'text-sky-400', badge: 'bg-sky-500/20 border-sky-500/40 text-sky-300', perk: 'Стабильные сделки, обычный уровень доверия покупателей.' };
    if (rep >= 3.0) return { title: 'Новичок с сомнительными отзывами', color: 'text-amber-400', badge: 'bg-neutral-800 border-neutral-700 text-neutral-300', perk: 'Покупатели опасаются и требуют проверок у капота.' };
    return { title: 'Мутный перекуп', color: 'text-rose-400', badge: 'bg-rose-500/20 border-rose-500/40 text-rose-300', perk: 'Штраф к продажам! Риск бана аккаунта и разборок.' };
  };

  const status = getReputationStatus(reputation);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-neutral-800/90 border-b border-neutral-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Star className="w-6 h-6 fill-amber-400" />
            </div>
            <div>
              <h3 className="font-black text-white text-base sm:text-lg">
                Репутация и отзывы на Авито
              </h3>
              <p className="text-xs text-neutral-400">
                Ваша карма продавца и доверие со стороны покупателей.
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

        {/* Status Card */}
        <div className="p-4 sm:p-5 bg-neutral-950 border-b border-neutral-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-white font-mono flex items-center gap-1">
                {reputation.toFixed(1)}
                <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
              </span>
              <div>
                <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full border ${status.badge}`}>
                  {status.title}
                </span>
                <p className="text-xs text-neutral-400 mt-1">
                  Всего успешных сделок: <strong className="text-white font-mono">{totalDeals}</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 text-xs text-neutral-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              <strong>Бонус статуса:</strong> {status.perk}
            </p>
          </div>
        </div>

        {/* Reviews List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 bg-neutral-900/60">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
            Последние отзывы покупателей ({reviews.length}):
          </h4>

          {reviews.length === 0 ? (
            <p className="text-xs text-neutral-500 text-center py-6">
              Пока отзывов нет. Совершите свои первые продажи!
            </p>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800/80 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs sm:text-sm">
                    {rev.author}
                  </span>
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.stars ? 'fill-amber-400 text-amber-400' : 'text-neutral-700'
                        }`}
                      />
                    ))}
                    <span className="text-[10px] text-neutral-500 ml-1 font-mono">
                      День {rev.day}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-neutral-300 italic">
                  «{rev.text}»
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
