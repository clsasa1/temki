export type ItemCategory = 
  | 'gpus' 
  | 'computers' 
  | 'smartphones' 
  | 'auto_parts' 
  | 'clothes_fashion' 
  | 'appliances' 
  | 'audio_retro' 
  | 'tools_equipment' 
  | 'wholesale_junk'
  | 'cars_flipping'
  | 'real_estate';

export type ItemCondition = 'trash' | 'worn' | 'good' | 'mint';

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  condition: ItemCondition;
  baseValue: number;
  currentMarketValue: number;
  boughtPrice?: number;
  listedPrice?: number;
  isListed?: boolean;
  weightKg: number;
  description: string;
  sellerNotes?: string;
  hiddenDefect?: string | null;
  isDefectDiscovered?: boolean;
  isRestored?: boolean;
  iconName: string;
  isScam?: boolean;
  scamReason?: string;
  scamRealValue?: number;
  isStrictNoBargain?: boolean;
  sellerPersonality?: 'stubborn' | 'urgent' | 'normal' | 'strict_no_bargain';
}

export interface MarketTrend {
  category: ItemCategory;
  categoryName: string;
  multiplier: number; // e.g. 1.25 = +25%
  trendDirection: 'up' | 'down' | 'stable';
  newsHeadline: string;
  isDailyHit?: boolean;
}

export interface Review {
  id: string;
  author: string;
  stars: number;
  text: string;
  day: number;
}

export interface Skills {
  negotiation: number; // 1 to 10: "Язык без костей"
  assessment: number;  // 1 to 10: "Глаз-алмаз"
  restoration: number; // 1 to 10: "Мастер на все руки"
  storage: number;     // 1 to 10: "Тетрис-мастер"
  auctionSmarts: number; // 1 to 10: "Спец по торгам"
}

export interface WarehouseLevel {
  level: number;
  name: string;
  maxWeightKg: number;
  maxSlots: number;
  upgradeCost: number;
  rentPerDay: number;
  description: string;
}

export type AuctionTier = 'small' | 'vehicles' | 'real_estate';

export interface AuctionLot {
  id: string;
  title: string;
  source: string;
  tier?: AuctionTier;
  description: string;
  items: Item[];
  startingBid: number;
  currentBid: number;
  currentLeader: string;
  playerBid: number;
  secondsLeft: number;
  estimatedValue: number;
  actualMarketValue?: number;
  isAppraisalVerified?: boolean;
  bidders: Array<{ name: string; aggression: number; maxBid: number }>;
  isCompleted: boolean;
  wonByPlayer: boolean;
}

export interface IncomingBuyerOffer {
  id: string;
  itemId: string;
  buyerName: string;
  buyerAvatar: string;
  buyerType: 'lowballer' | 'normal' | 'impatient' | 'scammer';
  offeredPrice: number;
  message: string;
  patience: number;
}

export interface ChatMessage {
  id: string;
  from: 'player' | 'npc';
  text: string;
  priceTag?: number;
  moodChange?: number;
}

export interface ActiveNegotiation {
  id: string;
  item: Item;
  mode: 'buy' | 'sell';
  npcName: string;
  npcAvatar: string;
  npcRole: string;
  initialPrice: number;
  currentOffer: number;
  minAcceptablePrice: number; // for seller
  maxAcceptablePrice: number; // for buyer
  npcPatience: number; // 0 - 100
  chatHistory: ChatMessage[];
  dealClosed: boolean;
  dealSuccess?: boolean;
  isStrictNoBargain?: boolean;
  sellerPersonality?: 'stubborn' | 'urgent' | 'normal' | 'strict_no_bargain';
}

export interface Loan {
  id: string;
  amount: number;
  dailyInterest: number;
  daysRemaining: number;
  totalDebt: number;
}

export interface PassiveBusiness {
  id: string;
  name: string;
  category: string;
  dailyIncome: number;
  cost: number;
  icon: string;
  description: string;
  isUnlocked: boolean;
}

export interface SideGig {
  id: string;
  title: string;
  reward: number;
  energyCost: number;
  description: string;
  icon: string;
}

export interface GameGoal {
  id: number;
  title: string;
  description: string;
  targetMoney: number;
  reward: string;
  actionTitle: string;
  repayAmount: number;
  completionMessage: string;
}

export interface CharacterStats {
  aura: number; // 0 to 1000+
  title: string;
  maxEnergy: number; // default 100
  totalSpentOnFlex: number;
  ownedCars: string[]; // IDs
  ownedProperties: string[]; // IDs
  purchasedItems: string[]; // IDs
}

export interface FlexItem {
  id: string;
  title: string;
  category: 'fun' | 'gear' | 'cars' | 'real_estate';
  cost: number;
  auraBonus: number;
  energyBonus?: number;
  maxEnergyBonus?: number;
  description: string;
  flavor: string;
  icon: string;
  isRepeatable?: boolean;
}

export interface GameState {
  money: number;
  day: number;
  energy: number; // 0 to maxEnergy
  reputation: number; // 1.0 to 5.0
  reputationPoints: number;
  reviews: Review[];
  skills: Skills;
  warehouseLevel: number;
  inventory: Item[];
  marketFeed: Item[]; // Available items on Avito
  incomingOffers: IncomingBuyerOffer[];
  auctionLots: AuctionLot[];
  trends: MarketTrend[];
  totalProfit: number;
  dealsCount: number;
  loans: Loan[];
  currentGoalIndex: number;
  specialization?: ItemCategory | 'all';
  passiveBusinesses?: PassiveBusiness[];
  character?: CharacterStats;
  auditRisk?: number; // 0 to 100%
  legalStatus?: {
    isRegisteredSelfEmployed: boolean;
    isRegisteredCompany: boolean;
    hasTaxLawyer: boolean;
  };
  funUsesToday?: number;
  isBusinessTycoonCelebrated?: boolean;
}
