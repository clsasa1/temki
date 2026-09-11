import { Item, Review } from '../types/game';

interface GenerateReviewParams {
  item: Item;
  finalPrice: number;
  npcName: string;
  npcPatience?: number;
  day: number;
}

export function generateCustomerReview({
  item,
  finalPrice,
  npcName,
  npcPatience,
  day,
}: GenerateReviewParams): Review {
  const fairMarket = item.currentMarketValue;
  const isOverpriced = finalPrice > fairMarket * 1.18;
  const isBrokePatience = npcPatience !== undefined && npcPatience < 30;
  const hasUnfixedDefect = Boolean(item.hiddenDefect && !item.isRestored);
  const isTrashCondition = item.condition === 'trash' && !item.isRestored;

  // Case 1: Sold defective goods (брак) -> 1 or 2 stars!
  if (hasUnfixedDefect) {
    const defect = item.hiddenDefect!;
    const stars = Math.random() < 0.7 ? 1 : 2;
    const angryReviews = [
      `Впарил откровенный брак! Скрыл дефект: «${defect}». На звонки не отвечает, сразу заблокировал. Чистый кидала!`,
      `Полный развод! Приехал домой, включил — а тут сюрприз: «${defect}». Не вздумайте у него ничего покупать!`,
      `Продавец нагло соврал на месте! Уверял что всё проверено, а дома вскрылся косяк: «${defect}». Пишу жалобу в поддержку!`,
      `Худший опыт на Авито. Продал сломанную вещь: «${defect}». За такое спросить надо! 1 звезда.`,
      `Брак без зазрения совести. В объявлении ни слова, а по факту «${defect}». Не связывайтесь с этим перекупом!`,
      `Еле довез до дома — не работает как надо. Скрыл: «${defect}». Скупой платит дважды, попался на уловку.`,
    ];
    return {
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      author: npcName,
      stars,
      text: angryReviews[Math.floor(Math.random() * angryReviews.length)],
      day,
    };
  }

  // Case 2: Excessive haggling, overpriced or squeezed buyer till 0 patience -> 2 or 3 stars
  if (isBrokePatience || isOverpriced) {
    const stars = Math.random() < 0.5 ? 2 : 3;
    const grumpyReviews = [
      `Товар забрал, но продавец невыносимо душный! За каждую сотку торговался полчаса, давил на жалость. Осадок остался.`,
      `Завысил цену в потолок! Сказки про очередь из 10 покупателей рассказывал. Вещь нормальная, но сервис отвратительный.`,
      `Очень тяжелый и жадный тип. Выжал максимум, ни рубля не уступил, общался сквозь зубы. 2 звезды за отношение к клиенту.`,
      `Торговался так агрессивно, будто я у него почку покупаю, а не вещь. Товар вроде рабочий, но больше к нему ни ногой.`,
      `Продавец наглый и упертый. Пришлось переплатить, потому что срочно было нужно. Культуры общения ноль.`,
    ];
    return {
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      author: npcName,
      stars,
      text: grumpyReviews[Math.floor(Math.random() * grumpyReviews.length)],
      day,
    };
  }

  // Case 3: Trash / beat-up condition sold without prep -> 2 or 3 stars
  if (isTrashCondition) {
    const stars = Math.random() < 0.6 ? 2 : 3;
    const wornReviews = [
      `Состояние — тихий ужас. На фото ракурс подобрал красиво, а вживую весь в царапинах и грязи. Чисто на запчасти.`,
      `Вещь повидала жизнь. Продавец мог хотя бы влажной салфеткой протереть перед продажей, вся в пыли и жирных пятнах.`,
      `Помойное состояние. Работает на честном слове, корпус скрипит. Красная цена этому хламу втрое ниже.`,
    ];
    return {
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      author: npcName,
      stars,
      text: wornReviews[Math.floor(Math.random() * wornReviews.length)],
      day,
    };
  }

  // Case 4: Item was properly restored / serviced -> solid 5 stars!
  if (item.isRestored) {
    const praiseReviews = [
      `Мастер с золотыми руками! Предпродажная подготовка 10 из 10: всё отмыто, обслужено, работает бесшумно. Респект!`,
      `Приятно удивлен качеством! Человек реально вложил душу и время: термопаста свежая, контакты почищены, упаковал на совесть.`,
      `Идеальное состояние! Редкий случай на Авито, когда продавец честный профи. Однозначно в избранное и 5 звезд!`,
      `Забрал, проверил — летает! Никакого перегрева, работает как швейцарские часы. Спасибо за отличную подготовку!`,
      `Супер продавец! Всё честно показал на видео перед встречей, упаковал в пупырку. Всем бы так продавать.`,
    ];
    return {
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      author: npcName,
      stars: 5,
      text: praiseReviews[Math.floor(Math.random() * praiseReviews.length)],
      day,
    };
  }

  // Case 5: Normal fair deal -> 4 or 5 stars
  const stars = Math.random() < 0.85 ? 5 : 4;
  const normalReviews = [
    `Всё четко, сделка состоялась быстро и без лишней возни. Рекомендую продавца!`,
    `Адекватный продавец, встретились вовремя, товар полностью соответствует описанию. 5 звезд!`,
    `Быстро договорились, сделал небольшую скидку на такси. Спасибо, покупкой доволен!`,
    `Товар в порядке, проверили на месте. Продавцу удачных продаж!`,
    `Честный продавец, приехал, забрал, всё работает без нареканий.`,
  ];
  return {
    id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    author: npcName,
    stars,
    text: normalReviews[Math.floor(Math.random() * normalReviews.length)],
    day,
  };
}
