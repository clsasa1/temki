import React, { useState } from 'react';
import { Target, CheckCircle2, ChevronRight, Trophy, Sparkles, Check, Lock } from 'lucide-react';
import { GOALS } from '../data/initialData';
import { GameGoal } from '../types/game';
import { sounds } from '../utils/audio';

interface GoalsWidgetProps {
  currentGoalIndex: number;
  money: number;
  dealsCount: number;
  onClaimGoal: (goalIndex: number) => void;
}

export const GoalsWidget: React.FC<GoalsWidgetProps> = ({
  currentGoalIndex,
  money,
  dealsCount,
  onClaimGoal,
}) => {
  const [showRoadmap, setShowRoadmap] = useState(false);

  const currentGoal: GameGoal = GOALS[currentGoalIndex] || GOALS[GOALS.length - 1];
  const allCompleted = currentGoalIndex >= GOALS.length;
  const isTargetMet = money >= currentGoal.targetMoney;
  const progressPercent = Math.min(100, Math.round((money / currentGoal.targetMoney) * 100));

  return (
    <div className="bg-[#151b16] border border-[#344036] border-l-4 border-l-amber-500 rounded-md p-4 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Goal Info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400 shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-neutral-400">
                Цель #{allCompleted ? GOALS.length : currentGoal.id} из {GOALS.length}
              </span>
              <h3 className="font-black text-white text-sm sm:text-base">
                {allCompleted ? 'Все цели темщика закрыты!' : currentGoal.title}
              </h3>
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5 max-w-xl line-clamp-1">
              {allCompleted ? 'Вы достигли статуса легенды перепродажи.' : currentGoal.description}
            </p>
          </div>
        </div>

        {/* Progress & Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {!allCompleted && (
            <div className="flex-1 min-w-[170px] space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="tm-kicker">Баланс / цель</span>
                <span className={isTargetMet ? 'text-emerald-400 font-bold' : 'text-neutral-300'}>
                  {money.toLocaleString('ru-RU')} / {currentGoal.targetMoney.toLocaleString('ru-RU')} ₽
                </span>
              </div>
              <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    isTargetMet ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Action button: always visible so user knows how to close goals/loans */}
          {!allCompleted && (
            isTargetMet ? (
              <button
                id="claim-goal-btn"
                onClick={() => {
                  sounds.playCash();
                  onClaimGoal(currentGoalIndex);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition shadow-md flex items-center gap-1.5 cursor-pointer shrink-0 animate-pulse"
                title={`Нажмите, чтобы списать ${currentGoal.repayAmount.toLocaleString('ru-RU')} ₽ и закрыть цель`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{currentGoal.actionTitle} (-{currentGoal.repayAmount.toLocaleString('ru-RU')} ₽)</span>
              </button>
            ) : (
              <button
                id="claim-goal-btn-disabled"
                disabled
                className="bg-neutral-800/80 text-neutral-400 text-xs px-3 py-2 rounded-lg border border-neutral-700/60 opacity-80 cursor-not-allowed shrink-0 flex items-center gap-1.5"
                title={`Для закрытия цели «${currentGoal.title}» нужно накопить ${currentGoal.targetMoney.toLocaleString('ru-RU')} ₽ (осталось ${(currentGoal.targetMoney - money).toLocaleString('ru-RU')} ₽)`}
              >
                <Lock className="w-3.5 h-3.5 text-neutral-500" />
                <span>Осталось накопить: {(currentGoal.targetMoney - money).toLocaleString('ru-RU')} ₽</span>
              </button>
            )
          )}

          {/* View Roadmap button */}
          <button
            onClick={() => setShowRoadmap(!showRoadmap)}
            className="text-xs text-neutral-400 hover:text-neutral-200 px-2.5 py-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/60 transition cursor-pointer shrink-0"
            title="Посмотреть все цели карьеры темщика"
          >
            {showRoadmap ? 'Скрыть список' : 'Все цели'}
          </button>
        </div>
      </div>

      {/* Expanded Roadmap Drawer */}
      {showRoadmap && (
        <div className="mt-3 pt-3 border-t border-neutral-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          {GOALS.map((g, idx) => {
            const isDone = idx < currentGoalIndex;
            const isCurrent = idx === currentGoalIndex;
            return (
              <div
                key={g.id}
                className={`p-2.5 rounded-lg border text-xs ${
                  isDone
                    ? 'bg-neutral-950/40 border-emerald-900/40 text-neutral-400'
                    : isCurrent
                    ? 'bg-neutral-800/90 border-amber-500/40 text-neutral-200 shadow-xs'
                    : 'bg-neutral-950/20 border-neutral-800/60 text-neutral-500'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-bold text-[10px] uppercase text-neutral-400">
                    #{g.id} {g.title}
                  </span>
                  {isDone ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-0.5 text-[10px]">
                      <Check className="w-3 h-3" /> Закрыта
                    </span>
                  ) : isCurrent ? (
                    <span className="text-amber-400 font-bold text-[10px]">Текущая</span>
                  ) : (
                    <Lock className="w-3 h-3 text-neutral-600" />
                  )}
                </div>
                <div className="text-[11px] text-neutral-300 font-mono">
                  {g.targetMoney.toLocaleString('ru-RU')} ₽
                </div>
                <div className="text-[10px] text-neutral-400 mt-1 line-clamp-1">
                  Награда: {g.reward}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
