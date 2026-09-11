import React from 'react';
import { 
  X, 
  Wrench, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  Wind, 
  ShieldCheck, 
  Layers,
  Zap
} from 'lucide-react';
import { Item, Skills } from '../types/game';
import { sounds } from '../utils/audio';

interface RestorationModalProps {
  item: Item;
  playerMoney: number;
  playerEnergy: number;
  skills: Skills;
  onClose: () => void;
  onRestoreSuccess: (updatedItem: Item, cost: number, energyUsed: number) => void;
}

export const RestorationModal: React.FC<RestorationModalProps> = ({
  item,
  playerMoney,
  playerEnergy,
  skills,
  onClose,
  onRestoreSuccess,
}) => {
  const restoBonus = (skills.restoration - 1) * 0.05; // up to +45% extra boost
  const costDiscount = (skills.restoration - 1) * 0.04;

  const getCategoryProcedures = () => {
    switch (item.category) {
      case 'clothes_fashion':
        return [
          {
            id: 'steam_clean',
            name: 'Химчистка, удаление катышков и отпаривание',
            desc: 'Удаляет запахи секонд-хенда и табака, расправляет ворс парогенератором. Вещь выглядит как новая с вешалки.',
            cost: Math.round(350 * (1 - costDiscount)),
            energy: 6,
            valueMultiplier: 1.15 + restoBonus,
            removesDefect: false,
            newCondition: item.condition === 'trash' ? 'worn' : item.condition === 'worn' ? 'good' : item.condition,
          },
          {
            id: 'hardware_repair',
            name: 'Ремонт фурнитуры: замена бегунка молнии и пуговиц',
            desc: 'Устраняет заедание замка, пришивает фирменные пуговицы, заменяет собачку молнии на надежную YKK.',
            cost: Math.round(750 * (1 - costDiscount)),
            energy: 12,
            valueMultiplier: 1.28 + restoBonus,
            removesDefect: true,
            newCondition: item.condition === 'trash' ? 'worn' : item.condition === 'worn' ? 'good' : item.condition,
          },
          {
            id: 'dwr_detailing',
            name: 'Ресейл-детейлинг: пропитка DWR и крафтовая упаковка',
            desc: 'Восстанавливает водоотталкивающий слой мембраны, оригинальные бирки и подарочный крафтовый пакет для покупателя.',
            cost: Math.round(1600 * (1 - costDiscount)),
            energy: 22,
            valueMultiplier: 1.45 + restoBonus,
            removesDefect: true,
            newCondition: 'mint' as Item['condition'],
          },
        ];

      case 'auto_parts':
        return [
          {
            id: 'chemical_wash',
            name: 'Мойка автохимией от битума и колодочной пыли',
            desc: 'Смывает реагенты, многолетний масляный налет и копоть. Глубокое чернение резины специальным составом.',
            cost: Math.round(400 * (1 - costDiscount)),
            energy: 8,
            valueMultiplier: 1.14 + restoBonus,
            removesDefect: false,
            newCondition: item.condition === 'trash' ? 'worn' : item.condition,
          },
          {
            id: 'studding_balance',
            name: 'Дошиповка ремонтными шипами и правка геометрии',
            desc: 'Устраняет биение на шиномонтажном станке, дошиповка выпавших шипов пневмопистолетом, точная балансировка.',
            cost: Math.round(1200 * (1 - costDiscount)),
            energy: 16,
            valueMultiplier: 1.30 + restoBonus,
            removesDefect: true,
            newCondition: item.condition === 'trash' ? 'worn' : item.condition === 'worn' ? 'good' : item.condition,
          },
          {
            id: 'powder_coating',
            name: 'Порошковая окраска в камере и алмазная проточка',
            desc: 'Идеальное зеркало полок диска, запекание порошкового полимера в печи, новые фирменные колпачки ступицы.',
            cost: Math.round(2800 * (1 - costDiscount)),
            energy: 25,
            valueMultiplier: 1.48 + restoBonus,
            removesDefect: true,
            newCondition: 'mint' as Item['condition'],
          },
        ];

      case 'smartphones':
        return [
          {
            id: 'speaker_clean',
            name: 'Ультразвуковая чистка сеток динамиков и разъема Type-C',
            desc: 'Выдувает спрессованную карманную пыль, звук становится громким и басовитым, провод не выпадает при зарядке.',
            cost: Math.round(300 * (1 - costDiscount)),
            energy: 5,
            valueMultiplier: 1.12 + restoBonus,
            removesDefect: false,
            newCondition: item.condition === 'trash' ? 'worn' : item.condition,
          },
          {
            id: 'battery_swap',
            name: 'Замена аккумулятора (100% ёмкость) и чистка от окислов',
            desc: 'Новая усиленная батарея, смартфон держит заряд 1.5 суток, не выключается на морозе. Устраняет скрытые сбои.',
            cost: Math.round(1100 * (1 - costDiscount)),
            energy: 14,
            valueMultiplier: 1.32 + restoBonus,
            removesDefect: true,
            newCondition: item.condition === 'trash' ? 'worn' : item.condition === 'worn' ? 'good' : item.condition,
          },
          {
            id: 'screen_polish',
            name: 'Полировка дисплея пастой ГОИ, гидрогель и новый чехол',
            desc: 'Удаляет паутинку микроцарапин, наносит олеофобное покрытие, свежая защитная бронепленка и презентабельный вид.',
            cost: Math.round(2200 * (1 - costDiscount)),
            energy: 24,
            valueMultiplier: 1.44 + restoBonus,
            removesDefect: true,
            newCondition: 'mint' as Item['condition'],
          },
        ];

      case 'appliances':
        return [
          {
            id: 'decalc_clean',
            name: 'Декальцинация гидросистемы и ультразвук фильтров',
            desc: 'Растворяет известковую накипь, смывает застарелые кофейные масла и жировой налет спецхимией.',
            cost: Math.round(350 * (1 - costDiscount)),
            energy: 7,
            valueMultiplier: 1.14 + restoBonus,
            removesDefect: false,
            newCondition: item.condition === 'trash' ? 'worn' : item.condition,
          },
          {
            id: 'pump_motor_fix',
            name: 'Замена помпы, шестерен редуктора или щеток мотора',
            desc: 'Устраняет посторонний скрежет, течи клапанов и перегрев. Восстанавливает паспортное давление и мощность.',
            cost: Math.round(1300 * (1 - costDiscount)),
            energy: 15,
            valueMultiplier: 1.30 + restoBonus,
            removesDefect: true,
            newCondition: item.condition === 'trash' ? 'worn' : item.condition === 'worn' ? 'good' : item.condition,
          },
          {
            id: 'appliance_master_service',
            name: 'Капитальное ТО: замена всех сальников и полировка корпуса',
            desc: 'Полная переборка уплотнительных колец с пищевой смазкой, удаление царапин на пластике, вид витринного образца.',
            cost: Math.round(2500 * (1 - costDiscount)),
            energy: 25,
            valueMultiplier: 1.46 + restoBonus,
            removesDefect: true,
            newCondition: 'good' as Item['condition'],
          },
        ];

      case 'computers':
        return [
          {
            id: 'pc_dust_clean',
            name: 'Очистка радиаторов от войлока пыли и смазка кулеров',
            desc: 'Удаляет валенок пыли из ребер охлаждения, смазка подшипников вентиляторов синтетическим маслом. Работает шепотом.',
            cost: Math.round(300 * (1 - costDiscount)),
            energy: 6,
            valueMultiplier: 1.12 + restoBonus,
            removesDefect: false,
            newCondition: item.condition === 'trash' ? 'worn' : item.condition,
          },
          {
            id: 'pc_paste_tune',
            name: 'Замена термоинтерфейса CPU и стресс-тест в AIDA64',
            desc: 'Нанесение термопасты премиум-класса, перенастройка кривой оборотов кулера в BIOS, стабильная работа без троттлинга.',
            cost: Math.round(850 * (1 - costDiscount)),
            energy: 14,
            valueMultiplier: 1.28 + restoBonus,
            removesDefect: true,
            newCondition: item.condition === 'trash' ? 'worn' : item.condition === 'worn' ? 'good' : item.condition,
          },
          {
            id: 'pc_mod_upgrade',
            name: 'Кабель-менеджмент, чистая система и оптимизация автозагрузки',
            desc: 'Красивая укладка шлейфов стяжками, оптимизированная сборка Windows, старт за 8 секунд. Товарный вид для быстрой продажи.',
            cost: Math.round(1900 * (1 - costDiscount)),
            energy: 24,
            valueMultiplier: 1.42 + restoBonus,
            removesDefect: true,
            newCondition: 'good' as Item['condition'],
          },
        ];

      case 'tools_equipment':
        return [
          {
            id: 'gear_wash',
            name: 'Промывка керосином и замена смазки в редукторе',
            desc: 'Вымывает абразивную строительную пыль и металлическую стружку, свежая синяя смазка обеспечивает плавный ход.',
            cost: Math.round(350 * (1 - costDiscount)),
            energy: 7,
            valueMultiplier: 1.13 + restoBonus,
            removesDefect: false,
            newCondition: item.condition === 'trash' ? 'worn' : item.condition,
          },
          {
            id: 'brushes_cable_swap',
            name: 'Замена угольных щеток и морозостойкого сетевого кабеля',
            desc: 'Устраняет искрение якоря двигателя, замена перебитого провода на надежный каучуковый 3-метровый кабель КГ-ХЛ.',
            cost: Math.round(900 * (1 - costDiscount)),
            energy: 15,
            valueMultiplier: 1.30 + restoBonus,
            removesDefect: true,
            newCondition: item.condition === 'trash' ? 'worn' : item.condition === 'worn' ? 'good' : item.condition,
          },
          {
            id: 'gauge_calibration',
            name: 'Точная калибровка по эталонам и комплектный кейс',
            desc: 'Юстировка оптических или измерительных узлов, укладка в оригинальный пластиковый кейс с полным комплектом оснастки.',
            cost: Math.round(2100 * (1 - costDiscount)),
            energy: 23,
            valueMultiplier: 1.45 + restoBonus,
            removesDefect: true,
            newCondition: 'good' as Item['condition'],
          },
        ];

      case 'audio_retro':
        return [
          {
            id: 'potentiometer_spray',
            name: 'Промывка потенциометров спреем Kontakt 60',
            desc: 'Устраняет хрип, шуршание и треск регуляторов громкости и баланса. Контакты очищены от окислов.',
            cost: Math.round(350 * (1 - costDiscount)),
            energy: 6,
            valueMultiplier: 1.14 + restoBonus,
            removesDefect: false,
            newCondition: item.condition === 'trash' ? 'worn' : item.condition,
          },
          {
            id: 'belt_caps_recapping',
            name: 'Замена растянутых пассиков и высохших электролитов',
            desc: 'Новые силиконовые пассики восстанавливают точную скорость вращения, замена конденсаторов возвращает сочный бас без гула.',
            cost: Math.round(1100 * (1 - costDiscount)),
            energy: 15,
            valueMultiplier: 1.32 + restoBonus,
            removesDefect: true,
            newCondition: item.condition === 'trash' ? 'worn' : item.condition === 'worn' ? 'good' : item.condition,
          },
          {
            id: 'wood_polish_cover',
            name: 'Реставрация шпона тиковым маслом и полировка крышки',
            desc: 'Устраняет сколы и царапины на деревянном кабинете, оргстекло крышки проигрывателя становится кристально прозрачным.',
            cost: Math.round(2300 * (1 - costDiscount)),
            energy: 24,
            valueMultiplier: 1.46 + restoBonus,
            removesDefect: true,
            newCondition: 'mint' as Item['condition'],
          },
        ];

      case 'wholesale_junk':
        return [
          {
            id: 'sorting_junk',
            name: 'Сортировка партии и удаление битого неликвида',
            desc: 'Отделение рабочих позиций от хлама, очистка упаковок от скотча и пыли. Товар готов к поштучной продаже.',
            cost: Math.round(250 * (1 - costDiscount)),
            energy: 6,
            valueMultiplier: 1.15 + restoBonus,
            removesDefect: false,
            newCondition: item.condition === 'trash' ? 'worn' : item.condition,
          },
          {
            id: 'bundle_repair',
            name: 'Мелкий узловой ремонт и доукомплектация проводами',
            desc: 'Перепайка разъемов, подбор недостающих блоков питания и шнуров из запасов. Полная работоспособность.',
            cost: Math.round(800 * (1 - costDiscount)),
            energy: 14,
            valueMultiplier: 1.30 + restoBonus,
            removesDefect: true,
            newCondition: item.condition === 'trash' ? 'worn' : item.condition === 'worn' ? 'good' : item.condition,
          },
          {
            id: 'craft_packaging',
            name: 'Индивидуальная фасовка в крафтовые коробки с артикулом',
            desc: 'Аккуратная фасовка в коробки с пупырчатой пленкой, маркировка артикулами. Вид как с профессионального склада.',
            cost: Math.round(1700 * (1 - costDiscount)),
            energy: 22,
            valueMultiplier: 1.44 + restoBonus,
            removesDefect: true,
            newCondition: 'good' as Item['condition'],
          },
        ];

      case 'cars_flipping':
        return [
          {
            id: 'car_detailing',
            name: 'Трехфазная мойка, полировка фар и химчистка салона',
            desc: 'Смывает битум, убирает желтизну оптики, ароматизирует салон дорогим парфюмом. Машина блестит в потоке.',
            cost: Math.round(item.baseValue * 0.03 * (1 - costDiscount)),
            energy: 15,
            valueMultiplier: 1.15 + restoBonus,
            removesDefect: false,
            newCondition: item.condition === 'trash' ? 'worn' : item.condition === 'worn' ? 'good' : item.condition,
          },
          {
            id: 'car_service_repair',
            name: 'Устранение дефектов по мотору/ходовой и замена расходников',
            desc: 'Устраняет стуки подвески, меняет свечи, прокладки и техжидкости. Чек не горит, мотор шепчет.',
            cost: Math.round(item.baseValue * 0.08 * (1 - costDiscount)),
            energy: 25,
            valueMultiplier: 1.32 + restoBonus,
            removesDefect: true,
            newCondition: item.condition === 'trash' ? 'worn' : item.condition === 'worn' ? 'good' : item.condition,
          },
          {
            id: 'car_full_prep',
            name: 'Комплексная предпродажка: удаление вмятин PDR и детейлинг',
            desc: 'Кузов выведен в идеал, керамика в 2 слоя, подкрас сколов в цвет, чистый пакет документов. Пушка-гонка!',
            cost: Math.round(item.baseValue * 0.15 * (1 - costDiscount)),
            energy: 35,
            valueMultiplier: 1.50 + restoBonus,
            removesDefect: true,
            newCondition: 'mint' as Item['condition'],
          },
        ];

      case 'real_estate':
        return [
          {
            id: 'staging_clean',
            name: 'Генеральный клининг, вывоз старого хлама и хоумстейджинг',
            desc: 'Вынос рухляди, мойка окон, ароматизация кофе и правильный свет для фотографий на продажу.',
            cost: Math.round(item.baseValue * 0.02 * (1 - costDiscount)),
            energy: 18,
            valueMultiplier: 1.12 + restoBonus,
            removesDefect: false,
            newCondition: item.condition === 'trash' ? 'worn' : item.condition === 'worn' ? 'good' : item.condition,
          },
          {
            id: 'cosmetic_renovation',
            name: 'Быстрый косметический евроремонт под ключ',
            desc: 'Светлые нейтральные обои, влагостойкий ламинат, натяжные потолки со спотами и новая сантехника.',
            cost: Math.round(item.baseValue * 0.06 * (1 - costDiscount)),
            energy: 30,
            valueMultiplier: 1.28 + restoBonus,
            removesDefect: true,
            newCondition: item.condition === 'trash' ? 'worn' : item.condition === 'worn' ? 'good' : item.condition,
          },
          {
            id: 'legal_clearance',
            name: 'Юридическая очистка, снятие обременений приставов и VIP-упаковка',
            desc: 'Снятие всех судебных арестов, ускоренная регистрация в Росреестре, технический паспорт и юридическая чистота.',
            cost: Math.round(item.baseValue * 0.10 * (1 - costDiscount)),
            energy: 40,
            valueMultiplier: 1.45 + restoBonus,
            removesDefect: true,
            newCondition: 'mint' as Item['condition'],
          },
        ];

      case 'gpus':
      default:
        return [
          {
            id: 'cleaning',
            name: 'Продувка компрессором и мойка спиртом платы',
            desc: 'Удаляет вековую пыль и подтеки силикона от старых термопрокладок. Плата и радиатор блестят чистотой.',
            cost: Math.round(250 * (1 - costDiscount)),
            energy: 5,
            valueMultiplier: 1.12 + restoBonus,
            removesDefect: false,
            newCondition: item.condition === 'trash' ? 'worn' : item.condition,
          },
          {
            id: 'thermal_paste',
            name: 'Замена термопасты (Honeywell PTM7950) и термопрокладок',
            desc: 'Снижает температуры хотспота на 20 градусов, убирает шум кулера и вой турбины под нагрузкой.',
            cost: Math.round(650 * (1 - costDiscount)),
            energy: 12,
            valueMultiplier: 1.25 + restoBonus,
            removesDefect: true,
            newCondition: item.condition === 'trash' ? 'worn' : item.condition === 'worn' ? 'good' : item.condition,
          },
          {
            id: 'full_overhaul',
            name: 'Полная предпродажная подготовка и прошивка заводского BIOS',
            desc: 'Глубокая очистка ультразвуком, устранение артефактов и прошивка стабильного стокового BIOS. Стресс-тест 100%.',
            cost: Math.round(1800 * (1 - costDiscount)),
            energy: 25,
            valueMultiplier: 1.40 + restoBonus,
            removesDefect: true,
            newCondition: 'good' as Item['condition'],
          },
        ];
    }
  };

  const procedures = getCategoryProcedures();

  const handleApplyProcedure = (proc: typeof procedures[0]) => {
    if (playerMoney < proc.cost) {
      alert('Недостаточно денег на материалы и расходники!');
      return;
    }
    if (playerEnergy < proc.energy) {
      alert('Вы слишком устали! Ложитесь спать или отдохните.');
      return;
    }

    sounds.playSuccess();

    const updatedValue = Math.round((item.currentMarketValue * proc.valueMultiplier) / 100) * 100;
    const updatedItem: Item = {
      ...item,
      currentMarketValue: updatedValue,
      condition: proc.newCondition,
      hiddenDefect: proc.removesDefect ? null : item.hiddenDefect,
      isRestored: true,
    };

    onRestoreSuccess(updatedItem, proc.cost, proc.energy);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-neutral-800/90 border-b border-neutral-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-white text-base sm:text-lg">
                Предпродажная подготовка и ТО
              </h3>
              <p className="text-xs text-neutral-400">
                Обслужите вещь перед продажей, чтобы поднять её цену и авторитет на Авито.
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

        {/* Item Info Box */}
        <div className="p-4 bg-neutral-950 border-b border-neutral-800">
          <h4 className="font-bold text-white text-sm">{item.name}</h4>
          <div className="flex items-center justify-between text-xs text-neutral-400 mt-1">
            <span>Текущая стоимость: <strong className="text-amber-400 font-mono">~{item.currentMarketValue.toLocaleString('ru-RU')} ₽</strong></span>
            <span>Дефект: <strong className={item.hiddenDefect ? 'text-rose-400' : 'text-emerald-400'}>{item.hiddenDefect || 'Нет'}</strong></span>
          </div>
        </div>

        {/* Procedures */}
        <div className="p-4 space-y-3 bg-neutral-900">
          {procedures.map((proc) => {
            const canAfford = playerMoney >= proc.cost && playerEnergy >= proc.energy;
            const previewNewValue = Math.round((item.currentMarketValue * proc.valueMultiplier) / 100) * 100;
            const diff = previewNewValue - item.currentMarketValue;

            return (
              <div
                key={proc.id}
                className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex-1">
                  <h5 className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    {proc.name}
                  </h5>
                  <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                    {proc.desc}
                  </p>
                  <div className="flex items-center gap-3 text-xs font-mono mt-1.5">
                    <span className="text-emerald-400 font-bold">
                      Новая цена: ~{previewNewValue.toLocaleString('ru-RU')} ₽ (+{diff.toLocaleString('ru-RU')} ₽)
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1">
                  <button
                    onClick={() => handleApplyProcedure(proc)}
                    disabled={!canAfford}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                      canAfford
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-md'
                        : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                    }`}
                  >
                    <span>Выполнить</span>
                    <span className="font-mono bg-neutral-950/30 px-1.5 py-0.5 rounded text-[11px]">
                      {proc.cost} ₽
                    </span>
                  </button>
                  <span className="text-[10px] text-neutral-500 flex items-center gap-1 font-mono">
                    Тратит: <Zap className="w-3 h-3 text-amber-400" /> {proc.energy}% энергии
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
