import { 
  Item, 
  ItemCategory, 
  WarehouseLevel, 
  MarketTrend, 
  AuctionLot, 
  GameState,
  PassiveBusiness,
  SideGig,
  IncomingBuyerOffer,
  GameGoal,
  AuctionTier
} from '../types/game';

export const WAREHOUSE_LEVELS: WarehouseLevel[] = [
  {
    level: 1,
    name: 'Багажник ВАЗ-2109',
    maxWeightKg: 30,
    maxSlots: 5,
    upgradeCost: 0,
    rentPerDay: 0,
    description: 'Пахнет бензином и старой запаской. Но пара ноутов и видеокарт помещаются.',
  },
  {
    level: 2,
    name: 'Мамин балкон',
    maxWeightKg: 80,
    maxSlots: 10,
    upgradeCost: 18000,
    rentPerDay: 0,
    description: 'Рядом с банками с соленьями. Мама иногда грозится выбросить всё на помойку.',
  },
  {
    level: 3,
    name: 'Гараж в ГСК «Рассвет»',
    maxWeightKg: 300,
    maxSlots: 20,
    upgradeCost: 55000,
    rentPerDay: 250,
    description: 'Есть свет, верстак для пайки и буржуйка. Можно хранить мелкий опт.',
  },
  {
    level: 4,
    name: 'Подвал у метро',
    maxWeightKg: 800,
    maxSlots: 35,
    upgradeCost: 150000,
    rentPerDay: 800,
    description: 'Стеллажи, сигнализация и вывеска «Скупка / Экспресс-Ремонт». Поток клиентов выше.',
  },
  {
    level: 5,
    name: 'Оптовый склад на промзоне',
    maxWeightKg: 2500,
    maxSlots: 65,
    upgradeCost: 450000,
    rentPerDay: 2200,
    description: 'Помещаются поддоны с конфискатом, серверные стойки и ящики мониторов.',
  },
  {
    level: 6,
    name: 'Шоурум на Савеловском',
    maxWeightKg: 6000,
    maxSlots: 120,
    upgradeCost: 1200000,
    rentPerDay: 5000,
    description: 'Легендарное место! Очереди за предзаказами, выкуп на месте, статус босса Горбушки.',
  },
];

export const CATEGORY_NAMES: Record<ItemCategory, { label: string; icon: string }> = {
  gpus: { label: 'Видеокарты и майнинг', icon: 'Cpu' },
  computers: { label: 'Компьютеры и ноуты', icon: 'Laptop' },
  smartphones: { label: 'Смартфоны и гаджеты', icon: 'Smartphone' },
  auto_parts: { label: 'Шины, диски и авто', icon: 'Car' },
  clothes_fashion: { label: 'Одежда, обувь и ресейл', icon: 'Shirt' },
  appliances: { label: 'Бытовая техника', icon: 'Tv' },
  audio_retro: { label: 'Аудио и ретро-гейминг', icon: 'Radio' },
  tools_equipment: { label: 'Инструмент и приборы', icon: 'Wrench' },
  wholesale_junk: { label: 'Конфискат и опт', icon: 'Package' },
  cars_flipping: { label: 'Авто под перекуп', icon: 'Car' },
  real_estate: { label: 'Залоговая недвижимость', icon: 'Building' },
};

export function generateDailyTrends(day: number, previousHitCategory?: ItemCategory): MarketTrend[] {
  const allCategories: ItemCategory[] = [
    'gpus',
    'computers',
    'smartphones',
    'auto_parts',
    'clothes_fashion',
    'appliances',
    'audio_retro',
    'tools_equipment',
    'wholesale_junk',
    'cars_flipping',
    'real_estate',
  ];

  // Pick a random category that was NOT yesterday's hit
  const candidateHits = allCategories.filter((cat) => cat !== previousHitCategory);
  const hitCategory = candidateHits[Math.floor(Math.random() * candidateHits.length)] || allCategories[0];

  return allCategories.map((cat) => {
    const isHit = cat === hitCategory;
    const catName = CATEGORY_NAMES[cat]?.label || cat;

    if (isHit) {
      const hitMultiplier = Number((1.45 + Math.random() * 0.35).toFixed(2)); // +45% to +80%
      const hitHeadlines = [
        `🔥 ХИТ ДНЯ: Взрывной ажиотаж в категории «${catName}»! Спрос бьет рекорды, товары скупают с наценкой +${Math.round((hitMultiplier - 1) * 100)}%!`,
        `🔥 ХИТ ДНЯ: Острый дефицит по городу в категории «${catName}»! Перекупщики поднимают цены, покупатели сметают всё подряд!`,
        `🔥 ХИТ ДНЯ: Вирусный тренд в соцсетях сделал «${catName}» самым желанным товаром дня! Прибыль зашкаливает!`,
      ];
      return {
        category: cat,
        categoryName: catName,
        multiplier: hitMultiplier,
        trendDirection: 'up',
        newsHeadline: hitHeadlines[Math.floor(Math.random() * hitHeadlines.length)],
        isDailyHit: true,
      };
    }

    // Normal dynamic market swing (0.80 - 1.20)
    const baseMult = Number((0.85 + Math.random() * 0.30).toFixed(2));
    const direction: 'up' | 'down' | 'stable' = baseMult > 1.05 ? 'up' : baseMult < 0.95 ? 'down' : 'stable';
    const normalHeadlines = {
      up: [
        `Повышенный интерес покупателей к категории «${catName}». Цены стабильно растут.`,
        `Рынок оживился: в категории «${catName}» заметен устойчивый приток заказов.`,
      ],
      down: [
        `Временное затишье в категории «${catName}»: покупатели выжидают скидок.`,
        `Избыток предложений сбил средний чек в категории «${catName}».`,
      ],
      stable: [
        `Стабильный умеренный спрос на «${catName}». Без резких скачков.`,
      ],
    };

    const hlList = normalHeadlines[direction];
    return {
      category: cat,
      categoryName: catName,
      multiplier: baseMult,
      trendDirection: direction,
      newsHeadline: hlList[Math.floor(Math.random() * hlList.length)],
      isDailyHit: false,
    };
  });
}

export const INITIAL_TRENDS: MarketTrend[] = generateDailyTrends(1);

export const INITIAL_PASSIVE_BUSINESSES: PassiveBusiness[] = [
  {
    id: 'garage_corner',
    name: 'Субаренда угла в гараже',
    category: 'Недвижимость',
    dailyIncome: 450,
    cost: 2500,
    icon: 'Warehouse',
    description: 'Знакомый мастер чинит там стартеры и генераторы, отдавая процент за место.',
    isUnlocked: false,
  },
  {
    id: 'crypto_balcony',
    name: 'Балконная ферма из отбраковки',
    category: 'Крипта',
    dailyIncome: 950,
    cost: 6500,
    icon: 'Cpu',
    description: 'Две восстановленные видеокарты тихо копают альткоины на бесплатной розетке.',
    isUnlocked: false,
  },
  {
    id: 'salvage_lead',
    name: 'Партнёрка со скупкой на Савёле',
    category: 'Скупка',
    dailyIncome: 1800,
    cost: 16000,
    icon: 'Store',
    description: 'Скидываешь им контакты продавцов неликвида и получаешь процент с каждой сделки.',
    isUnlocked: false,
  },
  {
    id: 'parcel_box',
    name: 'Автоматический бокс Авито-доставки',
    category: 'Логистика',
    dailyIncome: 3500,
    cost: 38000,
    icon: 'Package',
    description: 'Покупатели сами забирают посылки из ячейки по коду, без твоего личного присутствия.',
    isUnlocked: false,
  },
  {
    id: 'telegram_signals',
    name: 'Канал «Сигналы Темщика / Скупка»',
    category: 'Инфобиз',
    dailyIncome: 7500,
    cost: 85000,
    icon: 'TrendingUp',
    description: 'Платная подписка на бота, мониторящего свежие лоты конфиската и банкротств.',
    isUnlocked: false,
  },
  {
    id: 'vending_fleet',
    name: 'Сетка вендинговых аппаратов в ГСК',
    category: 'Автоматы',
    dailyIncome: 16000,
    cost: 190000,
    icon: 'Zap',
    description: 'Кофе и энергетики в пяти крупных гаражных кооперативах и автосервисах района.',
    isUnlocked: false,
  },
];

export const SIDE_GIGS: SideGig[] = [
  {
    id: 'kettle_repair',
    title: 'Починить чайник / утюг соседке',
    reward: 550,
    energyCost: 15,
    description: 'Зачистить контакты термореле, получить 550 рублей и банку домашних огурцов.',
    icon: 'Wrench',
  },
  {
    id: 'windows_install',
    title: 'Накатить Windows и драйверы с флешки',
    reward: 1200,
    energyCost: 20,
    description: 'Выезд к школьнику: чистая сборка Win 11, активация и оптимизация автозагрузки.',
    icon: 'Laptop',
  },
  {
    id: 'gazelle_unload',
    title: 'Помочь разгрузить «Газель» с запчастями',
    reward: 1900,
    energyCost: 35,
    description: 'Тяжелая физическая работа на складе запчастей. Зато живой наличный кэш на руки!',
    icon: 'Car',
  },
  {
    id: 'scrap_copper',
    title: 'Сдать медь и цветмет на металлоприёмку',
    reward: 2600,
    energyCost: 30,
    description: 'Обрезки кабелей, сгоревшие трансформаторы и латунные краны превращаются в рубли.',
    icon: 'DollarSign',
  },
];

export interface ItemTemplate {
  name: string;
  category: ItemCategory;
  baseValue: number;
  weightKg: number;
  possibleConditions: Array<Item['condition']>;
  possibleDefects: Array<string | null>;
  descriptions: string[];
  sellerNotes: string[];
  iconName: string;
}

