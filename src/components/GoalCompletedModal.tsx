import React from 'react';
import { Trophy, CheckCircle, ArrowRight, Award, ShieldCheck, Sparkles, X } from 'lucide-react';
import { GameGoal } from '../types/game';

interface GoalCompletedModalProps {
  goal: GameGoal;
  nextGoal?: GameGoal;
  onClose: () => void;
}

export const GoalCompletedModal: React.FC<GoalCompletedModalProps> = ({
  goal,
  nextGoal,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-b from-amber-500/10 to-transparent border-b border-neutral-800 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Trophy className="w-8 h-8" />
          </div>

          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
            Цель #{goal.id} выполнена!
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            {goal.title}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-sm">
          {/* Narrative text */}
          <div className="bg-neutral-950/80 rounded-xl p-4 border border-neutral-800 text-neutral-200 leading-relaxed">
            <p className="font-medium text-amber-200/90 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{goal.completionMessage}</span>
            </p>
          </div>

          {/* Reward block */}
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold">
                Полученная награда:
              </div>
              <div className="text-sm font-bold text-white">
                {goal.reward}
              </div>
            </div>
          </div>

          {/* Next Goal preview */}
          {nextGoal ? (
            <div className="bg-neutral-800/60 border border-neutral-700/60 rounded-xl p-3.5 flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">
                  Следующая цель #{nextGoal.id}:
                </div>
                <div className="text-xs font-bold text-neutral-200">
                  {nextGoal.title} ({nextGoal.targetMoney.toLocaleString('ru-RU')} ₽)
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 shrink-0" />
            </div>
          ) : (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 text-center text-xs text-amber-300 font-bold">
              👑 Все основные цели темщика достигнуты! Вы покорили рынок!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-950/80 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-sm transition shadow-md cursor-pointer"
          >
            Продолжить карьеру темщика
          </button>
        </div>
      </div>
    </div>
  );
};
