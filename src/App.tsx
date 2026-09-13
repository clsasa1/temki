import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  Gavel, 
  Warehouse, 
  Store, 
  TrendingUp, 
  RotateCcw, 
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { 
  GameState, 
  Item, 
  ActiveNegotiation, 
  IncomingBuyerOffer, 
  Skills, 
  WarehouseLevel,
  ItemCategory,
  PassiveBusiness,
  SideGig,
  GameGoal,
  FlexItem
} from './types/game';
import { 
  INITIAL_STATE, 
  WAREHOUSE_LEVELS, 
  GOALS,
  generateMarketItem, 
  generateAuctionLot,
  generateBuyerOffer
} from './data/initialData';
import { getCharacterTitle } from './data/lifestyleData';
import { generateCustomerReview } from './utils/reviewGenerator';
import { Header } from './components/Header';
import { AvitoMarket } from './components/AvitoMarket';
import { AuctionHouse } from './components/AuctionHouse';
import { InventoryView } from './components/InventoryView';
import { MyListingsView } from './components/MyListingsView';
import { NegotiationModal } from './components/NegotiationModal';
import { SkillsView } from './components/SkillsView';
import { MarketTrendsModal } from './components/MarketTrendsModal';
import { RestorationModal } from './components/RestorationModal';
import { ReviewsModal } from './components/ReviewsModal';
import { DailySummaryModal } from './components/DailySummaryModal';
import { PassiveIncomeModal } from './components/PassiveIncomeModal';
import { LifestyleModal } from './components/LifestyleModal';
import { GoalsWidget } from './components/GoalsWidget';
import { GoalCompletedModal } from './components/GoalCompletedModal';
import { sounds } from './utils/audio';

const STORAGE_KEY = 'temshchik_save_state_v1';
const MARKET_FEED_SIZE = 54;

function generateAvailableAuctionLots(
  day: number,
  trends: GameState['trends'],
  currentGoalIndex: number,
) {
  const lots = [generateAuctionLot(day, trends, 'small')];
  if (currentGoalIndex >= 3) {
    lots.push(generateAuctionLot(day, trends, 'vehicles'));
  }
  if (currentGoalIndex >= 4) {
    lots.push(generateAuctionLot(day, trends, 'real_estate'));
  }
  return lots;
}