export const ITEM_TEMPLATES: ItemTemplate[] = [
  // --- SUPER BUDGET & PENNY DEALS (Anti-softlock & cheap flips) ---
  {
    name: 'Коробка старых зарядок и кабелей (2.5 кг)',
    category: 'wholesale_junk',
    baseValue: 1200,
    weightKg: 2.5,
    possibleConditions: ['worn', 'trash'],
    possibleDefects: ['Половина проводов перебита у основания'],
    descriptions: [
      'Очищали кладовку на складе. Куча блоков питания, micro-USB, Type-C и переходников.',
      'Отдам за символические 200-300 рублей, лишь бы место в коридоре не занимали.',
    ],
    sellerNotes: ['Кладовщик', 'Соседка по подъезду'],
    iconName: 'Package',
  },
  {
    name: 'Винтажная олимпийка 90-х Adidas (оторван бегунок)',
    category: 'clothes_fashion',
    baseValue: 2200,
    weightKg: 0.5,
    possibleConditions: ['worn', 'trash'],
    possibleDefects: ['Заедает молния, оторван бегунок'],
    descriptions: [
      'Аутентичный винтаж времен перестройки. Молния расходится, нужно вставить собачку.',
      'На рейвы и фотосессии с руками оторвут. Продаю за бесценок.',
    ],
    sellerNotes: ['Молодой парень', 'Блошиный рынок'],
    iconName: 'Shirt',
  },
  {
    name: 'Старая кнопочная Nokia 3310 (без зарядки)',
    category: 'smartphones',
    baseValue: 1600,
    weightKg: 0.3,
    possibleConditions: ['worn', 'trash'],
    possibleDefects: ['Вздутый аккумулятор, не включается'],
    descriptions: [
      'Оригинал из Финляндии! Корпус легендарный. Батарейку новую поставить — и еще 50 лет проживет.',
      'Найдена в ящике письменного стола. Отдам за шоколадку или 250 рублей.',
    ],
    sellerNotes: ['Дедушка-пенсионер', 'Школьник'],
    iconName: 'Smartphone',
  },
  {
    name: 'Шина б/у R14 Cordiant на запаску/клумбу',
    category: 'auto_parts',
    baseValue: 1400,
    weightKg: 7.0,
    possibleConditions: ['worn', 'trash'],
    possibleDefects: ['Вылетели все шипы, стерт протектор'],
    descriptions: [
      'Осталась одна штука от Жигулей. На докатку или в деревню на прицеп сойдет.',
      'Заберите из гаража за 300 рублей самовывозом.',
    ],
    sellerNotes: ['Гаражный мужик', 'Дед'],
    iconName: 'Car',
  },
  {
    name: 'Студийные наушники Sennheiser (порван провод)',
    category: 'audio_retro',
    baseValue: 2800,
    weightKg: 0.4,
    possibleConditions: ['worn', 'trash'],
    possibleDefects: ['Оторван джек 3.5мм, играет одно ухо'],
    descriptions: [
      'Динамики оригинальные целые, звук шикарный. Кот перегрыз провод возле штекера.',
      'Кто умеет держать паяльник — сделает за 5 минут.',
    ],
    sellerNotes: ['Звукорежиссер', 'Меломан'],
    iconName: 'Radio',
  },
  {
    name: 'Пылесос Samsung с забитым циклоном (гудит)',
    category: 'appliances',
    baseValue: 2600,
    weightKg: 4.5,
    possibleConditions: ['worn', 'trash'],
    possibleDefects: ['Забит фильтр и шланг строительной пылью'],
    descriptions: [
      'После ремонта квартиры перестал всасывать и начал греться. Купили новый робот.',
      'Отдам за 400 рублей тому, кто почистит или на запчасти.',
    ],
    sellerNotes: ['Семейная пара', 'Студенты'],
    iconName: 'Tv',
  },
  {
    name: 'Советский мультиметр стрелочный Ц4353',
    category: 'tools_equipment',
    baseValue: 2200,
    weightKg: 1.5,
    possibleConditions: ['worn', 'trash'],
    possibleDefects: ['Сели батарейки, нет одного щупа'],
    descriptions: [
      'В карболитовом корпусе со знаком качества СССР. Стрелка ходит плавно.',
      'Отдам за копейки любителям советской классики.',
    ],
    sellerNotes: ['Радиолюбитель', 'Внук'],
    iconName: 'Wrench',
  },
  {
    name: 'Материнская плата 775 сокет + кулер (не стартует)',
    category: 'computers',
    baseValue: 1500,
    weightKg: 1.0,
    possibleConditions: ['worn', 'trash'],
    possibleDefects: ['Вздулись 2 конденсатора возле процессора'],
    descriptions: [
      'Снята со старого офисного компа. Кулер крутится, картинки нет. Под перепайку конденсаторов.',
      'Самовывоз за 250 рублей.',
    ],
    sellerNotes: ['Сисадмин', 'Офис-менеджер'],
    iconName: 'Laptop',
  },
  {
    name: 'Nvidia GeForce RTX 3060 12GB',
    category: 'gpus',
    baseValue: 24000,
    weightKg: 1.2,
    possibleConditions: ['mint', 'good', 'worn', 'trash'],
    possibleDefects: [null, 'Вентилятор шумит при нагрузке', 'Память прогрета феном', null],
    descriptions: [
      'Стояла в домашнем ПК, играл только в Симс. Пломба на месте (ну почти).',
      'Не майнила, мамой клянусь. В FurMark греется всего до 87 градусов.',
      'После апгрейда на 4070. Коробка утеряна при переезде.',
    ],
    sellerNotes: ['Продавец торопится на поезд', 'Школьник продает тайно от отца', 'Опытный майнер'],
    iconName: 'Cpu',
  },
  {
    name: 'Nvidia GeForce GTX 1060 6GB',
    category: 'gpus',
    baseValue: 7500,
    weightKg: 0.9,
    possibleConditions: ['worn', 'good', 'trash'],
    possibleDefects: [null, 'Высохла термопаста (нужно ТО)', 'Дроссели свистят'],
    descriptions: [
      'Легенда жива! Танки на ультрах 60 фпс. Продаю в связи с покупкой плейстейшн.',
      'Рабочая карточка, почищена от пыли кисточкой.',
    ],
    sellerNotes: ['Студент', 'Геймер-весельчак'],
    iconName: 'Cpu',
  },
  {
    name: 'AMD Radeon RX 580 8GB',
    category: 'gpus',
    baseValue: 6000,
    weightKg: 1.0,
    possibleConditions: ['worn', 'trash', 'good'],
    possibleDefects: ['Прошитый майнинг-биос (не видит стандартный драйвер)', 'Отвал видеопамяти под нагрузкой', null],
    descriptions: [
      'Оригинальная Sapphire Nitro+. Была в надежных руках.',
      'Лежала на полке 2 года. Работоспособность неизвестна, проверить не на чем.',
    ],
    sellerNotes: ['Бывший фермер', 'Парень из гаража'],
    iconName: 'Cpu',
  },
  {
    name: 'Ноутбук Lenovo ThinkPad T480',
    category: 'computers',
    baseValue: 22000,
    weightKg: 1.8,
    possibleConditions: ['good', 'worn', 'mint'],
    possibleDefects: [null, 'Батарея держит 15 минут', 'Не работает пара клавиш клавиатуры'],
    descriptions: [
      'Корпоративный списанный ноут. Core i5, 16GB RAM, неубиваемый корпус.',
      'Настоящая японская классика для программиста. Работает как часы.',
    ],
    sellerNotes: ['Бывший сисадмин', 'Офисный работник'],
    iconName: 'Laptop',
  },
  {
    name: 'Системный блок «Бухгалтерский зверь» Core i3',
    category: 'computers',
    baseValue: 9000,
    weightKg: 6.5,
    possibleConditions: ['worn', 'good'],
    possibleDefects: [null, 'Винчестер трещит (бэды)', 'Кулер на процессоре болтается на стяжках'],
    descriptions: [
      'Списан с банка. Стоит 1С:Предприятие 7.7 и пасьянс «Косынка». Корпус белый пожелтевший.',
      'Отличный комп для гаража или дачи. Включается с отвертки.',
    ],
    sellerNotes: ['Завхоз предприятия', 'Перекуп новичок'],
    iconName: 'Laptop',
  },
  {
    name: 'Apple MacBook Air M1 (2020)',
    category: 'computers',
    baseValue: 52000,
    weightKg: 1.3,
    possibleConditions: ['good', 'mint', 'worn'],
    possibleDefects: [null, 'Небольшая вмятина на углу крышки', 'АКБ 81%'],
    descriptions: [
      'Ростест, серый космос. Использовался для зума и инстаграма.',
      'Полный комплект, чек из М.Видео. Продаю из-за перехода на Pro.',
    ],
    sellerNotes: ['Девушка-дизайнер', 'Студентка ВШЭ'],
    iconName: 'Laptop',
  },
  {
    name: 'Apple iPhone 12 128GB',
    category: 'smartphones',
    baseValue: 27000,
    weightKg: 0.3,
    possibleConditions: ['good', 'worn', 'trash'],
    possibleDefects: ['Экран китайская копия OLED', 'TrueTone и Face ID не работают', null],
    descriptions: [
      'В чехле и с защитным стеклом со дня покупки! Без сколов.',
      'Телефон брата. Забыли пароль от айклауда, но можно звонить (шутка, отвязан).',
    ],
    sellerNotes: ['Парень на Приоре', 'Спекулянт'],
    iconName: 'Smartphone',
  },
  {
    name: 'Apple iPhone 13 Pro 256GB',
    category: 'smartphones',
    baseValue: 54000,
    weightKg: 0.3,
    possibleConditions: ['mint', 'good'],
    possibleDefects: [null, 'Микроцарапина у разъема зарядки'],
    descriptions: [
      'Цвет Небесно-голубой. Батарея 86%. Ростест, покупался новым.',
      'Состояние идеальное. В подарок 5 чехлов и провод.',
    ],
    sellerNotes: ['Серьезный мужчина в костюме', 'Молодая мама'],
    iconName: 'Smartphone',
  },
  {
    name: 'Коробка битых Xiaomi и Redmi (7 штук)',
    category: 'smartphones',
    baseValue: 8000,
    weightKg: 1.5,
    possibleConditions: ['trash'],
    possibleDefects: ['Все с битыми экранами, 3 штуки включаются'],
    descriptions: [
      'Остатки сервисного центра. Платы целые, аккумуляторы на месте. Под восстановление.',
      'Скупка с ломбарда одной кучей. Без претензий и возвратов.',
    ],
    sellerNotes: ['Мастер по ремонту', 'Скупщик радиорынка'],
    iconName: 'Smartphone',
  },
  {
    name: 'Осциллограф универсальный С1-65А (СССР)',
    category: 'tools_equipment',
    baseValue: 14000,
    weightKg: 16.0,
    possibleConditions: ['good', 'worn'],
    possibleDefects: [null, 'Нужна калибровка луча', 'Нет сетевого шнура'],
    descriptions: [
      'С консервации из НИИ. Внутри драгметаллы (палладий/золото не выпаивали, пломбы завода!).',
      'Полностью рабочий советский прибор. Вес 16 кг чистой мощи.',
    ],
    sellerNotes: ['Пожилой инженер', 'Внук профессора'],
    iconName: 'Wrench',
  },
  {
    name: 'Паяльная станция термовоздушная Lukey 852D+',
    category: 'tools_equipment',
    baseValue: 5500,
    weightKg: 3.5,
    possibleConditions: ['good', 'worn'],
    possibleDefects: [null, 'Нагреватель фена слегка гремит', null],
    descriptions: [
      'Верный друг любого темщика и ремонтника. Фен + паяльник с регулировкой.',
      'Использовалась редко в домашних условиях. Насадки в комплекте.',
    ],
    sellerNotes: ['Электронщик-самоучка', 'Радиолюбитель'],
    iconName: 'Wrench',
  },
  {
    name: 'Шуруповерт с двумя АКБ и чемоданом',
    category: 'tools_equipment',
    baseValue: 4200,
    weightKg: 2.8,
    possibleConditions: ['good', 'worn'],
    possibleDefects: ['Один аккумулятор быстро садится', null],
    descriptions: [
      'Мощный, крутит саморезы со свистом. Покупался для одного ремонта квартиры.',
    ],
    sellerNotes: ['Дачник', 'Бригадир'],
    iconName: 'Wrench',
  },
  {
    name: 'Игровая приставка Sony PlayStation 4 Pro 1TB',
    category: 'audio_retro',
    baseValue: 21000,
    weightKg: 3.8,
    possibleConditions: ['good', 'worn', 'trash'],
    possibleDefects: ['Шумит как реактивный истребитель (высохла паста)', 'Дисковод заедает при отдаче', null],
    descriptions: [
      'Версия ревизии 7208B (самая тихая). В комплекте 2 джойстика и GTA V.',
      'Играл ребенок по выходным. Не забанена в PSN.',
    ],
    sellerNotes: ['Отец семейства', 'Студент'],
    iconName: 'Radio',
  },
  {
    name: 'Советский виниловый проигрыватель Вега-109 Стерео',
    category: 'audio_retro',
    baseValue: 11000,
    weightKg: 14.0,
    possibleConditions: ['worn', 'good'],
    possibleDefects: ['Пассик растянут, скорость плавает', null],
    descriptions: [
      'Польская вертушка Unitra G-602, головка MF-100 в идеале. Теплый ламповый звук.',
      'Найдена на даче в сухом чулане. Деревянный шпон отреставрирован.',
    ],
    sellerNotes: ['Меломан старой школы', 'Хипстер с барахолки'],
    iconName: 'Radio',
  },
  {
    name: 'Партия мониторов 24" Dell & HP (10 штук)',
    category: 'wholesale_junk',
    baseValue: 45000,
    weightKg: 42.0,
    possibleConditions: ['good', 'worn'],
    possibleDefects: ['На двух мониторах царапины на матрице', null],
    descriptions: [
      'Оптовая партия со списания колл-центра. IPS матрицы, DisplayPort, VGA. Все проверены на включение.',
      'Только самовывоз все разом! Идеально для перепродажи в розницу по 6-7к.',
    ],
    sellerNotes: ['Ликвидатор юрлица', 'Оптовый перекупщик'],
    iconName: 'Package',
  },
  {
    name: 'Серверная стойка 2U с 4 серверами Xeon',
    category: 'wholesale_junk',
    baseValue: 65000,
    weightKg: 55.0,
    possibleConditions: ['worn', 'good'],
    possibleDefects: ['В одном сервере нет плашек памяти', 'Очень тяжелый, нужен грузовик'],
    descriptions: [
      'Залог разорившегося хостинг-провайдера. Внутри 128GB DDR4 ECC, салазки и корзины.',
      'Срочно освобождают серверную. По частям на Авито уйдет в два раза дороже.',
    ],
    sellerNotes: ['Конкурсный управляющий', 'ИТ-директор в отставке'],
    iconName: 'Package',
  },
  // --- АВТОТОВАРЫ, ШИНЫ И ДИСКИ ---
  {
    name: 'Комплект зимней резины Nokian Hakkapeliitta 9 205/55 R16 (4 шт.)',
    category: 'auto_parts',
    baseValue: 26000,
    weightKg: 36.0,
    possibleConditions: ['good', 'worn', 'mint'],
    possibleDefects: ['Вылетела треть шипов на передней паре', 'На одном колесе жгут от самореза', null],
    descriptions: [
      'Отходили один сезон на Солярисе. Протектор жирный, шипы на месте. Продаю в связи со сменой машины.',
      'Финское качество. Гребет по снегу и каше как трактор. Хранились в теплом гараже.',
      'Комплект 4 штуки без грыж и порезов. Балансируются в ноль.',
    ],
    sellerNotes: ['Таксист на отдыхе', 'Спокойный пенсионер', 'Парень с гаражей'],
    iconName: 'Car',
  },
  {
    name: 'Легендарные кованые диски ВСМПО «Пантера» R15 4x98',
    category: 'auto_parts',
    baseValue: 34000,
    weightKg: 24.0,
    possibleConditions: ['good', 'worn', 'mint'],
    possibleDefects: ['Бордюрка на ободе одного диска', 'Покрашены из баллончика без грунта', null],
    descriptions: [
      'Авиационная ковка из Верхней Салды! Не гнутся, весят пушинку (5.8 кг диск). На любой ТАЗ или Фиат.',
      'Раритет в редком белом цвете. Геометрия ровная, проверяли на станке. Знающие люди поймут ценность.',
    ],
    sellerNotes: ['Тазовод-энтузиаст', 'Стритрейсер', 'Мастер шиномонтажа'],
    iconName: 'Car',
  },
  {
    name: 'Турбина Garrett / IHI от Subaru Impreza WRX',
    category: 'auto_parts',
    baseValue: 22000,
    weightKg: 7.5,
    possibleConditions: ['good', 'worn', 'trash'],
    possibleDefects: ['Люфт крыльчатки (гонит масло)', 'Трещина в горячей части улитки', null],
    descriptions: [
      'Снята с распила из Японии. Давила 1.2 бара стабильно без помпажа.',
      'Оригинальная твинскролл улитка. Под свап или на замену уставшей.',
    ],
    sellerNotes: ['Субарист в масле', 'Разборщик «Япония-Авто»'],
    iconName: 'Car',
  },
  {
    name: 'Комплект летних шин Michelin Pilot Sport 4 R18 225/40',
    category: 'auto_parts',
    baseValue: 32000,
    weightKg: 38.0,
    possibleConditions: ['good', 'mint', 'worn'],
    possibleDefects: ['Неравномерный износ из-за кривого развала', null],
    descriptions: [
      'Держак на мокром асфальте космический. Остаток протектора 6.5 мм. Без ремонтов.',
      'Производство Испания. Стояли на Golf GTI, машина продана на зиме.',
    ],
    sellerNotes: ['Владелец хот-хэтча', 'Шиномонтажник'],
    iconName: 'Car',
  },
  {
    name: 'Оригинальный спортивный руль MOMO Prototipo (Италия)',
    category: 'auto_parts',
    baseValue: 16000,
    weightKg: 1.8,
    possibleConditions: ['mint', 'good', 'worn'],
    possibleDefects: ['Потертость натуральной кожи сверху', null],
    descriptions: [
      'Настоящая классика 350мм. Черная кожа, белая строчка, кнопка клаксона с логотипом.',
      'Привезен с аукциона Yahoo. Стоял в ретро-проекте BMW E30.',
    ],
    sellerNotes: ['Дрифтер', 'Реставратор авто'],
    iconName: 'Car',
  },
  {
    name: 'Автомобильный сабвуфер Alpine Type-R 12" + моноблок Pride',
    category: 'auto_parts',
    baseValue: 28000,
    weightKg: 21.0,
    possibleConditions: ['good', 'worn'],
    possibleDefects: ['Короб из фанеры помят на углу', 'Один терминал шатается', null],
    descriptions: [
      'Качает так, что лобовое стекло вибрирует и номер звенит. Номинал 1000 Ватт в щелевом коробе.',
      'В комплекте силовой кабель 4GA и выносной регулятор баса.',
    ],
    sellerNotes: ['Парень с сабом во дворе', 'Автозвукер'],
    iconName: 'Car',
  },
  {
    name: 'Комплект светодиодных Bi-LED фар Black Edition',
    category: 'auto_parts',
    baseValue: 12500,
    weightKg: 4.5,
    possibleConditions: ['good', 'mint'],
    possibleDefects: ['Сломано одно нижнее пластиковое крепление', null],
    descriptions: [
      'Четкая светотеневая граница, яркие ангельские глазки. Встают в штатные разъемы.',
    ],
    sellerNotes: ['Автоэлектрик', 'Тюнер'],
    iconName: 'Car',
  },

  // --- ОДЕЖДА, ОБУВЬ И РЕСЕЙЛ ---
  {
    name: 'Пуховик The North Face 1996 Retro Nuptse (700 набивка)',
    category: 'clothes_fashion',
    baseValue: 24000,
    weightKg: 1.1,
    possibleConditions: ['mint', 'good', 'worn'],
    possibleDefects: ['Микро-зацепка от сигареты на спине', 'Немного лезет пух по швам', null],
    descriptions: [
      'Черный культовый пухан Nuptse. Плотная набивка гусиным пухом 700 fill down, капюшон в воротнике.',
      'Покупался в концепт-сторе в Европе. Любые проверки на легит чек (YKK молнии, бирки, голограмма).',
    ],
    sellerNotes: ['Хайпбист с Патриков', 'Студент МГУ', 'Скейтбордист'],
    iconName: 'Shirt',
  },
  {
    name: 'Кроссовки Nike Air Jordan 1 Retro High OG «Chicago»',
    category: 'clothes_fashion',
    baseValue: 29000,
    weightKg: 1.4,
    possibleConditions: ['mint', 'good', 'worn'],
    possibleDefects: ['Заломы на носке (toe box creasing)', 'Пожелтевшая подошва', null],
    descriptions: [
      'Культовая красно-бело-черная расцветка Майкла Джордана. Родная коробка и доп. шнурки.',
      'Размер 43 (9.5 US). Выиграны в сникер-дропе в Sneakerhead. На улице были 3 раза.',
    ],
    sellerNotes: ['Сникерхед со стажем', 'Школьник ресейлер'],
    iconName: 'Shirt',
  },
  {
    name: 'Зип-худи Stone Island с патчем (Оригинал CLG)',
    category: 'clothes_fashion',
    baseValue: 21000,
    weightKg: 0.9,
    possibleConditions: ['good', 'mint', 'worn'],
    possibleDefects: ['Патч со следами стирки', 'Катышки на манжетах', null],
    descriptions: [
      'Плотный хлопок с начесом, цвет темно-синий. QR-код Certilogo пробивается как Authentic.',
      'Знаменитый компас на двух пуговицах на левом рукаве. Покупалось в Brandshop.',
    ],
    sellerNotes: ['Околофутбольщик', 'Модник'],
    iconName: 'Shirt',
  },
  {
    name: 'Винтажная косуха из тяжелой кожи буйвола (90-е)',
    category: 'clothes_fashion',
    baseValue: 17500,
    weightKg: 3.2,
    possibleConditions: ['good', 'worn'],
    possibleDefects: ['Подкладка кармана надорвана', 'Естественные благородные потертости кожи', null],
    descriptions: [
      'Настоящий винтаж из Германии. Металлические массивные молнии YKK, косой замок, вес 3+ кг брони.',
      'Такую сейчас ни в одном массмаркете не сошьют. Будет носиться еще 40 лет.',
    ],
    sellerNotes: ['Старый рокер', 'Коллекционер винтажа'],
    iconName: 'Shirt',
  },
  {
    name: 'Наручные часы Casio G-Shock GA-2100 «Casioak» All Black',
    category: 'clothes_fashion',
    baseValue: 9500,
    weightKg: 0.2,
    possibleConditions: ['mint', 'good'],
    possibleDefects: [null, 'Микроцарапина на минеральном стекле'],
    descriptions: [
      'Ультратонкий корпус Carbon Core Guard, матовый стелс-дизайн. Водонепроницаемость 200м.',
      'Полный комплект: шестигранная банка, инструкция, бирки.',
    ],
    sellerNotes: ['Офисный сотрудник', 'Спортсмен'],
    iconName: 'Shirt',
  },
  {
    name: 'Кроссовки New Balance 990v5 Made in USA (серые)',
    category: 'clothes_fashion',
    baseValue: 19000,
    weightKg: 1.3,
    possibleConditions: ['good', 'mint', 'worn'],
    possibleDefects: ['Замша требует чистки пенкой', null],
    descriptions: [
      'Американская сборка ручной работы. Премиальная серая замша, амортизация ENCAP.',
      'Самые удобные кроссовки в истории. Ходишь как по облаку целый день.',
    ],
    sellerNotes: ['Айтишник', 'Любитель комфорта'],
    iconName: 'Shirt',
  },

  // --- БЫТОВАЯ ТЕХНИКА И ДЕВАЙСЫ ---
  {
    name: 'Фен Dyson Supersonic HD08 (Фуксия, 5 насадок)',
    category: 'appliances',
    baseValue: 36000,
    weightKg: 1.9,
    possibleConditions: ['good', 'mint', 'worn'],
    possibleDefects: ['Фильтр забит пылью (греется и отключается)', 'Небольшие потертости на корпусе', null],
    descriptions: [
      'Оригинальный Дайсон! Быстро сушит волосы без экстремального перегрева. Магнитные насадки.',
      'Подарок от бывшего. Использовался бережно пару месяцев. Серийник бьется на оф. сайте.',
    ],
    sellerNotes: ['Бьюти-блогерша', 'Девушка после расставания', 'Парень с подарком'],
    iconName: 'Tv',
  },
  {
    name: 'Кофемашина DeLonghi Magnifica S (эспрессо/капучино)',
    category: 'appliances',
    baseValue: 25000,
    weightKg: 9.5,
    possibleConditions: ['good', 'worn', 'mint'],
    possibleDefects: ['Требуется декальцинация от накипи', 'Поддон для капель исцарапан чашками', null],
    descriptions: [
      'Итальянская автоматическая зерновая кофемашина. Варит густой насыщенный эспрессо с пенкой crema.',
      'Встроенная кофемолка со стальными жерновами. Полностью обслужена, смазан заварочный блок.',
    ],
    sellerNotes: ['Кофеман', 'Офис закрылся', 'Семья при переезде'],
    iconName: 'Tv',
  },
  {
    name: 'Робот-пылесос Roborock S7 с лидаром и влажной уборкой',
    category: 'appliances',
    baseValue: 27000,
    weightKg: 5.2,
    possibleConditions: ['good', 'worn'],
    possibleDefects: ['Лидар слегка тупит при ярком солнце', 'Тряпка изношена, нужна замена расходников', null],
    descriptions: [
      'Ультразвуковая вибрационная мойка полов VibraRise, строит точные 3D-карты комнат по лазеру.',
      'Управление со смартфона через Mi Home. Сам заезжает на ковры и поднимает швабру.',
    ],
    sellerNotes: ['Молодая семья', 'Владелец хаски'],
    iconName: 'Tv',
  },
  {
    name: 'Электрогриль Tefal OptiGrill XL с датчиком толщины стейка',
    category: 'appliances',
    baseValue: 14500,
    weightKg: 6.8,
    possibleConditions: ['good', 'worn', 'mint'],
    possibleDefects: ['Антипригарное покрытие панелей слегка потерто', null],
    descriptions: [
      'Умный гриль сам определяет степень прожарки мяса: Rare, Medium, Well-Done. Съемные панели.',
      'Стейки, бургеры и шаурма за 5 минут. Панели можно мыть в посудомойке.',
    ],
    sellerNotes: ['Любитель стейков', 'Спортсмен на сушке'],
    iconName: 'Tv',
  },
  {
    name: 'Беспроводной пылесос Dyson V11 Absolute Extra',
    category: 'appliances',
    baseValue: 38000,
    weightKg: 3.5,
    possibleConditions: ['good', 'worn'],
    possibleDefects: ['Аккумулятор держит 20 минут вместо 45', 'Контейнер для пыли имеет царапины', null],
    descriptions: [
      'ЖК-дисплей с отображением времени работы в реальном времени. Лазерная насадка подсвечивает микропыль.',
      'Космическая мощность всасывания 220 AW. Все насадки в комплекте на настенной док-станции.',
    ],
    sellerNotes: ['Хозяйка квартиры', 'Аллергик'],
    iconName: 'Tv',
  },

  // --- ДОПОЛНИТЕЛЬНЫЕ СМАРТФОНЫ И ГАДЖЕТЫ ---
  {
    name: 'Apple iPhone 15 Pro 128GB Black Titanium',
    category: 'smartphones',
    baseValue: 88000,
    weightKg: 0.35,
    possibleConditions: ['mint', 'good'],
    possibleDefects: [null, 'Микро-скол на титановой грани возле Type-C'],
    descriptions: [
      'Титановый матовый корпус, кнопка Action Button, процессор A17 Pro. АКБ 98%, 140 циклов.',
      'Покупался в Дубае новым. Ни разу не падал, всегда в чехле Apple Silicone Case. Чек имеется.',
    ],
    sellerNotes: ['Бизнесмен', 'Программист iOS'],
    iconName: 'Smartphone',
  },
  {
    name: 'Apple iPhone 11 64GB Purple (Фиолетовый)',
    category: 'smartphones',
    baseValue: 16500,
    weightKg: 0.3,
    possibleConditions: ['good', 'worn', 'trash'],
    possibleDefects: ['Менялся экран на неоригинал (нет TrueTone)', 'АКБ 74% (требует обслуживания)', null],
    descriptions: [
      'Любимый цвет девушек. Все функции работают, Face ID шустрый. Без аккаунтов.',
      'Продаю так как подарили 15 Pro. Отдам красивый чехол с блестками.',
    ],
    sellerNotes: ['Школьница', 'Студентка', 'Перекуп новичок'],
    iconName: 'Smartphone',
  },
  {
    name: 'Samsung Galaxy S23 Ultra 512GB (Камера 200 Мп)',
    category: 'smartphones',
    baseValue: 68000,
    weightKg: 0.4,
    possibleConditions: ['mint', 'good', 'worn'],
    possibleDefects: [null, 'Небольшая царапинка на рамке у слота S-Pen'],
    descriptions: [
      'Флагман на Snapdragon 8 Gen 2 for Galaxy. Камера с 100x зумом видит кратеры на Луне. Перо S-Pen.',
      'Экран Dynamic AMOLED 2X 120Hz в идеале под гидрогелем. Батарея держит 2 дня.',
    ],
    sellerNotes: ['Техноблогер', 'Директор фирмы'],
    iconName: 'Smartphone',
  },
  {
    name: 'Наушники Apple AirPods Pro 2 (USB-C кейс)',
    category: 'smartphones',
    baseValue: 16000,
    weightKg: 0.15,
    possibleConditions: ['mint', 'good', 'worn'],
    possibleDefects: ['Один наушник иногда тихо играет (нужно почистить сетку)', 'Кейс слегка потерт карманом', null],
    descriptions: [
      'Активное шумоподавление нового поколения и режим прозрачности. Чип H2.',
      'Оригинал 100%, пробиваются на гарантии. Сменные амбушюры размеров XS, S, L не распечатаны.',
    ],
    sellerNotes: ['Студент', 'Менеджер'],
    iconName: 'Smartphone',
  },
  {
    name: 'Смарт-часы Apple Watch Ultra 49mm Titanium',
    category: 'smartphones',
    baseValue: 52000,
    weightKg: 0.25,
    possibleConditions: ['mint', 'good'],
    possibleDefects: [null, 'Оранжевый ремешок Alpine Loop слегка испачкан'],
    descriptions: [
      'Титановый неубиваемый корпус, плоское сапфировое стекло, водозащита до 100 метров.',
      'Двойная частота GPS, сирена 86 дБ. Использовались только для бега и туризма.',
    ],
    sellerNotes: ['Марафонец', 'Трейдер'],
    iconName: 'Smartphone',
  },
  {
    name: 'Легендарный раритет Nokia 8800 Sirocco Silver (Германия)',
    category: 'smartphones',
    baseValue: 32000,
    weightKg: 0.4,
    possibleConditions: ['good', 'worn', 'mint'],
    possibleDefects: ['Механизм слайдера слегка люфтит', 'Родной АКБ держит полдня', null],
    descriptions: [
      'Чистокровная сталь, сапфировое стекло, щелчок слайдера как затвор пистолета. Мелодии Брайана Ино.',
      'Коллекционное состояние. В комплекте стакан-крэдл с синей подсветкой и замшевый чехол.',
    ],
    sellerNotes: ['Авторитетный мужчина из 2000-х', 'Коллекционер редких телефонов'],
    iconName: 'Smartphone',
  },
  {
    name: 'Google Pixel 7 128GB Lemongrass',
    category: 'smartphones',
    baseValue: 28000,
    weightKg: 0.3,
    possibleConditions: ['mint', 'good'],
    possibleDefects: [null, 'Металлическая полоса камер имеет мелкие микрориски'],
    descriptions: [
      'Чистый Android с обновлениями от Google, эталонный фото-алгоритм HDR+. Распознавание речи офлайн.',
      'Яркий фисташковый цвет. Телефон привезен из Штатов, sim + esim работают без нареканий.',
    ],
    sellerNotes: ['Любитель мобильной фотографии', 'Разработчик'],
    iconName: 'Smartphone',
  },

  // --- КОНСОЛИ И ЖЕЛЕЗО ---
  {
    name: 'Портативная игровая консоль Valve Steam Deck OLED 512GB',
    category: 'computers',
    baseValue: 55000,
    weightKg: 1.2,
    possibleConditions: ['mint', 'good'],
    possibleDefects: [null, 'Чехол слегка пахнет вейпом'],
    descriptions: [
      'Версия с шикарным 90Hz HDR OLED экраном и увеличенной батареей на 50 Вт*ч. Cyberpunk и Ведьмак в портативе.',
      'Куплен пару месяцев назад, почти не играл — нет времени из-за работы. В комплекте родной жесткий кейс.',
    ],
    sellerNotes: ['Айтишник', 'Геймер-путешественник'],
    iconName: 'Laptop',
  },
  {
    name: 'Игровая приставка Sony PlayStation 5 (с дисководом, 2 геймпада)',
    category: 'audio_retro',
    baseValue: 46000,
    weightKg: 5.5,
    possibleConditions: ['mint', 'good'],
    possibleDefects: ['На одном геймпаде слегка дрифтит левый стик', null],
    descriptions: [
      'Ревизия 1208A с улучшенным охлаждением. Не забанена, пломбы на месте. 2 оригинальных геймпада DualSense.',
      'В подарок отдам диски с Spider-Man 2 и God of War Ragnarok. Коробка сохранена.',
    ],
    sellerNotes: ['Отец семейства', 'Студент переезжает'],
    iconName: 'Radio',
  },
  {
    name: 'Игровая приставка Nintendo Switch OLED (прошитая + 512GB флешка)',
    category: 'audio_retro',
    baseValue: 27000,
    weightKg: 0.9,
    possibleConditions: ['good', 'mint'],
    possibleDefects: [null, 'Стеклышко защитное с пузырем на углу'],
    descriptions: [
      'Установлен чип Picofly, настроена кастомная прошивка Atmosphere. Любые игры от Зельды до Марио качаются бесплатно!',
      'Белые джойконы не люфтят, экран без выгораний. Полный комплект с док-станцией.',
    ],
    sellerNotes: ['Мастер-чиповщик', 'Геймер'],
    iconName: 'Radio',
  },
  {
    name: 'Видеокарта Nvidia GeForce RTX 4080 16GB Founders Edition',
    category: 'gpus',
    baseValue: 92000,
    weightKg: 2.3,
    possibleConditions: ['mint', 'good'],
    possibleDefects: [null, 'Нужен БП от 850W и комплектный переходник 12VHPWR'],
    descriptions: [
      'Премиальный эталонный дизайн Founders Edition из черного алюминия. Тянет абсолютно всё в 4K с трассировкой лучей.',
      'Пломбы завода на месте, температуры в стресс-тесте 63 градуса. Стояла в закрытом продуваемом корпусе Lian Li.',
    ],
    sellerNotes: ['Энтузиаст ПК', '3D-аниматор'],
    iconName: 'Cpu',
  },
  // --- АВТОМОБИЛИ ПОД ПЕРЕКУП ---
  {
    name: 'ВАЗ-2114 «Четырка» 2008 (троит 8-клапанник)',
    category: 'cars_flipping',
    baseValue: 145000,
    weightKg: 950,
    possibleConditions: ['worn', 'trash'],
    possibleDefects: ['Прогорел клапан во 2 цилиндре, троит', 'Ржавые задние арки и пороги'],
    descriptions: [
      'Дно и стаканы целые, по кузову косяки. Двигатель заводится, но нет компрессии во 2 цилиндре.',
      'На штампах, музыка есть. Если руки из плеч — отличный вариант под перепродажу с наваром 40-50к.',
    ],
    sellerNotes: ['Молодой пацан', 'Срочно нужны деньги на сессию'],
    iconName: 'Car',
  },
  {
    name: 'Ford Focus 2 рестайл 1.6 MT (бито крыло и фара)',
    category: 'cars_flipping',
    baseValue: 420000,
    weightKg: 1300,
    possibleConditions: ['worn', 'good'],
    possibleDefects: ['Крыло под замену, треснула фара, бампер в щепки', 'Течет сальник привода'],
    descriptions: [
      'ДТП по касательной во дворе. Лонжероны и геометрия не задеты, подушки на месте. Мотор шепчет.',
      'Оригинальный ПТС, 2 хозяина. Поставить контрактное крыло, покрасить — и на Авито уйдет со свистом.',
    ],
    sellerNotes: ['Семьянин', 'Пенсионер'],
    iconName: 'Car',
  },
  {
    name: 'Hyundai Solaris 2017 AT (из-под такси, снят с учета)',
    category: 'cars_flipping',
    baseValue: 780000,
    weightKg: 1200,
    possibleConditions: ['worn', 'good'],
    possibleDefects: ['Затерт руль и педали, нужен глубокий детейлинг', 'Глушитель сечет на стыке'],
    descriptions: [
      'Белый на автомате. Автомат не пинает, кондиционер морозит. Следы пленки такси удалены.',
      'Нужна химчистка салона и перешив руля. В розницу улетит за день.',
    ],
    sellerNotes: ['Владелец таксопарка', 'Скупка юрлиц'],
    iconName: 'Car',
  },
  {
    name: 'Toyota Camry 3.5 V40 (крашен капот, гудит насос ГУР)',
    category: 'cars_flipping',
    baseValue: 1350000,
    weightKg: 1600,
    possibleConditions: ['good', 'worn'],
    possibleDefects: ['Гул гидроусилителя руля на холодную', 'Вторичный окрас капота и бампера'],
    descriptions: [
      'Легендарная сороковка 3.5! Мотор 2GR тянет как тепловоз. Кожа черная в приличном виде.',
      'Знающие люди за эту машину душу продадут. Ликвидность 10 из 10.',
    ],
    sellerNotes: ['Бизнесмен из региона', 'Перекуп постарше'],
    iconName: 'Car',
  },
  {
    name: 'BMW 5-серии F10 528i (ошибка по приводу, масложор)',
    category: 'cars_flipping',
    baseValue: 1850000,
    weightKg: 1750,
    possibleConditions: ['worn', 'good'],
    possibleDefects: ['Свистит клапан КВКГ, жрет масло', 'Ошибка по Valvetronic'],
    descriptions: [
      'М-пакет, рыжая кожа, люк, доводчики. По мотору горит чек, нужно поменять клапанную крышку.',
      'Срочная продажа, так как хозяин улетает. Потенциал профита 350+ тысяч рублей!',
    ],
    sellerNotes: ['Мажор', 'Срочный выкуп'],
    iconName: 'Car',
  },
  {
    name: 'Porsche Cayenne S 4.8 (пневма травит за ночь)',
    category: 'cars_flipping',
    baseValue: 3200000,
    weightKg: 2200,
    possibleConditions: ['worn', 'good'],
    possibleDefects: ['Спускает передний правый пневмобаллон', 'Скрипит задний сайлентблок'],
    descriptions: [
      'Панорамная крыша, выхлоп GTS, музыка Bose. Утром ложится на правый бок — надо обслужить пневмостойку.',
      'Ценник ниже рынка на миллион из-за срочности. Для темщика — золотая жила.',
    ],
    sellerNotes: ['Срочная комиссионка', 'Инвестор'],
    iconName: 'Car',
  },

  // --- ЗАЛОГОВАЯ НЕДВИЖИМОСТЬ И ТОРГИ ПО БАНКРОТСТВУ ---
  {
    name: 'Гаражный бокс 24м² с торга по банкротству (с имуществом)',
    category: 'real_estate',
    baseValue: 480000,
    weightKg: 10,
    possibleConditions: ['worn', 'good'],
    possibleDefects: ['Заварен замок, нужно вскрытие с МЧС и вывоз хлама', 'Крыша протекает по весне'],
    descriptions: [
      'Железобетонный бокс в ГСК на первой линии. Документы чистые, с торгов должника.',
      'Внутри куча старых деталей и верстак. Отличное вложение под склад или перепродажу.',
    ],
    sellerNotes: ['Финансовый управляющий', 'Аукционный брокер'],
    iconName: 'Building',
  },
  {
    name: 'Доля 1/2 в двухкомнатной квартире (арест приставов)',
    category: 'real_estate',
    baseValue: 1650000,
    weightKg: 10,
    possibleConditions: ['worn', 'good'],
    possibleDefects: ['Второй собственник сопротивляется, требуется юрист', 'Долги по коммуналке 80к'],
    descriptions: [
      'Выморочное или арестованное имущество. Центр спального района, кирпичный дом.',
      'После выкупа второй доли или через суд квартира продается целиком втрое дороже.',
    ],
    sellerNotes: ['Пристав-исполнитель', 'Юрист банка'],
    iconName: 'Building',
  },
  {
    name: 'Студия 26м² с торгов залогового имущества (черновая)',
    category: 'real_estate',
    baseValue: 3900000,
    weightKg: 10,
    possibleConditions: ['good', 'worn'],
    possibleDefects: ['Черновая отделка, нет разводки электрики', 'Ключи в конкурсной массе'],
    descriptions: [
      'Дом сдан, ключи получены. Банковский дефолт ипотечника. Срочная реализация на 30% ниже рынка.',
      'Сделать быстрый косметический эконом-ремонт — и выставить с маржой 800 000 ₽.',
    ],
    sellerNotes: ['Сбер-Залог', 'Торги РОСЭЛТОРГ'],
    iconName: 'Building',
  },
  {
    name: 'Евро-двушка 58м² в ЖК Комфорт+ (арестованное имущество)',
    category: 'real_estate',
    baseValue: 9200000,
    weightKg: 10,
    possibleConditions: ['good', 'mint'],
    possibleDefects: ['Замок опечатан приставами, требуется снятие обременений'],
    descriptions: [
      'Шикарная планировка, вид во двор без машин. Полноценная квартира от разорившегося девелопера.',
      'Чистый профит при быстрой перепродаже превышает 1.8 миллиона рублей!',
    ],
    sellerNotes: ['Конкурсный управляющий', 'ФССП'],
    iconName: 'Building',
  },
];

