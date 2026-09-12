import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Smile, 
  AlertTriangle, 
  Flame, 
  Check, 
  ShieldCheck, 
  User, 
  Sparkles,
  Zap,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Package,
  Truck,
  PhoneCall,
  Repeat,
  Gift,
  Tag,
  Wallet,
  Search
} from 'lucide-react';
import { ActiveNegotiation, ChatMessage, Skills, ItemCategory } from '../types/game';
import { sounds } from '../utils/audio';
import {
  PLAYER_TACTIC_LINES,
  BUYER_ACCEPT_LINES,
  BUYER_MANY_CALLS_FOMO_LINES,
  BUYER_MANY_CALLS_BLUFF_LINES,
  BUYER_COUNTER_LINES,
  BUYER_REJECT_LINES,
  SELLER_HAPPY_LINES,
  SELLER_ANGRY_LINES,
  SELLER_COUNTER_LINES,
} from '../data/negotiationDialogues';

interface NegotiationModalProps {
  session: ActiveNegotiation;
  playerSkills: Skills;
  playerMoney: number;
  playerSpecialization?: ItemCategory | 'all';
  onClose: () => void;
  onFinishNegotiation: (dealAgreed: boolean, finalPrice: number, session: ActiveNegotiation) => void;
}

export type NegotiationTacticKey = 
  | 'quick_cash' 
  | 'tech_flaw' 
  | 'defect_lever'
  | 'market_compare' 
  | 'taxi_discount' 
  | 'sob_story' 
  | 'trade_exchange' 
  | 'avito_delivery' 
  | 'firm_stance'
  | 'many_calls'
  | 'bonus_gift'
  | 'split_difference'
  | 'custom_offer';