function hydrateGameState(raw: unknown): GameState | null {
  if (!raw || typeof raw !== 'object') return null;

  const parsed = raw as Partial<GameState>;
  const state: GameState = {
    ...INITIAL_STATE,
    ...parsed,
    skills: { ...INITIAL_STATE.skills, ...(parsed.skills || {}) },
    inventory: Array.isArray(parsed.inventory) ? parsed.inventory : [],
    marketFeed: Array.isArray(parsed.marketFeed) ? parsed.marketFeed : [],
    incomingOffers: Array.isArray(parsed.incomingOffers) ? parsed.incomingOffers : [],
    auctionLots: Array.isArray(parsed.auctionLots) ? parsed.auctionLots : [],
    trends: Array.isArray(parsed.trends) ? parsed.trends : INITIAL_STATE.trends,
    reviews: Array.isArray(parsed.reviews) ? parsed.reviews : INITIAL_STATE.reviews,
    loans: Array.isArray(parsed.loans) ? parsed.loans : [],
    passiveBusinesses: Array.isArray(parsed.passiveBusinesses)
      ? parsed.passiveBusinesses
      : INITIAL_STATE.passiveBusinesses,
    character: {
      ...INITIAL_STATE.character!,
      ...(parsed.character || {}),
      ownedCars: parsed.character?.ownedCars || INITIAL_STATE.character!.ownedCars,
      ownedProperties: parsed.character?.ownedProperties || INITIAL_STATE.character!.ownedProperties,
      purchasedItems: parsed.character?.purchasedItems || INITIAL_STATE.character!.purchasedItems,
    },
    legalStatus: { ...INITIAL_STATE.legalStatus, ...(parsed.legalStatus || {}) },
  };

  const finite = (value: unknown, fallback: number, min = 0) =>
    typeof value === 'number' && Number.isFinite(value) ? Math.max(min, value) : fallback;

  state.money = finite(parsed.money, INITIAL_STATE.money);
  state.day = Math.floor(finite(parsed.day, INITIAL_STATE.day, 1));
  state.reputation = Math.min(5, Math.max(1, finite(parsed.reputation, INITIAL_STATE.reputation, 1)));
  state.reputationPoints = finite(parsed.reputationPoints, INITIAL_STATE.reputationPoints);
  state.warehouseLevel = Math.max(1, Math.floor(finite(parsed.warehouseLevel, INITIAL_STATE.warehouseLevel, 1)));
  state.skills = {
    negotiation: Math.min(10, Math.max(1, Math.floor(finite(parsed.skills?.negotiation, 1, 1)))),
    assessment: Math.min(10, Math.max(1, Math.floor(finite(parsed.skills?.assessment, 1, 1)))),
    restoration: Math.min(10, Math.max(1, Math.floor(finite(parsed.skills?.restoration, 1, 1)))),
    storage: Math.min(10, Math.max(1, Math.floor(finite(parsed.skills?.storage, 1, 1)))),
    auctionSmarts: Math.min(10, Math.max(1, Math.floor(finite(parsed.skills?.auctionSmarts, 1, 1)))),
  };
  if (state.character) {
    state.character.aura = finite(parsed.character?.aura, INITIAL_STATE.character!.aura);
    state.character.maxEnergy = Math.max(100, finite(parsed.character?.maxEnergy, INITIAL_STATE.character!.maxEnergy, 100));
    state.character.totalSpentOnFlex = finite(
      parsed.character?.totalSpentOnFlex,
      INITIAL_STATE.character!.totalSpentOnFlex,
    );
    if (!Array.isArray(parsed.character?.ownedCars)) state.character.ownedCars = [];
    if (!Array.isArray(parsed.character?.ownedProperties)) state.character.ownedProperties = [];
    if (!Array.isArray(parsed.character?.purchasedItems)) state.character.purchasedItems = [];
  }
  state.energy = Math.min(state.character?.maxEnergy || 100, finite(parsed.energy, 100));
  state.totalProfit = typeof parsed.totalProfit === 'number' && Number.isFinite(parsed.totalProfit)
    ? parsed.totalProfit
    : 0;
  state.dealsCount = Math.floor(finite(parsed.dealsCount, 0));
  state.currentGoalIndex = Math.max(0, Math.floor(finite(parsed.currentGoalIndex, 0)));
  state.auctionLots = state.auctionLots.filter(
    (lot) =>
      !lot.tier ||
      lot.tier === 'small' ||
      (lot.tier === 'vehicles' && state.currentGoalIndex >= 3) ||
      (lot.tier === 'real_estate' && state.currentGoalIndex >= 4),
  );

  if (!state.specialization) state.specialization = 'all';
  const existingCategories = new Set(state.trends.map((trend) => trend.category));
  state.trends = [
    ...state.trends,
    ...INITIAL_STATE.trends.filter((trend) => !existingCategories.has(trend.category)),
  ];

  return state;
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = hydrateGameState(JSON.parse(saved));
        if (parsed) {
          // Expand the feed when loading an older save with fewer listings.
          if (parsed.marketFeed.length < MARKET_FEED_SIZE) {
            const diff = MARKET_FEED_SIZE - parsed.marketFeed.length;
            const extra = Array.from({ length: diff }).map((_, idx) =>
              generateMarketItem(`fill-${Date.now()}-${idx}`, parsed.trends, parsed.specialization, parsed.money)
            );
            parsed.marketFeed = [...parsed.marketFeed, ...extra];
          }
          return parsed;
        }
      }
    } catch {}
    
    // Seed initial state
    const seeded = { ...INITIAL_STATE };
    // Generate 54 initial market items for a huge, bustling marketplace
    seeded.marketFeed = Array.from({ length: MARKET_FEED_SIZE }).map((_, idx) =>
      generateMarketItem(`init-${idx}`, seeded.trends, seeded.specialization, seeded.money)
    );
    // Generate 3 auction lots across tiers
    seeded.auctionLots = generateAvailableAuctionLots(1, seeded.trends, seeded.currentGoalIndex);
    return seeded;
  });

  const [activeTab, setActiveTab] = useState<'avito' | 'auctions' | 'inventory' | 'my_listings'>('avito');
  const [activeNegotiation, setActiveNegotiation] = useState<ActiveNegotiation | null>(null);
  const [restoringItem, setRestoringItem] = useState<Item | null>(null);
  const [isSkillsOpen, setIsSkillsOpen] = useState<boolean>(false);
  const [isTrendsOpen, setIsTrendsOpen] = useState<boolean>(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState<boolean>(false);
  const [isDailySummaryOpen, setIsDailySummaryOpen] = useState<boolean>(false);
  const [isPassiveIncomeOpen, setIsPassiveIncomeOpen] = useState<boolean>(false);
  const [isLifestyleOpen, setIsLifestyleOpen] = useState<boolean>(false);
  const [lastRentPaid, setLastRentPaid] = useState<number>(0);
  const [lastPassiveEarned, setLastPassiveEarned] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [celebratingGoal, setCelebratingGoal] = useState<GameGoal | null>(null);
  const dayTransitionInProgress = useRef(false);

  // Save to localStorage whenever critical state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    } catch {}
  }, [gameState]);

  // Auction countdown timer loop
  useEffect(() => {
    const timer = setInterval(() => {
      setGameState((prev) => {
        let changed = false;
        const updatedLots = prev.auctionLots.map((lot) => {
          if (lot.isCompleted) return lot;

          changed = true;
          const nextSeconds = lot.secondsLeft - 1;

          // AI Bot bidding simulation: bots can outbid the player and each other
          let currentBid = lot.currentBid;
          let currentLeader = lot.currentLeader;

          // Realistic dynamic auction bidding
          if (nextSeconds > 2 && Math.random() < 0.35) {
            const availableBots = lot.bidders.filter((b) => b.maxBid > currentBid && b.name !== currentLeader);
            if (availableBots.length > 0) {
              const bidder = availableBots[Math.floor(Math.random() * availableBots.length)];
              const step = currentBid >= 1000000 ? 50000 : currentBid >= 100000 ? 10000 : 2000;
              const nextBid = Math.min(
                bidder.maxBid,
                currentBid + step + Math.floor(Math.random() * 2) * step,
              );
              if (nextBid > currentBid) {
                currentBid = nextBid;
                currentLeader = bidder.name;
                sounds.playHammer();
              }
            }
          }

          if (nextSeconds <= 0) {
            const wonByPlayer = currentLeader === 'Вы (Игрок)';
            if (wonByPlayer) {
              sounds.playSuccess();
            }
            return {
              ...lot,
              secondsLeft: 0,
              isCompleted: true,
              wonByPlayer,
              currentBid,
              currentLeader,
            };
          }

          return {
            ...lot,
            secondsLeft: nextSeconds,
            currentBid,
            currentLeader,
          };
        });

        if (!changed) return prev;
        return { ...prev, auctionLots: updatedLots };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Compute warehouse and storage
  const currentWarehouse: WarehouseLevel = 
    WAREHOUSE_LEVELS.find((w) => w.level === gameState.warehouseLevel) || WAREHOUSE_LEVELS[0];

  // Storage skills bonus
  const storageSkillBonus = (gameState.skills.storage - 1) * 0.15;
  const effectiveMaxWeight = currentWarehouse.maxWeightKg * (1 + storageSkillBonus);
  const effectiveMaxSlots = currentWarehouse.maxSlots + (gameState.skills.storage - 1) * 2;

  const effectiveWarehouse: WarehouseLevel = {
    ...currentWarehouse,
    maxWeightKg: Math.round(effectiveMaxWeight),
    maxSlots: effectiveMaxSlots,
  };

  const totalInventoryWeight = gameState.inventory.reduce((acc, it) => acc + it.weightKg, 0);

  // --- ACTIONS ---

  // Buy item instantly from Avito feed
  const handleBuyInstant = (item: Item) => {
    const cost = item.boughtPrice || item.baseValue;
    if (gameState.money < cost) return;
    if (totalInventoryWeight + item.weightKg > effectiveWarehouse.maxWeightKg) {
      alert('Перевес на складе! Освободите место или улучшите склад.');
      return;
    }
    if (gameState.inventory.length >= effectiveWarehouse.maxSlots) {
      alert('Все слоты на складе заняты!');
      return;
    }

    setGameState((prev) => {
      const feedItem = prev.marketFeed.find((marketItem) => marketItem.id === item.id);
      const weight = prev.inventory.reduce((total, inventoryItem) => total + inventoryItem.weightKg, 0);
      if (
        !feedItem ||
        prev.money < cost ||
        prev.inventory.length >= effectiveWarehouse.maxSlots ||
        weight + feedItem.weightKg > effectiveWarehouse.maxWeightKg
      ) {
        return prev;
      }
      return {
        ...prev,
        money: prev.money - cost,
        inventory: [...prev.inventory, { ...feedItem, boughtPrice: cost }],
        marketFeed: prev.marketFeed.filter((marketItem) => marketItem.id !== item.id),
        energy: Math.max(0, prev.energy - 4),
      };
    });
  };

  // Start negotiation as buyer
  const handleStartBuyNegotiation = (item: Item) => {
    const askingPrice = item.boughtPrice || item.baseValue;
    const minAcceptable = Math.round((askingPrice * 0.65) / 100) * 100;

    const session: ActiveNegotiation = {
      id: `neg-${Date.now()}`,
      item,
      mode: 'buy',
      npcName: item.sellerNotes || 'Продавец с Авито',
      npcAvatar: '👤',
      npcRole: 'Продавец',
      initialPrice: askingPrice,
      currentOffer: askingPrice,
      minAcceptablePrice: minAcceptable,
      maxAcceptablePrice: askingPrice,
      npcPatience: 80,
      chatHistory: [
        {
          id: 'init-msg',
          from: 'npc',
          text: `Здравствуйте! Продаю «${item.name}». Цена ${askingPrice.toLocaleString('ru-RU')} ₽, без торга и глупых вопросов.`,
          priceTag: askingPrice,
        },
      ],
      dealClosed: false,
    };

    setActiveNegotiation(session);
  };

  // Start negotiation as seller (answering a buyer offer)
  const handleStartSellNegotiation = (offer: IncomingBuyerOffer, item: Item) => {
    const session: ActiveNegotiation = {
      id: `neg-sell-${Date.now()}`,
      item,
      mode: 'sell',
      npcName: offer.buyerName,
      npcAvatar: offer.buyerAvatar,
      npcRole: 'Покупатель',
      initialPrice: item.listedPrice || item.currentMarketValue,
      currentOffer: offer.offeredPrice,
      minAcceptablePrice: Math.round((item.currentMarketValue * 0.75) / 100) * 100,
      maxAcceptablePrice: item.listedPrice || item.currentMarketValue,
      npcPatience: offer.patience,
      chatHistory: [
        {
          id: 'init-offer-msg',
          from: 'npc',
          text: offer.message,
          priceTag: offer.offeredPrice,
        },
      ],
      dealClosed: false,
    };

    setActiveNegotiation(session);
  };

  // Finish negotiation modal
  const handleFinishNegotiation = (dealAgreed: boolean, finalPrice: number, session: ActiveNegotiation) => {
    setActiveNegotiation(null);

    if (!dealAgreed || !Number.isFinite(finalPrice) || finalPrice <= 0) return;

    if (session.mode === 'buy') {
      // Player bought item
      if (gameState.money < finalPrice) return;
      if (totalInventoryWeight + session.item.weightKg > effectiveWarehouse.maxWeightKg) {
        alert('Перевес на складе! Товар не поместился.');
        return;
      }
      if (gameState.inventory.length >= effectiveWarehouse.maxSlots) {
        alert('Все слоты на складе заняты!');
        return;
      }

      const boughtItem: Item = {
        ...session.item,
        boughtPrice: finalPrice,
      };

      setGameState((prev) => ({
        ...prev,
        ...(prev.money < finalPrice ||
        !prev.marketFeed.some((it) => it.id === session.item.id) ||
        prev.inventory.length >= effectiveWarehouse.maxSlots ||
        prev.inventory.reduce((weight, item) => weight + item.weightKg, 0) + session.item.weightKg > effectiveWarehouse.maxWeightKg
          ? {}
          : {
              money: prev.money - finalPrice,
              inventory: [...prev.inventory, boughtItem],
              marketFeed: prev.marketFeed.filter((it) => it.id !== session.item.id),
              energy: Math.max(0, prev.energy - 6),
            }),
      }));
    } else {
      // Player sold item!
      const soldItem = session.item;
      setGameState((prev) => {
        const inventoryItem = prev.inventory.find((item) => item.id === soldItem.id);
        if (!inventoryItem || !inventoryItem.isListed) return prev;

        const profit = finalPrice - (inventoryItem.boughtPrice || 0);
        const newReview = generateCustomerReview({
          item: inventoryItem,
          finalPrice,
          npcName: session.npcName,
          npcPatience: session.npcPatience,
          day: prev.day,
        });
        const allReviews = [newReview, ...prev.reviews];
        const avgRep = allReviews.reduce((sum, review) => sum + review.stars, 0) / allReviews.length;

        return {
          ...prev,
          money: prev.money + finalPrice,
          totalProfit: prev.totalProfit + profit,
          dealsCount: prev.dealsCount + 1,
          inventory: prev.inventory.filter((it) => it.id !== soldItem.id),
          incomingOffers: prev.incomingOffers.filter((o) => o.itemId !== soldItem.id),
          reviews: allReviews,
          reputation: Number(avgRep.toFixed(1)),
          energy: Math.max(0, prev.energy - 5),
        };
      });
    }
  };

  // Inspect item on Avito
  const handleInspectItem = (itemId: string) => {
    if (gameState.energy < 5) return;
    sounds.playTap();

    setGameState((prev) => ({
      ...prev,
      ...(prev.energy < 5 || !prev.marketFeed.some((item) => item.id === itemId && !item.isDefectDiscovered)
        ? {}
        : {
            energy: prev.energy - 5,
            marketFeed: prev.marketFeed.map((item) =>
              item.id === itemId ? { ...item, isDefectDiscovered: true } : item
            ),
          }),
    }));
  };

  // Refresh Avito feed with new random items (54 items for massive bustling feed)
  const handleRefreshFeed = () => {
    setGameState((prev) => {
      const freshItems = Array.from({ length: MARKET_FEED_SIZE }).map((_, i) =>
        generateMarketItem(`ref-${Date.now()}-${i}`, prev.trends, prev.specialization, prev.money)
      );
      return {
        ...prev,
        marketFeed: freshItems,
      };
    });
  };

  // Change trading specialization / niche focus
  const handleSelectSpecialization = (spec: ItemCategory | 'all') => {
    setGameState((prev) => {
      // Regenerate feed with heavy bias towards chosen specialization!
      const freshItems = Array.from({ length: MARKET_FEED_SIZE }).map((_, i) =>
        generateMarketItem(`spec-${Date.now()}-${i}`, prev.trends, spec, prev.money)
      );
      return {
        ...prev,
        specialization: spec,
        marketFeed: freshItems,
      };
    });
  };

  // Passive business purchase
  const handleBuyBusiness = (business: PassiveBusiness) => {
    if (gameState.money < business.cost || business.isUnlocked) return;
    setGameState((prev) => {
      const storedBusiness = (prev.passiveBusinesses || []).find((candidate) => candidate.id === business.id);
      if (!storedBusiness || storedBusiness.isUnlocked || prev.money < storedBusiness.cost) return prev;
      return {
        ...prev,
        money: prev.money - storedBusiness.cost,
        passiveBusinesses: (prev.passiveBusinesses || []).map((candidate) =>
          candidate.id === storedBusiness.id ? { ...candidate, isUnlocked: true } : candidate
        ),
      };
    });
  };

  // Side gig execution for quick cash when broke or extra energy
  const handleDoSideGig = (gig: SideGig) => {
    if (gameState.energy < gig.energyCost) return;
    setGameState((prev) =>
      prev.energy < gig.energyCost
        ? prev
        : {
            ...prev,
            money: prev.money + gig.reward,
            energy: Math.max(0, prev.energy - gig.energyCost),
          }
    );
  };

  // Place bid on Auction lot
  const handlePlaceBid = (lotId: string, newBid: number) => {
    setGameState((prev) => ({
      ...prev,
      auctionLots: prev.auctionLots.map((lot) => {
        if (
          lot.id !== lotId ||
          lot.isCompleted ||
          !Number.isFinite(newBid) ||
          newBid <= lot.currentBid ||
          newBid > prev.money
        ) return lot;
        return {
          ...lot,
          currentBid: newBid,
          currentLeader: 'Вы (Игрок)',
          playerBid: newBid,
          secondsLeft: Math.max(12, lot.secondsLeft), // reset timer slightly on active bid
        };
      }),
    }));
  };

  // Inspect & assess court appraisal validity of an auction lot
  const handleInspectLot = (lotId: string) => {
    if (gameState.energy < 8) {
      alert('Недостаточно энергии (нужно 8 ⚡ для юридической и рыночной экспертизы лота)!');
      return;
    }
    sounds.playTap();
    setGameState((prev) => ({
      ...prev,
      ...(prev.energy < 8 || !prev.auctionLots.some((lot) => lot.id === lotId && !lot.isAppraisalVerified)
        ? {}
        : {
            energy: Math.max(0, prev.energy - 8),
            auctionLots: prev.auctionLots.map((lot) =>
              lot.id === lotId ? { ...lot, isAppraisalVerified: true } : lot
            ),
          }),
    }));
  };

  // Claim won auction lot into warehouse
  const handleClaimAuctionLot = (lotId: string) => {
    setGameState((prev) => {
      const lot = prev.auctionLots.find((candidate) => candidate.id === lotId);
      if (!lot || !lot.wonByPlayer) return prev;

      const lotWeight = lot.items.reduce((acc, item) => acc + item.weightKg, 0);
      const inventoryWeight = prev.inventory.reduce((acc, item) => acc + item.weightKg, 0);
      if (
        inventoryWeight + lotWeight > effectiveWarehouse.maxWeightKg ||
        prev.inventory.length + lot.items.length > effectiveWarehouse.maxSlots ||
        prev.money < lot.currentBid ||
        lot.items.length === 0
      ) {
        return prev;
      }

      const perItemPrice = Math.round(lot.currentBid / lot.items.length);
      const stampedItems = lot.items.map((item) => ({ ...item, boughtPrice: perItemPrice }));

      return {
        ...prev,
        money: prev.money - lot.currentBid,
        inventory: [...prev.inventory, ...stampedItems],
        auctionLots: prev.auctionLots.filter((candidate) => candidate.id !== lotId),
      };
    });
  };

  // Request new auction lots
  const handleGenerateNewAuctionLots = () => {
    setGameState((prev) => ({
      ...prev,
      auctionLots: generateAvailableAuctionLots(prev.day, prev.trends, prev.currentGoalIndex),
    }));
  };

  // Upgrade warehouse
  const handleUpgradeWarehouse = () => {
    const nextLvl = gameState.warehouseLevel + 1;
    const nextCfg = WAREHOUSE_LEVELS.find((w) => w.level === nextLvl);
    if (!nextCfg || gameState.money < nextCfg.upgradeCost) return;

    setGameState((prev) =>
      prev.warehouseLevel !== gameState.warehouseLevel ||
      prev.money < nextCfg.upgradeCost ||
      prev.warehouseLevel >= WAREHOUSE_LEVELS[WAREHOUSE_LEVELS.length - 1].level
        ? prev
        : {
            ...prev,
            money: prev.money - nextCfg.upgradeCost,
            warehouseLevel: nextLvl,
          }
    );
  };

  // List item on Avito
  const handleListItemForSale = (item: Item, price: number) => {
    if (!Number.isFinite(price) || price <= 0) return;
    setGameState((prev) => {
      const storedItem = prev.inventory.find((inventoryItem) => inventoryItem.id === item.id);
      if (!storedItem || storedItem.isListed) return prev;

      const updatedInventory = prev.inventory.map((it) =>
        it.id === item.id ? { ...it, isListed: true, listedPrice: price } : it
      );

      const targetItem = { ...storedItem, isListed: true, listedPrice: price };
      const newOffer = generateBuyerOffer(targetItem);

      return {
        ...prev,
        inventory: updatedInventory,
        incomingOffers: [...prev.incomingOffers.filter((offer) => offer.itemId !== item.id), newOffer],
      };
    });
  };

  // Unlist item
  const handleUnlistItem = (itemId: string) => {
    sounds.playTap();
    setGameState((prev) => ({
      ...prev,
      inventory: prev.inventory.map((it) =>
        it.id === itemId ? { ...it, isListed: false, listedPrice: undefined } : it
      ),
      incomingOffers: prev.incomingOffers.filter((o) => o.itemId !== itemId),
    }));
  };

  // Accept offer directly
  const handleAcceptOffer = (offer: IncomingBuyerOffer, item: Item) => {
    sounds.playCash();
    setGameState((prev) => {
      const storedItem = prev.inventory.find((inventoryItem) => inventoryItem.id === item.id);
      const offerStillExists = prev.incomingOffers.some((incomingOffer) => incomingOffer.id === offer.id);
      if (!storedItem || !storedItem.isListed || !offerStillExists) return prev;

      const profit = offer.offeredPrice - (storedItem.boughtPrice || 0);
      const review = generateCustomerReview({
        item: storedItem,
        finalPrice: offer.offeredPrice,
        npcName: offer.buyerName,
        npcPatience: offer.patience,
        day: prev.day,
      });
      const allReviews = [review, ...prev.reviews];
      const avgRep = allReviews.reduce((sum, reviewItem) => sum + reviewItem.stars, 0) / allReviews.length;

      return {
        ...prev,
        money: prev.money + offer.offeredPrice,
        totalProfit: prev.totalProfit + profit,
        dealsCount: prev.dealsCount + 1,
        inventory: prev.inventory.filter((inventoryItem) => inventoryItem.id !== item.id),
        incomingOffers: prev.incomingOffers.filter((incomingOffer) => incomingOffer.itemId !== item.id),
        reviews: allReviews,
        reputation: Number(avgRep.toFixed(1)),
      };
    });
  };

  // Lifestyle item purchase (cars, real estate, gadgets, fun)
  const handleBuyFlex = (item: FlexItem) => {
    if (gameState.money < item.cost) return;

    setGameState((prev) => {
      const currentChar = prev.character || INITIAL_STATE.character!;
      if (
        prev.money < item.cost ||
        (!item.isRepeatable && currentChar.purchasedItems.includes(item.id))
      ) {
        return prev;
      }
      const newAura = currentChar.aura + item.auraBonus;
      const newMaxEnergy = currentChar.maxEnergy + (item.maxEnergyBonus || 0);
      const newEnergy = Math.min(newMaxEnergy, prev.energy + (item.energyBonus || 0));
      const newTotalSpent = currentChar.totalSpentOnFlex + item.cost;
      const newTitle = getCharacterTitle(newAura);

      const updatedCars = item.category === 'cars' && !currentChar.ownedCars.includes(item.id)
        ? [...currentChar.ownedCars, item.id]
        : currentChar.ownedCars;

      const updatedProperties = item.category === 'real_estate' && !currentChar.ownedProperties.includes(item.id)
        ? [...currentChar.ownedProperties, item.id]
        : currentChar.ownedProperties;

      const updatedPurchased = !item.isRepeatable && !currentChar.purchasedItems.includes(item.id)
        ? [...currentChar.purchasedItems, item.id]
        : currentChar.purchasedItems;

      return {
        ...prev,
        money: prev.money - item.cost,
        energy: newEnergy,
        character: {
          aura: newAura,
          title: newTitle,
          maxEnergy: newMaxEnergy,
          totalSpentOnFlex: newTotalSpent,
          ownedCars: updatedCars,
          ownedProperties: updatedProperties,
          purchasedItems: updatedPurchased,
        },
      };
    });
  };

  // Reject offer
  const handleRejectOffer = (offerId: string) => {
    setGameState((prev) => ({
      ...prev,
      incomingOffers: prev.incomingOffers.filter((o) => o.id !== offerId),
    }));
  };

  // Quick scrap sell
  const handleQuickScrapSell = (item: Item) => {
    setGameState((prev) => ({
      ...prev,
      ...(prev.inventory.some((inventoryItem) => inventoryItem.id === item.id)
        ? {
            money: prev.money + Math.round(item.currentMarketValue * 0.55),
            totalProfit: prev.totalProfit + Math.round(item.currentMarketValue * 0.55) - (item.boughtPrice || 0),
            inventory: prev.inventory.filter((inventoryItem) => inventoryItem.id !== item.id),
            incomingOffers: prev.incomingOffers.filter((offer) => offer.itemId !== item.id),
          }
        : {}),
    }));
  };

  // Finish Restoration
  const handleRestoreSuccess = (updatedItem: Item, cost: number, energyUsed: number) => {
    setRestoringItem(null);
    setGameState((prev) => {
      if (
        !Number.isFinite(cost) ||
        !Number.isFinite(energyUsed) ||
        cost < 0 ||
        energyUsed < 0 ||
        prev.money < cost ||
        prev.energy < energyUsed ||
        !prev.inventory.some((item) => item.id === updatedItem.id) ||
        prev.inventory.some((item) => item.id === updatedItem.id && item.isRestored)
      ) {
        return prev;
      }
      return {
        ...prev,
        money: prev.money - cost,
        energy: Math.max(0, prev.energy - energyUsed),
        inventory: prev.inventory.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      };
    });
  };

  // Upgrade Skill
  const handleUpgradeSkill = (skillKey: keyof Skills, cost: number) => {
    if (gameState.money < cost || !Number.isFinite(cost)) return;
    setGameState((prev) => ({
      ...prev,
      ...(prev.money < cost || prev.skills[skillKey] >= 10
        ? {}
        : {
            money: prev.money - cost,
            skills: {
              ...prev.skills,
              [skillKey]: prev.skills[skillKey] + 1,
            },
          }),
    }));
  };

  // End Day / Sleep mechanic: dynamic market shifts, rent, refreshed feed!
  const handleEndDay = () => {
    if (isDailySummaryOpen || dayTransitionInProgress.current) return;
    dayTransitionInProgress.current = true;
    const rent = currentWarehouse.rentPerDay;
    const passive = (gameState.passiveBusinesses || [])
      .filter((b) => b.isUnlocked)
      .reduce((sum, b) => sum + b.dailyIncome, 0);
    setLastRentPaid(rent);
    setLastPassiveEarned(passive);
    setIsDailySummaryOpen(true);
  };

  const handleStartNextDay = () => {
    if (!dayTransitionInProgress.current) return;
    dayTransitionInProgress.current = false;
    setIsDailySummaryOpen(false);

    // Calculate dynamic market fluctuations
    const updatedTrends = gameState.trends.map((t) => {
      // random delta between -0.15 and +0.20
      const delta = (Math.random() - 0.45) * 0.25;
      const newMult = Math.max(0.6, Math.min(2.0, Number((t.multiplier + delta).toFixed(2))));
      const direction: 'up' | 'down' | 'stable' = 
        newMult > t.multiplier ? 'up' : newMult < t.multiplier ? 'down' : 'stable';

      const headlines = {
        up: [
          `Взрывной спрос в категории «${t.categoryName}»! Покупатели выстраиваются в очередь.`,
          `Дефицит комплектующих: цены на «${t.categoryName}» пошли резко вверх.`,
          `Новый тренд в соцсетях поднял стоимость вторичного рынка в этой категории.`,
        ],
        down: [
          `Рынок перенасыщен: оптовики сбрасывают излишки категории «${t.categoryName}».`,
          `Временное затишье: спрос на «${t.categoryName}» ослаб, цены просели.`,
          `Появились дешевые китайские аналоги, вторичный рынок вынужден снижать планку.`,
        ],
        stable: [
          `Стабильный умеренный спрос на «${t.categoryName}». Без резких скачков.`,
        ],
      };

      const headlineList = headlines[direction];
      const randomHeadline = headlineList[Math.floor(Math.random() * headlineList.length)];

      return {
        ...t,
        multiplier: newMult,
        trendDirection: direction,
        newsHeadline: randomHeadline,
      };
    });

    // Update market prices of existing inventory based on new trends
    const updatedInventory = gameState.inventory.map((item) => {
      const tr = updatedTrends.find((t) => t.category === item.category);
      const mult = tr ? tr.multiplier : 1.0;
      const condMult = item.condition === 'mint' ? 1.15 : item.condition === 'good' ? 1.0 : item.condition === 'worn' ? 0.75 : 0.45;
      const newMkt = Math.round((item.baseValue * mult * condMult) / 100) * 100;
      return {
        ...item,
        currentMarketValue: item.isRestored ? Math.round(newMkt * 1.25) : newMkt,
      };
    });

    // Generate a full feed so sleeping does not unexpectedly remove most of the market.
    const freshFeed = Array.from({ length: MARKET_FEED_SIZE }).map((_, i) =>
      generateMarketItem(`day-${gameState.day + 1}-${i}`, updatedTrends, gameState.specialization, gameState.money)
    );

    const freshLots = generateAvailableAuctionLots(
      gameState.day + 1,
      updatedTrends,
      gameState.currentGoalIndex,
    );

    // Generate new buyer offers for items currently listed using realistic buyer generation
    const listed = updatedInventory.filter((it) => it.isListed);
    const freshOffers: IncomingBuyerOffer[] = [];

    const existingOfferItemIds = new Set(gameState.incomingOffers.map((offer) => offer.itemId));
    listed.forEach((it) => {
      if (!existingOfferItemIds.has(it.id) && Math.random() < 0.75) {
        freshOffers.push(generateBuyerOffer(it));
      }
    });

    setGameState((prev) => ({
      ...prev,
      day: prev.day + 1,
      energy: prev.character?.maxEnergy || 100,
      money: Math.max(0, prev.money - lastRentPaid + lastPassiveEarned),
      trends: updatedTrends,
      inventory: updatedInventory,
      marketFeed: freshFeed,
      auctionLots: freshLots,
      incomingOffers: [...prev.incomingOffers, ...freshOffers],
    }));
  };

  // Sound toggle handler
  const handleToggleSound = () => {
    const nextState = sounds.toggleSound();
    setSoundEnabled(nextState);
  };

  // Reset Game option
  const handleResetGame = () => {
    if (confirm('Вы уверены, что хотите начать карьеру темщика заново? Все сохранения будут сброшены.')) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
      window.location.reload();
    }
  };

  // Claim & close current career goal
  const handleClaimGoal = (goalIndex: number) => {
    const goal = GOALS[goalIndex];
    if (!goal) return;

    if (gameState.currentGoalIndex !== goalIndex || gameState.money < goal.targetMoney) {
      alert(`Для этой цели нужно накопить ${goal.targetMoney.toLocaleString('ru-RU')} ₽.`);
      return;
    }
    if (gameState.money < goal.repayAmount) {
      alert(`Недостаточно средств для закрытия цели: требуется ${goal.repayAmount.toLocaleString('ru-RU')} ₽!`);
      return;
    }

    setGameState((prev) => {
      if (prev.currentGoalIndex !== goalIndex || prev.money < goal.targetMoney || prev.money < goal.repayAmount) {
        return prev;
      }
      let updatedReputation = prev.reputation;
      if (goal.id === 2) {
        updatedReputation = Math.min(5.0, Number((prev.reputation + 0.3).toFixed(1)));
      }

      return {
        ...prev,
        money: prev.money - goal.repayAmount,
        reputation: updatedReputation,
        currentGoalIndex: prev.currentGoalIndex + 1,
        auctionLots: goal.id === 4 || goal.id === 5
          ? generateAvailableAuctionLots(prev.day, prev.trends, prev.currentGoalIndex + 1)
          : prev.auctionLots,
        // If goal 1 (microloan) was repaid, clear any active loans
        loans: goal.id === 1 ? [] : prev.loans,
      };
    });

    sounds.playSuccess();
    setCelebratingGoal(goal);
  };

  const listedItems = gameState.inventory.filter((it) => it.isListed);

  return (
    <div className="tm-shell min-h-screen text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-neutral-950">
      {/* Top Main Navigation Header */}
      <Header
        state={gameState}
        warehouse={effectiveWarehouse}
        totalWeight={totalInventoryWeight}
        onEndDay={handleEndDay}
        onOpenTrends={() => setIsTrendsOpen(true)}
        onOpenReviews={() => setIsReviewsOpen(true)}
        onOpenSkills={() => setIsSkillsOpen(true)}
        onOpenPassiveIncome={() => setIsPassiveIncomeOpen(true)}
        onOpenLifestyle={() => setIsLifestyleOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 space-y-4">
        <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#344036] pb-4">
          <div>
            <p className="tm-kicker mb-1">Операционный стол / день {gameState.day}</p>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Где сегодня лежат деньги?
            </h2>
            <p className="text-sm text-[#93a096] mt-1 max-w-xl">
              Сканируй ленту, считай маржу и не забивай склад товаром без выхода.
            </p>
          </div>
          <div className="flex gap-4 text-xs font-mono text-[#93a096] sm:text-right">
            <div>
              <span className="block text-[#667467] uppercase tracking-wider text-[10px]">В ленте</span>
              <strong className="text-[#e9ad32] text-lg">{gameState.marketFeed.length}</strong>
            </div>
            <div>
              <span className="block text-[#667467] uppercase tracking-wider text-[10px]">Сделок</span>
              <strong className="text-white text-lg">{gameState.dealsCount}</strong>
            </div>
            <div>
              <span className="block text-[#667467] uppercase tracking-wider text-[10px]">Маржа</span>
              <strong className="text-[#8fce7b] text-lg">{gameState.totalProfit.toLocaleString('ru-RU')} ₽</strong>
            </div>
          </div>
        </section>

        {/* Goals Progress Widget */}
        <GoalsWidget
          currentGoalIndex={gameState.currentGoalIndex}
          money={gameState.money}
          dealsCount={gameState.dealsCount}
          onClaimGoal={handleClaimGoal}
        />

        {/* Navigation Tabs Bar - Responsive Grid, No Horizontal Scrollbar */}
        <nav className="tm-market-deck grid grid-cols-2 sm:grid-cols-4 gap-0 bg-transparent py-1 shadow-xs">
          <button
            id="tab-avito"
            onClick={() => {
              sounds.playTap();
              setActiveTab('avito');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-bold text-xs sm:text-sm transition cursor-pointer ${
              activeTab === 'avito'
                ? 'bg-amber-500 text-neutral-950 border border-amber-400 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <Store className="w-4 h-4 shrink-0" />
            <span>Авито</span>
            <span className="text-[10px] bg-neutral-950 px-1.5 py-0.5 rounded-md font-mono text-neutral-300">
              {gameState.marketFeed.length}
            </span>
          </button>

          <button
            id="tab-auctions"
            onClick={() => {
              sounds.playTap();
              setActiveTab('auctions');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-bold text-xs sm:text-sm transition cursor-pointer ${
              activeTab === 'auctions'
                ? 'bg-amber-500 text-neutral-950 border border-amber-400 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <Gavel className="w-4 h-4 shrink-0" />
            <span className="truncate">Торги и конфискат</span>
            <span className="text-[10px] bg-neutral-950 px-1.5 py-0.5 rounded-md font-mono text-neutral-300">
              {gameState.auctionLots.length}
            </span>
          </button>

          <button
            id="tab-inventory"
            onClick={() => {
              sounds.playTap();
              setActiveTab('inventory');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-bold text-xs sm:text-sm transition cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-amber-500 text-neutral-950 border border-amber-400 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <Warehouse className="w-4 h-4 shrink-0" />
            <span>Склад</span>
            <span className="text-[10px] bg-neutral-950 px-1.5 py-0.5 rounded-md font-mono text-neutral-300">
              {gameState.inventory.length}
            </span>
          </button>

          <button
            id="tab-my-listings"
            onClick={() => {
              sounds.playTap();
              setActiveTab('my_listings');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-bold text-xs sm:text-sm transition cursor-pointer ${
              activeTab === 'my_listings'
                ? 'bg-amber-500 text-neutral-950 border border-amber-400 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span>Продажи</span>
            {gameState.incomingOffers.length > 0 && (
              <span className="text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                {gameState.incomingOffers.length}
              </span>
            )}
          </button>
        </nav>

        {/* View Switcher */}
        {activeTab === 'avito' && (
          <AvitoMarket
            items={gameState.marketFeed}
            playerMoney={gameState.money}
            playerEnergy={gameState.energy}
            skills={gameState.skills}
            warehouse={effectiveWarehouse}
            currentWarehouseWeight={totalInventoryWeight}
            currentWarehouseSlots={gameState.inventory.length}
            specialization={gameState.specialization || 'all'}
            trends={gameState.trends}
            onSelectSpecialization={handleSelectSpecialization}
            onBuyInstant={handleBuyInstant}
            onStartNegotiation={handleStartBuyNegotiation}
            onInspectItem={handleInspectItem}
            onRefreshFeed={handleRefreshFeed}
          />
        )}

        {activeTab === 'auctions' && (
          <AuctionHouse
            lots={gameState.auctionLots}
            playerMoney={gameState.money}
            playerEnergy={gameState.energy}
            skills={gameState.skills}
            warehouse={effectiveWarehouse}
            currentWarehouseWeight={totalInventoryWeight}
            currentWarehouseSlots={gameState.inventory.length}
            onPlaceBid={handlePlaceBid}
            onClaimLot={handleClaimAuctionLot}
            onGenerateNewLots={handleGenerateNewAuctionLots}
            onInspectLot={handleInspectLot}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            inventory={gameState.inventory}
            warehouse={effectiveWarehouse}
            totalWeight={totalInventoryWeight}
            playerMoney={gameState.money}
            onUpgradeWarehouse={handleUpgradeWarehouse}
            onListItemForSale={handleListItemForSale}
            onUnlistItem={handleUnlistItem}
            onOpenRestoration={(item) => setRestoringItem(item)}
            onQuickScrapSell={handleQuickScrapSell}
          />
        )}

        {activeTab === 'my_listings' && (
          <MyListingsView
            listedItems={listedItems}
            incomingOffers={gameState.incomingOffers}
            onAcceptOffer={handleAcceptOffer}
            onRejectOffer={handleRejectOffer}
            onStartSellNegotiation={handleStartSellNegotiation}
            onUnlist={handleUnlistItem}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 bg-neutral-900/50 py-4 mt-8 text-neutral-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Симулятор Темщика © 2026 • Авито, Банковские торги, Спекуляции и Прокачка переговоров.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={handleResetGame}
              className="text-neutral-500 hover:text-rose-400 transition cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Начать заново</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {activeNegotiation && (
        <NegotiationModal
          session={activeNegotiation}
          playerSkills={gameState.skills}
          playerMoney={gameState.money}
          playerSpecialization={gameState.specialization || 'all'}
          onClose={() => setActiveNegotiation(null)}
          onFinishNegotiation={handleFinishNegotiation}
        />
      )}

      {restoringItem && (
        <RestorationModal
          item={restoringItem}
          playerMoney={gameState.money}
          playerEnergy={gameState.energy}
          skills={gameState.skills}
          onClose={() => setRestoringItem(null)}
          onRestoreSuccess={handleRestoreSuccess}
        />
      )}

      {isSkillsOpen && (
        <SkillsView
          skills={gameState.skills}
          playerMoney={gameState.money}
          onUpgradeSkill={handleUpgradeSkill}
          onClose={() => setIsSkillsOpen(false)}
        />
      )}

      {isTrendsOpen && (
        <MarketTrendsModal
          trends={gameState.trends}
          onClose={() => setIsTrendsOpen(false)}
        />
      )}

      {isReviewsOpen && (
        <ReviewsModal
          reputation={gameState.reputation}
          reviews={gameState.reviews}
          totalDeals={gameState.dealsCount}
          onClose={() => setIsReviewsOpen(false)}
        />
      )}

      {isDailySummaryOpen && (
        <DailySummaryModal
          day={gameState.day}
          rentPaid={lastRentPaid}
          passiveEarned={lastPassiveEarned}
          warehouse={effectiveWarehouse}
          trends={gameState.trends}
          onStartNextDay={handleStartNextDay}
        />
      )}

      {isPassiveIncomeOpen && (
        <PassiveIncomeModal
          playerMoney={gameState.money}
          playerEnergy={gameState.energy}
          businesses={gameState.passiveBusinesses || []}
          onBuyBusiness={handleBuyBusiness}
          onDoSideGig={handleDoSideGig}
          onClose={() => setIsPassiveIncomeOpen(false)}
        />
      )}

      {isLifestyleOpen && (
        <LifestyleModal
          playerMoney={gameState.money}
          playerEnergy={gameState.energy}
          character={gameState.character || INITIAL_STATE.character!}
          onClose={() => setIsLifestyleOpen(false)}
          onBuyFlex={handleBuyFlex}
        />
      )}

      {celebratingGoal && (
        <GoalCompletedModal
          goal={celebratingGoal}
          nextGoal={GOALS[gameState.currentGoalIndex]}
          onClose={() => setCelebratingGoal(null)}
        />
      )}
    </div>
  );
}