export const GOALS: GameGoal[] = [
  {
    id: 1,
    title: 'Закрыть микрозайм',
    description: 'Накопи 40 000 ₽ чистыми, чтобы вернуть долг 15 000 ₽ коллекторам МФО «БыстроДеньги».',
    targetMoney: 40000,
    reward: 'Разблокировка доступа к Банковским Торгам и спокойный сон',
    actionTitle: 'Погасить микрозайм (-15 000 ₽)',
    repayAmount: 15000,
    completionMessage: 'Коллекторы агентства «БыстроКэш» удалили твой номер из базы! Ты больше никому не должен. Открыт доступ к Банковским Торгам!',
  },
  {
    id: 2,
    title: 'Аренда нормального гаража',
    description: 'Переехать с маминого балкона в ГСК «Рассвет» и накопить 120 000 ₽ капитала.',
    targetMoney: 120000,
    reward: 'Репутационный значок «Проверенный продавец» (+0.3 к рейтингу)',
    actionTitle: 'Оформить аренду гаража (-30 000 ₽)',
    repayAmount: 30000,
    completionMessage: 'Ключи от гаража в ГСК «Рассвет» на руках! Теперь есть верстак для пайки и буржуйка. Рейтинг продавца повышен на +0.3!',
  },
  {
    id: 3,
    title: 'Король Авито твоего района',
    description: 'Заработать 350 000 ₽ капитала и стать главным авторитетом по перепродаже.',
    targetMoney: 350000,
    reward: 'Постоянная скидка 20% на выкуп лотов с конфиската',
    actionTitle: 'Забрать статус Короля Авито',
    repayAmount: 0,
    completionMessage: 'Все перекупы района признали твой авторитет! Теперь на торгах конфиската тебе отдают лоты с приоритетной скидкой 20%!',
  },
  {
    id: 4,
    title: 'Четкий авто для перекупа',
    description: 'Накопить 1 000 000 ₽ капитала и купить рабочий авто для перекупских выездов.',
    targetMoney: 1000000,
    reward: '🚗 Разблокировка АВТО-ТОРГОВ: банкротные автопарки и перекуп иномарок!',
    actionTitle: 'Купить авто перекупа (-150 000 ₽)',
    repayAmount: 150000,
    completionMessage: 'Боевая машина урчит под окном! Теперь официально разблокированы крупные Авто-Торги банкротных автопарков и категория «Авто под перекуп»!',
  },
  {
    id: 5,
    title: 'Оптовый склад и логистика',
    description: 'Масштабироваться до оптовых поставок и накопить 2 800 000 ₽ капитала.',
    targetMoney: 2800000,
    reward: '🏢 Разблокировка ТОРГОВ НЕДВИЖИМОСТЬЮ: залоговые квартиры и боксы!',
    actionTitle: 'Снять оптовый терминал (-450 000 ₽)',
    repayAmount: 450000,
    completionMessage: 'Собственный оптовый хаб и офис в бизнес-центре! Банки открыли тебе доступ к закрытым торгам залоговой недвижимостью и апартаментами!',
  },
  {
    id: 6,
    title: 'Легализация: ООО «Темщик Холдинг»',
    description: 'Выйти из серой зоны, зарегистрировать компанию и накопить 6 500 000 ₽.',
    targetMoney: 6500000,
    reward: '🛡️ Защита от ФНС и 115-ФЗ: риск блокировок и штрафов снижен на 85%!',
    actionTitle: 'Зарегистрировать ООО и заплатить налоги (-900 000 ₽)',
    repayAmount: 900000,
    completionMessage: 'Гербовая печать ООО «Темщик Холдинг» и белый корпоративный счет! Налоговые риски и блокировки 115-ФЗ теперь сведены к минимуму!',
  },
  {
    id: 7,
    title: 'Мутация в Венчурного Бизнесмена',
    description: 'Собрать 15 000 000 ₽ и завершить путь темщика, став респектабельным капиталистом.',
    targetMoney: 15000000,
    reward: '🏆 ФИНАЛ ИГРЫ: Статус Олигарха, статья в Forbes и режим «Симулятор Бизнесмена»!',
    actionTitle: 'Мутировать в Бизнесмена (-2 500 000 ₽)',
    repayAmount: 2500000,
    completionMessage: 'ПОБЕДА! Вы прошли тернистый путь от уличного перекупа до генерального директора инвестиционной империи! Forbes посвятил вам главную статью номера!',
  },
];