export const NegotiationModal: React.FC<NegotiationModalProps> = ({
  session,
  playerSkills,
  playerMoney,
  playerSpecialization = 'all',
  onClose,
  onFinishNegotiation,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(session.chatHistory);
  const [currentOffer, setCurrentOffer] = useState<number>(session.currentOffer);
  const [npcPatience, setNpcPatience] = useState<number>(session.npcPatience);
  const [customPriceInput, setCustomPriceInput] = useState<string>('');
  const [isNpcTyping, setIsNpcTyping] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isDealAgreed, setIsDealAgreed] = useState<boolean>(false);
  const [tacticTurns, setTacticTurns] = useState<number>(0);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const isSpecializedInItem = 
    playerSpecialization !== 'all' && playerSpecialization === session.item.category;

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isNpcTyping]);

  const addMessage = (msg: Omit<ChatMessage, 'id'>) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random()}`,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  // Helper for negotiation tactics
  const handleTactic = (tactic: NegotiationTacticKey) => {
    if (isFinished || isNpcTyping) return;

    sounds.playTap();
    setIsNpcTyping(true);

    const currentTurn = tacticTurns + 1;
    setTacticTurns(currentTurn);
    // Escalating annoyance: the more tactics you throw, the faster patience burns!
    const fatiguePenalty = (currentTurn - 1) * 8;

    let playerText = '';
    let suggestedPrice = currentOffer;
    let moodImpact = 0;
    let isInstantWalkAway = false;
    let priceDropRatio = 0.05;

    // Skill + Specialization bonuses
    const negBonus = (playerSkills.negotiation - 1) * 0.035; // up to +31%
    const specBonus = isSpecializedInItem ? 0.08 : 0; // +8% extra leverage

    if (session.mode === 'buy') {
      // --- PLAYER IS BUYING FROM NPC SELLER ---
      const tacticPool = PLAYER_TACTIC_LINES[tactic];
      if (tacticPool && tacticPool.length > 0 && tactic !== 'custom_offer' && tactic !== 'defect_lever') {
        playerText = tacticPool[Math.floor(Math.random() * tacticPool.length)];
      }

      switch (tactic) {
        case 'defect_lever':
          priceDropRatio = 0.25;
          suggestedPrice = Math.round(currentOffer * (1 - priceDropRatio) / 100) * 100;
          playerText = `Я проверил этот лот перед покупкой: тут скрытый дефект — «${session.item.hiddenDefect}»! Скидывайте ${(currentOffer - suggestedPrice).toLocaleString('ru-RU')} ₽ на ремонт, иначе брать не буду!`;
          moodImpact = 0; // Caught red-handed, no patience penalty!
          break;

        case 'quick_cash':
          priceDropRatio = 0.12 + negBonus * 0.8 + specBonus;
          suggestedPrice = Math.round(currentOffer * (1 - priceDropRatio) / 100) * 100;
          moodImpact = -12 - fatiguePenalty;
          break;

        case 'tech_flaw':
          priceDropRatio = 0.20 + negBonus + specBonus;
          suggestedPrice = Math.round(currentOffer * (1 - priceDropRatio) / 100) * 100;
          // Seller feels insulted/defensive about their item!
          moodImpact = -25 + (playerSkills.assessment * 1.5) - fatiguePenalty;
          break;

        case 'market_compare':
          priceDropRatio = 0.14 + negBonus * 0.7 + specBonus;
          suggestedPrice = Math.round(currentOffer * (1 - priceDropRatio) / 100) * 100;
          moodImpact = -22 + (playerSkills.negotiation * 1.2) - fatiguePenalty;
          break;

        case 'taxi_discount':
          priceDropRatio = 0.07 + negBonus * 0.4;
          suggestedPrice = Math.round(currentOffer * (1 - priceDropRatio) / 100) * 100;
          moodImpact = -8 - fatiguePenalty;
          break;

        case 'sob_story':
          priceDropRatio = 0.16 + negBonus + specBonus;
          suggestedPrice = Math.round(currentOffer * (1 - priceDropRatio) / 100) * 100;
          // Sellers hate sob stories
          moodImpact = -24 - fatiguePenalty;
          break;

        case 'trade_exchange':
          priceDropRatio = 0.18 + negBonus;
          suggestedPrice = Math.round(currentOffer * (1 - priceDropRatio) / 100) * 100;
          moodImpact = -20 - fatiguePenalty;
          break;

        case 'avito_delivery':
          priceDropRatio = 0.10 + negBonus * 0.5;
          suggestedPrice = Math.round(currentOffer * (1 - priceDropRatio) / 100) * 100;
          moodImpact = -14 - fatiguePenalty;
          break;

        case 'firm_stance':
          // ULTIMATUM: very high risk! 45% chance of instant walkaway if below asking
          suggestedPrice = currentOffer;
          if (currentOffer < session.initialPrice && Math.random() < 0.45) {
            isInstantWalkAway = true;
          } else {
            moodImpact = -40 - fatiguePenalty;
          }
          break;

        case 'custom_offer': {
          const parsed = parseInt(customPriceInput.replace(/\D/g, ''), 10);
          if (isNaN(parsed) || parsed <= 0) {
            setIsNpcTyping(false);
            return;
          }
          suggestedPrice = parsed;
          playerText = `Предлагаю ровно ${suggestedPrice.toLocaleString('ru-RU')} ₽. Деньги наготове.`;
          const diffRatio = (session.initialPrice - suggestedPrice) / session.initialPrice;
          if (diffRatio > 0.45 && Math.random() < 0.5) {
            isInstantWalkAway = true;
          } else if (diffRatio > 0.35) {
            moodImpact = -45 - fatiguePenalty;
          } else if (diffRatio > 0.2) {
            moodImpact = -28 - fatiguePenalty;
          } else {
            moodImpact = -15 - fatiguePenalty;
          }
          setCustomPriceInput('');
          break;
        }
      }

      // Check if seller refuses any bargaining
      if (session.isStrictNoBargain && tactic !== 'defect_lever' && suggestedPrice < session.initialPrice) {
        isInstantWalkAway = true;
      }
    } else {
      // --- PLAYER IS SELLING TO NPC BUYER ---
      const tacticPool = PLAYER_TACTIC_LINES[tactic];
      if (tacticPool && tacticPool.length > 0 && tactic !== 'custom_offer') {
        playerText = tacticPool[Math.floor(Math.random() * tacticPool.length)];
      }

      switch (tactic) {
        case 'firm_stance':
          // Ultimatum: 40% buyer refuses to buy and leaves
          suggestedPrice = session.initialPrice;
          if (Math.random() < 0.40) {
            isInstantWalkAway = true;
          } else {
            moodImpact = -35 - fatiguePenalty;
          }
          break;

        case 'quick_cash':
          suggestedPrice = Math.max(session.minAcceptablePrice, currentOffer - 1000);
          moodImpact = +15 - fatiguePenalty;
          break;

        case 'taxi_discount':
          suggestedPrice = Math.max(session.minAcceptablePrice, currentOffer - 500);
          moodImpact = +10 - fatiguePenalty;
          break;

        case 'tech_flaw':
          moodImpact = +5 + playerSkills.restoration * 2 + (isSpecializedInItem ? 6 : 0) - fatiguePenalty;
          suggestedPrice = session.initialPrice;
          break;

        case 'many_calls':
          moodImpact = -18 - fatiguePenalty;
          suggestedPrice = Math.round((currentOffer + session.initialPrice) / 200) * 100;
          break;

        case 'bonus_gift':
          moodImpact = +8 - fatiguePenalty;
          suggestedPrice = currentOffer;
          break;

        case 'split_difference': {
          const midPrice = Math.round((currentOffer + session.initialPrice) / 200) * 100;
          playerText = `Давайте сойдёмся ровно посередине — ${midPrice.toLocaleString('ru-RU')} ₽, и по рукам?`;
          suggestedPrice = midPrice;
          moodImpact = +4 - fatiguePenalty;
          break;
        }

        case 'custom_offer': {
          const parsed = parseInt(customPriceInput.replace(/\D/g, ''), 10);
          if (isNaN(parsed) || parsed <= 0) {
            setIsNpcTyping(false);
            return;
          }
          suggestedPrice = parsed;
          playerText = `Согласен отдать за ${suggestedPrice.toLocaleString('ru-RU')} ₽.`;
          setCustomPriceInput('');
          break;
        }
      }
    }

    addMessage({
      from: 'player',
      text: playerText,
      priceTag: suggestedPrice,
    });

    // NPC Response Generation Delay
    setTimeout(() => {
      let newPatience = npcPatience + moodImpact;
      let npcAnswer = '';
      let accepted = false;
      let finalPriceForMessage = suggestedPrice;

      if (isInstantWalkAway || newPatience <= 18) {
        // NPC LOST TEMPER OR RAGE QUIT!
        setIsFinished(true);
        setIsDealAgreed(false);
        newPatience = 0;
        sounds.playFail();

        if (session.mode === 'buy') {
          if (session.isStrictNoBargain) {
            npcAnswer = `Вы объявление читали?! Там черным по белому написано: «БЕЗ ТОРГА СОВСЕМ»! Ни рубля не скину. Либо забирайте за ${session.initialPrice.toLocaleString('ru-RU')} ₽, либо разговор окончен.`;
          } else {
            npcAnswer = isInstantWalkAway
              ? 'Да пошел ты нафиг со своими ультиматумами! За копейки отдавать не стану. В ЧС!'
              : SELLER_ANGRY_LINES[Math.floor(Math.random() * SELLER_ANGRY_LINES.length)];
          }
        } else {
          npcAnswer = isInstantWalkAway
            ? 'Ну и сиди со своим хламом дальше! Я за эти деньги лучше новое в магазине возьму. Пока!'
            : BUYER_REJECT_LINES[Math.floor(Math.random() * BUYER_REJECT_LINES.length)];
        }

        finalPriceForMessage = currentOffer;
      } else if (session.mode === 'buy') {
        // NPC is SELLER
        if (tactic === 'defect_lever') {
          // Defect lever caught the seller red-handed! Guaranteed agreement with custom dialogue!
          accepted = true;
          npcAnswer = `Чёрт... Вы проверили лот и нашли дефект: «${session.item.hiddenDefect}»! Думал не заметите... Ладно, деваться некуда, признаю косяк. Скидываю ${(currentOffer - suggestedPrice).toLocaleString('ru-RU')} ₽ на ремонт. Забирайте за ${suggestedPrice.toLocaleString('ru-RU')} ₽!`;
          setCurrentOffer(suggestedPrice);
          setIsDealAgreed(true);
          finalPriceForMessage = suggestedPrice;
        } else if (session.sellerPersonality === 'stubborn' && suggestedPrice < Math.round(session.initialPrice * 0.95)) {
          // Stubborn seller refuses discounts larger than 5%
          const stubbornPrice = Math.round(session.initialPrice * 0.95 / 100) * 100;
          npcAnswer = `Я упёртый продавец, за бесценок хорошую вещь отдавать не буду. Крайняя уступка чисто на кофе — ${stubbornPrice.toLocaleString('ru-RU')} ₽. Меньше не просите!`;
          setCurrentOffer(stubbornPrice);
          setIsDealAgreed(false);
          finalPriceForMessage = stubbornPrice;
        } else if (suggestedPrice >= session.minAcceptablePrice) {
          // Price is acceptable to seller!
          accepted = true;
          npcAnswer = SELLER_HAPPY_LINES[Math.floor(Math.random() * SELLER_HAPPY_LINES.length)];
          setCurrentOffer(suggestedPrice);
          setIsDealAgreed(true);
          finalPriceForMessage = suggestedPrice;
        } else {
          // NPC counters halfway
          const counterPrice = Math.round((suggestedPrice + session.minAcceptablePrice) / 200) * 100;
          npcAnswer = `${SELLER_COUNTER_LINES[Math.floor(Math.random() * SELLER_COUNTER_LINES.length)]}\n\n👉 Встречное предложение продавца: ${counterPrice.toLocaleString('ru-RU')} ₽`;
          setCurrentOffer(counterPrice);
          setIsDealAgreed(false);
          finalPriceForMessage = counterPrice;
        }
      } else {
        // NPC is BUYER
        if (tactic === 'many_calls') {
          // Buyer specifically responds to "many calls"
          if (suggestedPrice <= session.maxAcceptablePrice || Math.random() < 0.45) {
            accepted = true;
            npcAnswer = BUYER_MANY_CALLS_FOMO_LINES[Math.floor(Math.random() * BUYER_MANY_CALLS_FOMO_LINES.length)];
            setCurrentOffer(suggestedPrice);
            setIsDealAgreed(true);
            finalPriceForMessage = suggestedPrice;
          } else {
            const counterPrice = Math.round((suggestedPrice + session.maxAcceptablePrice) / 200) * 100;
            npcAnswer = `${BUYER_MANY_CALLS_BLUFF_LINES[Math.floor(Math.random() * BUYER_MANY_CALLS_BLUFF_LINES.length)]}\n\n👉 Встречное предложение покупателя: ${counterPrice.toLocaleString('ru-RU')} ₽`;
            setCurrentOffer(counterPrice);
            setIsDealAgreed(false);
            finalPriceForMessage = counterPrice;
          }
        } else {
          // Normal tactic response
          if (suggestedPrice <= session.maxAcceptablePrice) {
            accepted = true;
            npcAnswer = BUYER_ACCEPT_LINES[Math.floor(Math.random() * BUYER_ACCEPT_LINES.length)];
            setCurrentOffer(suggestedPrice);
            setIsDealAgreed(true);
            finalPriceForMessage = suggestedPrice;
          } else {
            const counterPrice = Math.round((suggestedPrice + session.maxAcceptablePrice) / 200) * 100;
            npcAnswer = `${BUYER_COUNTER_LINES[Math.floor(Math.random() * BUYER_COUNTER_LINES.length)]}\n\n👉 Встречное предложение покупателя: ${counterPrice.toLocaleString('ru-RU')} ₽`;
            setCurrentOffer(counterPrice);
            setIsDealAgreed(false);
            finalPriceForMessage = counterPrice;
          }
        }
      }

      setNpcPatience(Math.max(0, Math.min(100, newPatience)));
      sounds.playPing();

      addMessage({
        from: 'npc',
        text: npcAnswer,
        priceTag: finalPriceForMessage,
      });

      setIsNpcTyping(false);

      if (accepted) {
        sounds.playSuccess();
      }
    }, 800);
  };

  const handleAgreeDeal = () => {
    if (session.mode === 'buy' && playerMoney < currentOffer) {
      alert('У вас недостаточно средств на балансе!');
      return;
    }
    sounds.playCash();
    onFinishNegotiation(true, currentOffer, session);
  };

  const handleWalkAway = () => {
    sounds.playFail();
    onFinishNegotiation(false, currentOffer, session);
  };

  const isBuyOverBudget = session.mode === 'buy' && currentOffer > playerMoney;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-neutral-800/90 border-b border-neutral-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-neutral-950 font-black shadow-inner shrink-0">
              {session.npcAvatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm sm:text-base">
                  {session.npcName}
                </span>
                <span className="text-[10px] bg-neutral-700 px-2 py-0.5 rounded text-neutral-300">
                  {session.mode === 'buy' ? 'Продавец' : 'Покупатель'}
                </span>
                {session.isStrictNoBargain && (
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold">
                    ⛔ Без торга
                  </span>
                )}
                {session.sellerPersonality === 'stubborn' && (
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full font-bold">
                    🗿 Упёртый
                  </span>
                )}
                {session.sellerPersonality === 'urgent' && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                    ⚡ Срочный слив
                  </span>
                )}
                {isSpecializedInItem && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Твой профиль (+15% торг)
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 line-clamp-1">
                Товар: <span className="text-amber-400 font-medium">{session.item.name}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patience / Price Meter Bar with Player Wallet Balance */}
        <div className="bg-neutral-950 px-4 py-2 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* NPC Mood/Patience */}
          <div className="flex items-center gap-2 flex-1 min-w-[150px]">
            <span className="text-neutral-400 whitespace-nowrap flex items-center gap-1">
              <Flame className={`w-3.5 h-3.5 ${npcPatience < 30 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`} />
              Терпение:
            </span>
            <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700">
              <div 
                className={`h-full transition-all duration-300 ${
                  npcPatience > 60 ? 'bg-emerald-500' : npcPatience > 30 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${npcPatience}%` }}
              />
            </div>
            <span className="font-mono text-neutral-300 font-bold">{npcPatience}%</span>
          </div>

          {/* Player Wallet Balance (Always clearly visible to avoid guessing) */}
          <div className="flex items-center gap-1.5 bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-700 shrink-0">
            <Wallet className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-neutral-400">Твой баланс:</span>
            <span className={`font-mono font-bold text-xs ${session.mode === 'buy' && playerMoney < currentOffer ? 'text-rose-400' : 'text-emerald-400'}`}>
              {playerMoney.toLocaleString('ru-RU')} ₽
            </span>
          </div>

          {/* Current offer badge */}
          <div className="flex items-center gap-1.5 bg-neutral-800 px-2.5 py-1 rounded-lg border border-neutral-700 shrink-0">
            <span className="text-neutral-400">Предложение:</span>
            <span className="text-emerald-400 font-extrabold text-sm font-mono">
              {currentOffer.toLocaleString('ru-RU')} ₽
            </span>
          </div>
        </div>

        {/* Chat History Box */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[200px] max-h-[340px] bg-neutral-900/60">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.from === 'player' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  msg.from === 'player'
                    ? 'bg-amber-500 text-neutral-950 font-medium rounded-tr-none'
                    : 'bg-neutral-800 text-neutral-100 border border-neutral-700/80 rounded-tl-none'
                }`}
              >
                <p>{msg.text}</p>
                {msg.priceTag !== undefined && (
                  <div className={`text-xs mt-1 font-mono font-bold flex items-center gap-1 ${
                    msg.from === 'player' ? 'text-neutral-900' : 'text-amber-400'
                  }`}>
                    💰 {msg.priceTag.toLocaleString('ru-RU')} ₽
                  </div>
                )}
              </div>
            </div>
          ))}

          {isNpcTyping && (
            <div className="flex justify-start">
              <div className="bg-neutral-800 text-neutral-400 rounded-2xl rounded-tl-none px-3.5 py-2 text-xs flex items-center gap-1.5 border border-neutral-700">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce [animation-delay:0.2s]">●</span>
                <span className="animate-bounce [animation-delay:0.4s]">●</span>
                <span className="ml-1 text-[11px] text-neutral-400">{session.npcName} печатает...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Action Controls & Expanded Dialogue Options */}
        <div className="p-3.5 bg-neutral-950 border-t border-neutral-800 space-y-3">
          {/* Tactics Bar */}
          {!isFinished && npcPatience > 15 && (
            <div>
              <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-bold mb-2 flex items-center justify-between">
                <span>Варианты ответа и тактики торга:</span>
                <span className="text-[10px] text-amber-400 font-normal">
                  Навык переговоров ур.{playerSkills.negotiation}
                </span>
              </div>

              {session.mode === 'buy' ? (
                // --- BUYING TACTICS ---
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Defect Lever (if player inspected and found a defect) */}
                  {session.item.isDefectDiscovered && session.item.hiddenDefect && (
                    <button
                      disabled={isNpcTyping}
                      onClick={() => handleTactic('defect_lever')}
                      className="col-span-2 sm:col-span-4 bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-500/50 p-2.5 rounded-xl transition flex items-center justify-between gap-2 cursor-pointer shadow-sm text-left"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Search className="w-4 h-4 text-amber-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-amber-300 truncate">
                            🔍 Указать на дефект: «{session.item.hiddenDefect}»
                          </div>
                          <div className="text-[10px] text-neutral-400">
                            Продавец пойман на дефекте из осмотра! Скидка 25% без потери терпения.
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold bg-amber-500/30 text-amber-200 px-2.5 py-1 rounded-lg shrink-0">
                        -25% скидка
                      </span>
                    </button>
                  )}

                  <button
                    disabled={isNpcTyping}
                    onClick={() => handleTactic('quick_cash')}
                    className="bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-neutral-200 text-xs font-semibold p-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 transition flex flex-col items-start gap-1 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Быстрый кэш</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-normal line-clamp-2">
                      «Заберу за наличку у твоего подъезда прямо сейчас!»
                    </span>
                  </button>

                  <button
                    disabled={isNpcTyping}
                    onClick={() => handleTactic('tech_flaw')}
                    className="bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-neutral-200 text-xs font-semibold p-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 transition flex flex-col items-start gap-1 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-1 text-sky-400 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Экспертиза</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-normal line-clamp-2">
                      «Вижу следы износа и косяки, скидывай 20%!»
                    </span>
                  </button>

                  <button
                    disabled={isNpcTyping}
                    onClick={() => handleTactic('market_compare')}
                    className="bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-neutral-200 text-xs font-semibold p-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 transition flex flex-col items-start gap-1 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-1 text-purple-400 font-bold">
                      <Tag className="w-3.5 h-3.5" />
                      <span>В магазине дешевле</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-normal line-clamp-2">
                      «Новый с гарантией стоит почти столько же, снижай!»
                    </span>
                  </button>

                  <button
                    disabled={isNpcTyping}
                    onClick={() => handleTactic('taxi_discount')}
                    className="bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-neutral-200 text-xs font-semibold p-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 transition flex flex-col items-start gap-1 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-1 text-emerald-400 font-bold">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>Скинь на бензин</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-normal line-clamp-2">
                      «Скинь символически на бензин через весь город»
                    </span>
                  </button>

                  <button
                    disabled={isNpcTyping}
                    onClick={() => handleTactic('sob_story')}
                    className="bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-neutral-200 text-xs font-semibold p-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 transition flex flex-col items-start gap-1 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-1 text-pink-400 font-bold">
                      <Smile className="w-3.5 h-3.5" />
                      <span>Для племянника</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-normal line-clamp-2">
                      «Беру ребенку на день рождения на последние деньги»
                    </span>
                  </button>

                  <button
                    disabled={isNpcTyping}
                    onClick={() => handleTactic('trade_exchange')}
                    className="bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-neutral-200 text-xs font-semibold p-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 transition flex flex-col items-start gap-1 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-1 text-orange-400 font-bold">
                      <Repeat className="w-3.5 h-3.5" />
                      <span>Обмен с доплатой</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-normal line-clamp-2">
                      «Предлагаю обмен на старый девайс + доплату»
                    </span>
                  </button>

                  <button
                    disabled={isNpcTyping}
                    onClick={() => handleTactic('avito_delivery')}
                    className="bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-neutral-200 text-xs font-semibold p-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 transition flex flex-col items-start gap-1 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-1 text-cyan-400 font-bold">
                      <Truck className="w-3.5 h-3.5" />
                      <span>Авито Доставка</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-normal line-clamp-2">
                      «Оплачу прямо сейчас, но компенсируйте доставку»
                    </span>
                  </button>

                  <button
                    disabled={isNpcTyping}
                    onClick={() => handleTactic('firm_stance')}
                    className="bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-neutral-200 text-xs font-semibold p-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 transition flex flex-col items-start gap-1 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-1 text-rose-400 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Ультиматум</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-normal line-clamp-2">
                      «Моё последнее слово, если нет — разворачиваюсь»
                    </span>
                  </button>
                </div>
              ) : (
                // --- SELLING TACTICS (8 CHOICES) ---
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    disabled={isNpcTyping}
                    onClick={() => handleTactic('firm_stance')}
                    className="bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-neutral-200 text-xs font-semibold p-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 transition flex flex-col items-start gap-1 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-1 text-rose-400 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Без торга</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-normal line-clamp-2">
                      «Вещь в идеале, пломбы на месте. Торга нет»
                    </span>
                  </button>

                  <button
                    disabled={isNpcTyping}
                    onClick={() => handleTactic('quick_cash')}
                    className="bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-neutral-200 text-xs font-semibold p-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 transition flex flex-col items-start gap-1 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Скидка за скорость</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-normal line-clamp-2">
                      «Заберете в течение часа — уступлю 1 000 ₽»
                    </span>
                  </button>

                  <button
                    disabled={isNpcTyping}
                    onClick={() => handleTactic('taxi_discount')}
                    className="bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-neutral-200 text-xs font-semibold p-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 transition flex flex-col items-start gap-1 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-1 text-emerald-400 font-bold">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>500р на дорогу</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-normal line-clamp-2">
                      «Скину 500р на бензин при самовывозе сегодня»
                    </span>
                  </button>

                  <button
                    disabled={isNpcTyping}
                    onClick={() => handleTactic('tech_flaw')}
                    className="bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-neutral-200 text-xs font-semibold p-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 transition flex flex-col items-start gap-1 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-1 text-sky-400 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Предпродажка и ТО</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-normal line-clamp-2">
                      «Лично всё почистил и протестировал. Гарантия!»
                    </span>
                  </button>

                  <button
                    disabled={isNpcTyping}
                    onClick={() => handleTactic('many_calls')}
                    className="bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-neutral-200 text-xs font-semibold p-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 transition flex flex-col items-start gap-1 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-1 text-yellow-400 font-bold">
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Очередь звонков</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-normal line-clamp-2">
                      «Звонили двое, едут забирать по полной цене»
                    </span>
                  </button>

                  <button
                    disabled={isNpcTyping}
                    onClick={() => handleTactic('bonus_gift')}
                    className="bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-neutral-200 text-xs font-semibold p-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 transition flex flex-col items-start gap-1 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-1 text-purple-400 font-bold">
                      <Gift className="w-3.5 h-3.5" />
                      <span>Подарок бонусом</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-normal line-clamp-2">
                      «Цену не снижу, но отдам чехол/провода в подарок»
                    </span>
                  </button>

                  <button
                    disabled={isNpcTyping}
                    onClick={() => handleTactic('split_difference')}
                    className="bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-neutral-200 text-xs font-semibold p-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 transition flex flex-col items-start gap-1 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-1 text-cyan-400 font-bold">
                      <Repeat className="w-3.5 h-3.5" />
                      <span>Сойтись пополам</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-normal line-clamp-2">
                      «Давайте ровно посередине между нашими ценами»
                    </span>
                  </button>

                  <button
                    disabled={isNpcTyping}
                    onClick={() => handleTactic('quick_cash')}
                    className="bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-neutral-200 text-xs font-semibold p-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 transition flex flex-col items-start gap-1 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-1 text-emerald-400 font-bold">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Бронь залог</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-normal line-clamp-2">
                      «Бронь держу только при условии выкупа сегодня»
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Agreement / Finished Status Banner */}
          {isDealAgreed && !isFinished && (
            <div className="bg-emerald-950/60 border border-emerald-500/60 rounded-xl px-3 py-2 flex items-center justify-between text-xs text-emerald-300 animate-fade-in">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                <span><strong>Сделка согласована!</strong> Собеседник готов на цену: <strong>{currentOffer.toLocaleString('ru-RU')} ₽</strong></span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-900/50 px-2 py-0.5 rounded">Нажмите кнопку ниже для закрытия</span>
            </div>
          )}

          {isFinished && (
            <div className="bg-rose-950/60 border border-rose-800/60 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span><strong>Переговоры сорваны!</strong> Собеседник отказался продолжать диалог и вышел из чата.</span>
            </div>
          )}

          {/* Custom Price Input & Big Conclusion Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-neutral-800/80">
            {!isFinished && npcPatience > 15 && (
              <div className="flex-1 flex items-center gap-1.5 min-w-[200px]">
                <input
                  type="number"
                  placeholder="Ввести точную сумму в ₽..."
                  value={customPriceInput}
                  onChange={(e) => setCustomPriceInput(e.target.value)}
                  className="bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 flex-1 font-mono"
                />
                <button
                  onClick={() => handleTactic('custom_offer')}
                  disabled={!customPriceInput || isNpcTyping}
                  className="bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-amber-400 px-3.5 py-2 rounded-xl text-xs font-bold border border-neutral-700 transition flex items-center gap-1 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Предложить</span>
                </button>
              </div>
            )}

            {/* Confirm / Walk Away Buttons */}
            <div className="flex items-center gap-2 ml-auto w-full sm:w-auto">
              <button
                onClick={handleWalkAway}
                className="flex-1 sm:flex-none px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-xl border border-neutral-700 transition cursor-pointer"
              >
                Отказаться
              </button>

              <button
                onClick={handleAgreeDeal}
                disabled={isBuyOverBudget || isNpcTyping || (isFinished && !isDealAgreed)}
                className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer ${
                  isBuyOverBudget || (isFinished && !isDealAgreed)
                    ? 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>
                  {session.mode === 'buy'
                    ? `Купить за ${currentOffer.toLocaleString('ru-RU')} ₽`
                    : `Продать за ${currentOffer.toLocaleString('ru-RU')} ₽`}
                </span>
              </button>
            </div>
          </div>

          {isBuyOverBudget && (
            <p className="text-[11px] text-rose-400 font-medium text-center">
              ⚠️ Недостаточно средств на балансе для выкупа товара!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
