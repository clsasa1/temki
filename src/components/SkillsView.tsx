import React from 'react';
import { 
  X, 
  MessageSquare, 
  Eye, 
  Wrench, 
  Package, 
  Gavel, 
  Award, 
  ArrowUpCircle, 
  Check, 
  Sparkles,
  Zap
} from 'lucide-react';
import { Skills } from '../types/game';
import { sounds } from '../utils/audio';

interface SkillsViewProps {
  skills: Skills;
  playerMoney: number;
  onUpgradeSkill: (skillKey: keyof Skills, cost: number) => void;
  onClose: () => void;
}

export const SkillsView: React.FC<SkillsViewProps> = ({
  skills,
  playerMoney,
  onUpgradeSkill,
  onClose,
}) => {
  const getSkillCost = (currentLevel: number) => {
    return Math.round(3500 * Math.pow(1.7, currentLevel - 1) / 100) * 100;
  };

  const skillDefinitions: Array<{
    key: keyof Skills;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    description: string;
    currentPerk: string;
    nextPerk: string;
  }> = [
    {
      key: 'negotiation',
      title: 'Язык без костей',
      subtitle: 'Искусство переговоров и сбивания цен',
      icon: <MessageSquare className="w-5 h-5 text-amber-400" />,
      color: 'amber',
      description: 'Позволяет виртуозно убеждать продавцов отдать вещь за бесценок, а покупателям продавать дороже рынка.',
      currentPerk: `Бонус к скидкам при покупке: +${(skills.negotiation - 1) * 3}%. Терпение NPC расходуется медленнее.`,
      nextPerk: `Бонус к скидкам при покупке увеличится до +${skills.negotiation * 3}%, разблокируются дерзкие реплики.`,
    },
    {
      key: 'assessment',
      title: 'Глаз-алмаз',
      subtitle: 'Оценка техники и выявление скрытых дефектов',
      icon: <Eye className="w-5 h-5 text-sky-400" />,
      color: 'sky',
      description: 'Опытный темщик по одной фотографии определяет, грели ли чип феном и оригинальный ли дисплей.',
      currentPerk: `Точность оценки рынка: ${80 + (skills.assessment - 1) * 2}%. Шанс сразу заметить скрытый брак: ${20 + skills.assessment * 8}%.`,
      nextPerk: `Шанс моментального выявления брака вырастет до ${20 + (skills.assessment + 1) * 8}%.`,
    },
    {
      key: 'restoration',
      title: 'Мастер на все руки',
      subtitle: 'Предпродажная подготовка и чистка',
      icon: <Wrench className="w-5 h-5 text-emerald-400" />,
      color: 'emerald',
      description: 'Замена термопасты Arctic MX-4, продувка компрессором, полировка стекол и устранение мелких поломок.',
      currentPerk: `Прибавка к рыночной стоимости после обслуживания: +${15 + (skills.restoration - 1) * 4}%.`,
      nextPerk: `Прибавка к стоимости вырастет до +${15 + skills.restoration * 4}%. Снижение стоимости расходников.`,
    },
    {
      key: 'storage',
      title: 'Тетрис-мастер',
      subtitle: 'Управление запасом и вместимостью',
      icon: <Package className="w-5 h-5 text-indigo-400" />,
      color: 'indigo',
      description: 'Умение утрамбовывать коробки с техникой в багажнике и на балконе до космической плотности.',
      currentPerk: `Бонус вместимости склада: +${(skills.storage - 1) * 15}% к допустимому весу и +${(skills.storage - 1) * 2} доп. слота.`,
      nextPerk: `Бонус вырастет до +${skills.storage * 15}% к весу и +${skills.storage * 2} слотов на любом складе.`,
    },
    {
      key: 'auctionSmarts',
      title: 'Спец по торгам',
      subtitle: 'Банкротство, конфискат и аукционные лоты',
      icon: <Gavel className="w-5 h-5 text-rose-400" />,
      color: 'rose',
      description: 'Знание регламентов торгов, психологии конкурсных управляющих и алгоритмов снайпинга ставок.',
      currentPerk: `Снижение конкурентной агрессии перекупщиков-ботов на ${(skills.auctionSmarts - 1) * 5}%.`,
      nextPerk: `Снижение агрессии ботов на торгах вырастет до ${skills.auctionSmarts * 5}%.`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-neutral-800/90 border-b border-neutral-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-white text-base sm:text-lg">
                Навыки и прокачка темщика
              </h3>
              <p className="text-xs text-neutral-400">
                Инвестируйте заработанную прибыль в профессиональное мастерство.
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

        {/* Skills list */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-neutral-950">
          {skillDefinitions.map((skill) => {
            const currentLevel = skills[skill.key];
            const cost = getSkillCost(currentLevel);
            const canAfford = playerMoney >= cost;
            const isMaxed = currentLevel >= 10;

            return (
              <div
                key={skill.key}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-neutral-700 transition"
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0 mt-0.5">
                    {skill.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-extrabold text-white text-sm sm:text-base">
                        {skill.title}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-800 text-amber-300 border border-neutral-700 font-mono">
                        Уровень {currentLevel}/10
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 font-medium mb-1.5">
                      {skill.subtitle}
                    </p>
                    <p className="text-xs text-neutral-300 leading-relaxed mb-2">
                      {skill.description}
                    </p>
                    <div className="text-[11px] text-emerald-400 font-medium bg-emerald-950/20 border border-emerald-900/40 px-2.5 py-1 rounded-lg">
                      Текущий эффект: {skill.currentPerk}
                    </div>
                  </div>
                </div>

                {/* Upgrade Button */}
                <div className="shrink-0 flex flex-col items-end gap-1">
                  {isMaxed ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/40 px-3 py-2 rounded-xl border border-emerald-800">
                      <Check className="w-4 h-4" />
                      МАКСИМУМ
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        sounds.playSuccess();
                        onUpgradeSkill(skill.key, cost);
                      }}
                      disabled={!canAfford}
                      className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black'
                          : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                      }`}
                    >
                      <ArrowUpCircle className="w-4 h-4" />
                      <span>Прокачать ур. {currentLevel + 1}</span>
                      <span className="font-mono bg-neutral-950/30 px-1.5 py-0.5 rounded">
                        {cost.toLocaleString('ru-RU')} ₽
                      </span>
                    </button>
                  )}
                  {!isMaxed && (
                    <span className="text-[10px] text-neutral-500 text-right">
                      {canAfford ? 'Доступно для прокачки' : 'Недостаточно средств'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