export const INITIAL_REVIEWS = [
  {
    id: 'rev-1',
    author: 'Алексей_99',
    stars: 5,
    text: 'Брал видеокарту, всё четко, термопаста свежая. Нормальный продавец, респект.',
    day: 1,
  },
  {
    id: 'rev-2',
    author: 'Марина_Цветы',
    stars: 4,
    text: 'Ноутбук хороший, но в багажнике его машины пахло соляркой. Сделал скидку 500р.',
    day: 1,
  },
];

// Generate an initial or refreshed item
export function generateMarketItem(
  idSuffix: string, 
  trends: MarketTrend[], 
  preferredCategory?: ItemCategory | 'all',
  playerBudget?: number
): Item {
  let templateList = ITEM_TEMPLATES;

  // Anti-softlock & penny deals: if player is broke (< 2500 ₽), guarantee cheap budget items!
  if (playerBudget !== undefined && playerBudget < 2500) {
    const cheapTemplates = ITEM_TEMPLATES.filter((t) => t.baseValue <= 3000);
    if (cheapTemplates.length > 0 && Math.random() < 0.75) {
      templateList = cheapTemplates;
    }
  } else if (preferredCategory && preferredCategory !== 'all') {
    // 75% chance to pick from preferred specialization/focus, 25% random
    if (Math.random() < 0.75) {
      const filtered = ITEM_TEMPLATES.filter((t) => t.category === preferredCategory);
      if (filtered.length > 0) {
        templateList = filtered;
      }
    }
  } else if (playerBudget !== undefined) {
    // Progression scaling: as player gets richer, shift from small items to cars and real estate!
    if (playerBudget >= 600000) {
      // Wealthy player: 60% chance of major assets (cars, real estate, top tier hardware)
      if (Math.random() < 0.65) {
        const bigTickets = ITEM_TEMPLATES.filter((t) => t.baseValue >= 90000);
        if (bigTickets.length > 0) templateList = bigTickets;
      }
    } else if (playerBudget >= 100000) {
      // Middle tier player: introduce car flips and mid-high electronics
      if (Math.random() < 0.5) {
        const midTickets = ITEM_TEMPLATES.filter((t) => t.baseValue >= 20000 && t.category !== 'real_estate');
        if (midTickets.length > 0) templateList = midTickets;
      }
    } else {
      // Early game player: don't flood feed with cars and apartments they can't afford
      templateList = ITEM_TEMPLATES.filter((t) => t.category !== 'cars_flipping' && t.category !== 'real_estate');
    }
  }

  const template = templateList[Math.floor(Math.random() * templateList.length)];
  const condition = template.possibleConditions[Math.floor(Math.random() * template.possibleConditions.length)];
  const defect = template.possibleDefects[Math.floor(Math.random() * template.possibleDefects.length)];
  
  // Trend multiplier
  const trend = trends.find(t => t.category === template.category);
  const trendMult = trend ? trend.multiplier : 1.0;
  
  // Condition multiplier
  const condMult = condition === 'mint' ? 1.15 : condition === 'good' ? 1.0 : condition === 'worn' ? 0.75 : 0.45;
  
  const currentMarketValue = Math.round((template.baseValue * trendMult * condMult) / 100) * 100;

  // Purchase Risk: 14% chance of SCAM / BRICK on used goods (good, worn, trash)
  let isScam = false;
  let scamReason: string | undefined = undefined;
  let scamRealValue: number | undefined = undefined;
  let sellerNote = template.sellerNotes[Math.floor(Math.random() * template.sellerNotes.length)];

  if (condition !== 'mint' && Math.random() < 0.14) {
    const SCAM_POOLS: Partial<Record<ItemCategory, Array<{ reason: string; scrapRatio: number; note: string }>>> = {
      gpus: [
        { reason: 'Китайский перемаркированный чип GTS 450 с прошитым BIOS под топовую видеокарту', scrapRatio: 0.08, note: 'Срочно! Продаю дешевле рынка, нужны деньги на лечение кота.' },
        { reason: 'Утопленник со следами жесткой коррозии и прогаром текстолита после майнинга', scrapRatio: 0.06, note: 'Стояла у брата в домашнем ПК, только ютуб смотрели.' },
        { reason: 'Муляж с фальшивым кулером и свинцовым утяжелителем вместо рабочих чипов', scrapRatio: 0.05, note: 'Коробка с пломбой, чека нет, подарили на день рождения.' },
      ],
      computers: [
        { reason: 'Прогретый феном северный мост и отвал видеочипа, замазанный термопастой', scrapRatio: 0.08, note: 'Включается, летает, продаю в связи с переездом.' },
      ],
      smartphones: [
        { reason: 'Китайская копия на древнем процессоре MTK с фальшивой оболочкой под iOS', scrapRatio: 0.07, note: 'Подарок бывшей, продаю за полцены, чтобы быстрее забрать кэш.' },
        { reason: 'Заблокирован на чужой iCloud / MDM профиль организации, тусклый дешевый TFT-экран', scrapRatio: 0.09, note: 'Пароль забыли, ребенок натыкал, восстановить не умеем.' },
        { reason: 'Франкенштейн из трех разбитых доноров, плата прогрета строительным феном перед продажей', scrapRatio: 0.08, note: 'Идеальное состояние! Всегда в чехле и бронепленке.' },
      ],
      auto_parts: [
        { reason: 'Колесный диск с трещиной на внутреннем ободе, закрашенной баллончиком', scrapRatio: 0.10, note: 'Ровные, без сварок и прокаток, стояли на личной машине.' },
      ],
      cars_flipping: [
        { reason: 'Сваренный распил из двух битых половин со следами пожара и перебитым VIN!', scrapRatio: 0.15, note: 'Не бита, не крашена, дедушка на дачу ездил по выходным.' },
        { reason: 'Трещина в блоке цилиндров замазана холодной сваркой, в масло залит загуститель!', scrapRatio: 0.18, note: 'Сел и поехал, мотор шепчет, масло ни капли не ест.' },
      ],
      appliances: [
        { reason: 'Сгоревший компрессор, вместо фреона воздух, на плате следы замыкания', scrapRatio: 0.08, note: 'Работала отлично, продаем из-за перепланировки квартиры.' },
        { reason: 'Муляж витринного образца без внутренних механизмов и мотора', scrapRatio: 0.05, note: 'Новый в пленках, ни разу не пользовались.' },
      ],
      tools_equipment: [
        { reason: 'Дешевая пластиковая подделка под бренд, мотор сгорел на 5-й секунде', scrapRatio: 0.10, note: 'Оригинал из Финляндии, лежал без дела в гараже.' },
        { reason: 'Стертые пластиковые шестерни редуктора, склеенные суперклеем для одного пуска', scrapRatio: 0.08, note: 'Почти не работал, ресурс на 100%.' },
      ],
      clothes_fashion: [
        { reason: 'Дешевый синтетический фейк с рынка, кривые швы и фальшивый логотип', scrapRatio: 0.08, note: 'Брал в фирменном магазине, бирки срезал, не подошел фасон.' },
      ],
      audio_retro: [
        { reason: 'Новодельная силуминовая копия, состаренная кислотой под видом антиквариата', scrapRatio: 0.10, note: 'Найдено на чердаке старого дома профессора.' },
      ],
      wholesale_junk: [
        { reason: 'Коробка с битым неликвидным хламом со свалки вместо заявленной партии', scrapRatio: 0.08, note: 'Отказники с маркетплейса, отдаю без вскрытия оптом.' },
      ],
      real_estate: [
        { reason: 'Доля в аварийном бараке под снос с запретом на регистрационные действия', scrapRatio: 0.20, note: 'Срочный выкуп от собственника, отличная инвестиция!' },
      ],
    };

    const pool = SCAM_POOLS[template.category] || SCAM_POOLS.gpus;
    if (pool && pool.length > 0) {
      const chosenScam = pool[Math.floor(Math.random() * pool.length)];
      isScam = true;
      scamReason = chosenScam.reason;
      scamRealValue = Math.max(300, Math.round((currentMarketValue * chosenScam.scrapRatio) / 100) * 100);
      sellerNote = chosenScam.note;
    }
  }
  
  // Seller's initial price is usually slightly below or above market
  // If scammer or defective, seller intentionally dumps it cheap as bait!
  const priceSpread = isScam 
    ? (0.42 + Math.random() * 0.18) 
    : defect 
      ? (0.55 + Math.random() * 0.25) 
      : (0.75 + Math.random() * 0.28);
  const askingPrice = Math.max(100, Math.round((currentMarketValue * priceSpread) / 100) * 100);

  const desc = template.descriptions[Math.floor(Math.random() * template.descriptions.length)];

  // 22% chance seller strictly forbids bargaining ("БЕЗ ТОРГА СОВСЕМ")
  const isStrictNoBargain = Math.random() < 0.22;
  const personalityRoll = Math.random();
  const sellerPersonality: 'strict_no_bargain' | 'stubborn' | 'urgent' | 'normal' = 
    isStrictNoBargain
      ? 'strict_no_bargain'
      : personalityRoll < 0.35
      ? 'stubborn'
      : personalityRoll < 0.60
      ? 'urgent'
      : 'normal';

  let finalSellerNote = sellerNote;
  if (isStrictNoBargain) {
    finalSellerNote = finalSellerNote ? `${finalSellerNote} • ⛔ Без торга` : '⛔ Без торга совсем';
  } else if (sellerPersonality === 'urgent') {
    finalSellerNote = finalSellerNote ? `${finalSellerNote} • ⚡ Срочный слив` : '⚡ Срочная продажа';
  }

  return {
    id: `item-${Date.now()}-${idSuffix}`,
    name: template.name,
    category: template.category,
    condition,
    baseValue: template.baseValue,
    currentMarketValue,
    boughtPrice: askingPrice, // for feed item, this acts as seller's asking price
    weightKg: template.weightKg,
    description: desc,
    sellerNotes: finalSellerNote,
    hiddenDefect: defect,
    isDefectDiscovered: false,
    isRestored: false,
    iconName: template.iconName,
    isScam,
    scamReason,
    scamRealValue,
    isStrictNoBargain,
    sellerPersonality,
  };
}

// Generate realistic buyer offers with wide variety: lowballers, broke students, normal buyers, enthusiasts
export function generateBuyerOffer(item: Item): IncomingBuyerOffer {
  const listedPrice = item.listedPrice || item.currentMarketValue;
  const priceToMarketRatio = listedPrice / Math.max(1, item.currentMarketValue);

  const rand = Math.random();
  let buyerType: 'lowballer' | 'impatient' | 'normal' | 'scammer';
  let factor: number;

  if (priceToMarketRatio > 1.3) {
    // Heavily overpriced: aggressive lowballers and tire-kickers
    if (rand < 0.65) {
      buyerType = 'lowballer';
      factor = 0.32 + Math.random() * 0.26; // 32% - 58% of price (often in negative profit!)
    } else if (rand < 0.88) {
      buyerType = 'impatient';
      factor = 0.55 + Math.random() * 0.20; // 55% - 75%
    } else {
      buyerType = 'normal';
      factor = 0.72 + Math.random() * 0.16; // 72% - 88%
    }
  } else if (priceToMarketRatio < 0.85) {
    // Underpriced item: eager buyers & enthusiasts
    if (rand < 0.55) {
      buyerType = 'scammer'; // enthusiast full price
      factor = 0.98 + Math.random() * 0.06; // 98% - 104%
    } else if (rand < 0.85) {
      buyerType = 'normal';
      factor = 0.88 + Math.random() * 0.10;
    } else {
      buyerType = 'lowballer';
      factor = 0.50 + Math.random() * 0.25;
    }
  } else {
    // Fair market price: diverse spectrum of buyers
    if (rand < 0.35) {
      buyerType = 'lowballer';
      factor = 0.35 + Math.random() * 0.28; // 35% - 63% (often negative margin!)
    } else if (rand < 0.65) {
      buyerType = 'impatient';
      factor = 0.58 + Math.random() * 0.22; // 58% - 80%
    } else if (rand < 0.90) {
      buyerType = 'normal';
      factor = 0.80 + Math.random() * 0.15; // 80% - 95%
    } else {
      buyerType = 'scammer'; // enthusiast
      factor = 0.98 + Math.random() * 0.04; // 98% - 102%
    }
  }

  let offeredPrice = Math.round((listedPrice * factor) / 100) * 100;
  if (offeredPrice < 100) offeredPrice = 100;

  const profiles = {
    lowballer: {
      names: ['Руслан_Перекуп', 'Артурчик_Скупка', 'Савелий_Опт', 'Мамед_Кэш', 'Ломбард_24', 'Гоша_Скупщик'],
      avatars: ['🧔', '🧢', '🕶️', '👨‍🔧', '🕵️‍♂️'],
      messages: [
        `Брат, цена завышена в космос! Заберу за ${offeredPrice.toLocaleString('ru-RU')} ₽ прямо сейчас самовывозом. Больше никто не даст.`,
        `Отдай за ${offeredPrice.toLocaleString('ru-RU')} ₽ студентам на запчасти. Дольше продавать будешь.`,
        `За ${offeredPrice.toLocaleString('ru-RU')} ₽ выезжаю через 10 минут, деньги в кармане наличными.`,
        `В ломбарде за это ${offeredPrice.toLocaleString('ru-RU')} ₽ дадут. Заберу без лишних проверок у подъезда.`,
        `За ${offeredPrice.toLocaleString('ru-RU')} ₽ заберу сегодня. Больше этот хлам не стоит.`,
      ],
      patience: 35 + Math.floor(Math.random() * 30),
    },
    impatient: {
      names: ['Данила_Студент', 'Максим_Школьник', 'Мама_в_декрете', 'Игорь_Электричка', 'Сергей_Стипендия'],
      avatars: ['👦', '🧑‍🎓', '👩‍👧', '👨‍💻'],
      messages: [
        `Здравствуйте! У меня со стипендии осталось ровно ${offeredPrice.toLocaleString('ru-RU')} ₽, продайте пожалуйста, очень нужно!`,
        `Привет! Скиньте до ${offeredPrice.toLocaleString('ru-RU')} ₽, я сам приеду на электричке прямо к подъезду.`,
        `За ${offeredPrice.toLocaleString('ru-RU')} ₽ отдадите? Больше денег физически нет, а вещь нужна позарез...`,
        `Уступите студенту за ${offeredPrice.toLocaleString('ru-RU')} ₽, буду век благодарен!`,
      ],
      patience: 50 + Math.floor(Math.random() * 30),
    },
    normal: {
      names: ['Алексей_Инженер', 'Мария_Фриланс', 'Дмитрий_Разработчик', 'Олег_Водитель', 'Елена_Менеджер'],
      avatars: ['👨‍💼', '👩‍💻', '👨‍🦱', '👩‍💼'],
      messages: [
        `Добрый день! Уступите немного на бензин? Готов забрать за ${offeredPrice.toLocaleString('ru-RU')} ₽ сегодня после 19:00.`,
        `Здравствуйте! Если отдадите за ${offeredPrice.toLocaleString('ru-RU')} ₽, приеду сам, рассчитаюсь переводом.`,
        `Актуально? Готов предложить ${offeredPrice.toLocaleString('ru-RU')} ₽, проверю на месте и заберу.`,
        `Здравствуйте! За ${offeredPrice.toLocaleString('ru-RU')} ₽ договоримся?`,
      ],
      patience: 65 + Math.floor(Math.random() * 25),
    },
    scammer: { // Enthusiast / full buyer
      names: ['Илья_Коллекционер', 'Константин_Срочно', 'Кирилл_Pro', 'Антон_Ценитель', 'Виктор_Мастер'],
      avatars: ['🧐', '🚀', '⭐', '🔥'],
      messages: [
        `Здравствуйте! Забираю за ${offeredPrice.toLocaleString('ru-RU')} ₽! Поставьте в бронь пожалуйста, уже выезжаю к вам.`,
        `Отличное состояние и честная цена. Заберу за ${offeredPrice.toLocaleString('ru-RU')} ₽ без торга прямо сейчас.`,
        `Давно искал именно такую модель! Готов забрать за ${offeredPrice.toLocaleString('ru-RU')} ₽ сегодня.`,
      ],
      patience: 80 + Math.floor(Math.random() * 15),
    },
  };

  const p = profiles[buyerType];
  const name = p.names[Math.floor(Math.random() * p.names.length)];
  const avatar = p.avatars[Math.floor(Math.random() * p.avatars.length)];
  const message = p.messages[Math.floor(Math.random() * p.messages.length)];

  return {
    id: `offer-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    itemId: item.id,
    buyerName: name,
    buyerAvatar: avatar,
    buyerType,
    offeredPrice,
    message,
    patience: p.patience,
  };
}

export function generateAuctionLot(
  day: number, 
  trends: MarketTrend[], 
  tier: AuctionTier = 'small'
): AuctionLot {
  const smallLots = [
    {
      source: 'Ликвидация ООО «Крипто-Фарм Сев-Запад»',
      title: 'Лот №412: Списанный массив графических ускорителей',
      desc: 'Конфискованное имущество по иску за неуплату электроэнергии. 4 видеокарты RTX 3060 и RX 580 на запчасти и восстановление.',
      itemsCount: 4,
      category: 'gpus' as ItemCategory,
    },
    {
      source: 'Банк «Омега» (Залоговый отдел)',
      title: 'Лот №89: Оргтехника и ноутбуки обанкротившегося туроператора',
      desc: 'Комплект техники: ноутбук ThinkPad, MacBook Air с помятым углом и офисный системник.',
      itemsCount: 3,
      category: 'computers' as ItemCategory,
    },
    {
      source: 'ФССП (Арестованное имущество ломбарда)',
      title: 'Лот №17: Спецоборудование и партия мобильных гаджетов',
      desc: 'Осциллограф С1-65А, паяльная станция и коробка телефонов под восстановление.',
      itemsCount: 3,
      category: 'tools_equipment' as ItemCategory,
    },
    {
      source: 'Конкурсный управляющий АО «Пром-Логистик»',
      title: 'Лот №55: Серверное оборудование и мониторы',
      desc: 'Серверная стойка Xeon и партия офисных мониторов. Большой вес, высокая окупаемость по частям.',
      itemsCount: 2,
      category: 'wholesale_junk' as ItemCategory,
    },
    {
      source: 'Служба судебных приставов (Закрытие автосервиса)',
      title: 'Лот №208: Залоговые комплекты шин, дисков и автозапчастей',
      desc: 'Шины Nokian и Michelin, кованые диски ВСМПО и детали тюнинга с арестованного сервиса тюнинга.',
      itemsCount: 3,
      category: 'auto_parts' as ItemCategory,
    },
    {
      source: 'Таможенный конфискат (Склад временного хранения)',
      title: 'Лот №94: Недекларированная партия брендовой одежды и обуви',
      desc: 'Оригинальные пуховики The North Face, кроссовки Jordan и винтаж. Высокая маржинальность в ресейле.',
      itemsCount: 3,
      category: 'clothes_fashion' as ItemCategory,
    },
    {
      source: 'Залоговое имущество сети электроники',
      title: 'Лот №331: Партия бытовой техники и фенов Dyson',
      desc: 'Возвратные и невостребованные товары маркетплейса: кофемашины DeLonghi, роботы-пылесосы и фены.',
      itemsCount: 3,
      category: 'appliances' as ItemCategory,
    },
  ];

  const vehicleLots = [
    {
      source: 'Банкротство ООО «Такси-Комфорт Столица»',
      title: 'Лот №710: Автопарк коммерческих седанов (Solaris & Focus)',
      desc: 'Списанные с баланса автомобили таксопарка под косметику, перешив рулей и перепродажу в розницу.',
      itemsCount: 2,
      category: 'cars_flipping' as ItemCategory,
    },
    {
      source: 'ФССП: Реализация арестованного имущества стройтреста',
      title: 'Лот №834: Представительский седан Camry 3.5 и ВАЗ-2114',
      desc: 'Автомобили руководства и прорабский транспорт. Отличная маржинальность для перекупов с руками.',
      itemsCount: 2,
      category: 'cars_flipping' as ItemCategory,
    },
    {
      source: 'Залоговый департамент ВТБ-Лизинг',
      title: 'Лот №912: Премиум-кроссовер Porsche Cayenne и седан BMW F10',
      desc: 'Дефолт лизинговой компании. Высокий чек, солидная прибыль после детейлинга и ТО.',
      itemsCount: 2,
      category: 'cars_flipping' as ItemCategory,
    },
  ];

  const realEstateLots = [
    {
      source: 'Конкурсная масса ООО «Гараж-Инвест»',
      title: 'Лот №102: Два капитальных гаражных бокса 24м² с имуществом',
      desc: 'Первая линия ГСК, асфальт, электричество. Внутри стеллажи, верстаки и запчасти от должника.',
      itemsCount: 2,
      category: 'real_estate' as ItemCategory,
    },
    {
      source: 'Росимущество / Банкротные торги должников',
      title: 'Лот №240: Студия 26м² в новостройке и гаражный бокс',
      desc: 'Залоговая студия с черновой отделкой от дефолтного заемщика. Срочный сброс на 35% ниже рынка.',
      itemsCount: 2,
      category: 'real_estate' as ItemCategory,
    },
    {
      source: 'Торги залогового имущества ПАО Сбербанк',
      title: 'Лот №315: Евро-двушка 58м² в ЖК Комфорт+ (снятие ареста)',
      desc: 'Квартира в престижном районе с панорамным остеклением. Продажа с торгов по начальной дисконтной цене.',
      itemsCount: 1,
      category: 'real_estate' as ItemCategory,
    },
  ];

  let selectedLotPool = smallLots;
  if (tier === 'vehicles') selectedLotPool = vehicleLots;
  if (tier === 'real_estate') selectedLotPool = realEstateLots;

  const template = selectedLotPool[Math.floor(Math.random() * selectedLotPool.length)];
  const items: Item[] = [];
  let totalMarketValue = 0;

  for (let i = 0; i < template.itemsCount; i++) {
    const item = generateMarketItem(`auc-${tier}-${i}`, trends, template.category);
    items.push(item);
    totalMarketValue += item.currentMarketValue;
  }

  const startingBid = Math.round((totalMarketValue * 0.45) / 1000) * 1000;
  
  // Real Market vs Official Court Appraisal:
  // 40% chance court appraiser under-appraised the lot (55-75% of real value - huge jackpot!)
  // 30% chance court appraiser over-appraised junk (130-180% of real value - trap!)
  // 30% chance roughly fair (90-110%)
  const appraisalRoll = Math.random();
  let estimatedValue: number;
  if (appraisalRoll < 0.40) {
    estimatedValue = Math.round((totalMarketValue * (0.55 + Math.random() * 0.20)) / 1000) * 1000;
  } else if (appraisalRoll < 0.70) {
    estimatedValue = Math.round((totalMarketValue * (1.30 + Math.random() * 0.50)) / 1000) * 1000;
  } else {
    estimatedValue = Math.round((totalMarketValue * (0.92 + Math.random() * 0.16)) / 1000) * 1000;
  }

  // Bidders pool: includes stubborn "дебилы торгуются" who get emotional and can bid ABOVE market value!
  const botBidders = tier === 'real_estate' ? [
    { name: 'Фонд Недвижимости «Столица»', aggression: 0.7, maxBid: Math.round(totalMarketValue * 0.82) },
    { name: 'Юрист Воронов (Торги)', aggression: 0.5, maxBid: Math.round(totalMarketValue * 0.70) },
    { name: 'Инвест-Клуб «Квадрат»', aggression: 0.82, maxBid: Math.round(totalMarketValue * 0.88) },
    { name: 'Гоша Азартный (Кредит х10)', aggression: 0.92, maxBid: Math.round(totalMarketValue * (1.08 + Math.random() * 0.25)) },
  ] : tier === 'vehicles' ? [
    { name: 'ИП Мамедов (Авторынок Самара)', aggression: 0.75, maxBid: Math.round(totalMarketValue * 0.82) },
    { name: 'Артем_ПодборАвто', aggression: 0.6, maxBid: Math.round(totalMarketValue * 0.74) },
    { name: 'Босс Таксопарка «Вектор»', aggression: 0.85, maxBid: Math.round(totalMarketValue * 0.90) },
    { name: 'Перекуп на кураже (В долгах)', aggression: 0.94, maxBid: Math.round(totalMarketValue * (1.10 + Math.random() * 0.25)) },
  ] : [
    { name: 'Мага Перекуп (Савела)', aggression: 0.7, maxBid: Math.round(totalMarketValue * 0.78) },
    { name: 'Аркадий Семенович (Юр-Отдел)', aggression: 0.5, maxBid: Math.round(totalMarketValue * 0.65) },
    { name: 'Кирилл_Майнер', aggression: 0.85, maxBid: Math.round(totalMarketValue * 0.85) },
    { name: 'Султан_Колеса', aggression: 0.75, maxBid: Math.round(totalMarketValue * 0.80) },
    { name: 'Школьник с маминой картой', aggression: 0.95, maxBid: Math.round(totalMarketValue * (1.12 + Math.random() * 0.28)) },
  ];

  return {
    id: `lot-${tier}-${day}-${Date.now().toString().slice(-4)}`,
    title: template.title,
    source: template.source,
    tier,
    description: template.desc,
    items,
    startingBid,
    currentBid: startingBid,
    currentLeader: 'Стартовая цена организатора',
    playerBid: 0,
    secondsLeft: 30, // active timer
    estimatedValue,
    actualMarketValue: totalMarketValue,
    isAppraisalVerified: false,
    bidders: botBidders,
    isCompleted: false,
    wonByPlayer: false,
  };
}

export const INITIAL_STATE: GameState = {
  money: 18000, // starting budget in rubles
  day: 1,
  energy: 100,
  reputation: 4.6,
  reputationPoints: 24,
  reviews: INITIAL_REVIEWS,
  skills: {
    negotiation: 1,
    assessment: 1,
    restoration: 1,
    storage: 1,
    auctionSmarts: 1,
  },
  warehouseLevel: 1,
  inventory: [
    {
      id: 'starter-item-1',
      name: 'Nvidia GeForce GTX 1060 6GB',
      category: 'gpus',
      condition: 'worn',
      baseValue: 7500,
      currentMarketValue: 7500,
      boughtPrice: 4200,
      weightKg: 0.9,
      description: 'Куплена у соседа по подъезду за бесценок. Термопаста суховата.',
      sellerNotes: 'Надо почистить перед продажей!',
      hiddenDefect: 'Высохла термопаста (нужно ТО)',
      isDefectDiscovered: true,
      isRestored: false,
      iconName: 'Cpu',
    },
    {
      id: 'starter-item-2',
      name: 'Паяльная станция термовоздушная Lukey 852D+',
      category: 'tools_equipment',
      condition: 'good',
      baseValue: 5500,
      currentMarketValue: 5500,
      boughtPrice: 2800,
      weightKg: 3.5,
      description: 'Твой рабочий инструмент или товар на продажу.',
      sellerNotes: 'Рабочая классика',
      hiddenDefect: null,
      isDefectDiscovered: true,
      isRestored: false,
      iconName: 'Wrench',
    }
  ],
  marketFeed: [],
  incomingOffers: [],
  auctionLots: [],
  trends: INITIAL_TRENDS,
  totalProfit: 0,
  dealsCount: 0,
  loans: [],
  currentGoalIndex: 0,
  specialization: 'all',
  passiveBusinesses: INITIAL_PASSIVE_BUSINESSES,
  character: {
    aura: 20,
    title: 'Начинающий Темщик с Гаражей',
    maxEnergy: 100,
    totalSpentOnFlex: 0,
    ownedCars: [],
    ownedProperties: [],
    purchasedItems: [],
  },
  auditRisk: 5,
  legalStatus: {
    isRegisteredSelfEmployed: false,
    isRegisteredCompany: false,
    hasTaxLawyer: false,
  },
  funUsesToday: 0,
  isBusinessTycoonCelebrated: false,
};
