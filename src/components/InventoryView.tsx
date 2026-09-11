import React, { useState } from 'react';
import { 
  Package, 
  Weight, 
  Wrench, 
  ArrowUpRight, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Tag, 
  DollarSign, 
  Warehouse, 
  Sparkles,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { Item, WarehouseLevel } from '../types/game';
import { WAREHOUSE_LEVELS } from '../data/initialData';
import { sounds } from '../utils/audio';

interface InventoryViewProps {
  inventory: Item[];
  warehouse: WarehouseLevel;
  totalWeight: number;
  playerMoney: number;
  onUpgradeWarehouse: () => void;
  onListItemForSale: (item: Item, price: number) => void;
  onUnlistItem: (itemId: string) => void;
  onOpenRestoration: (item: Item) => void;
  onQuickScrapSell: (item: Item) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  warehouse,
  totalWeight,
  playerMoney,
  onUpgradeWarehouse,
  onListItemForSale,
  onUnlistItem,
  onOpenRestoration,
  onQuickScrapSell,
}) => {
  const [listingModalItem, setListingModalItem] = useState<Item | null>(null);
  const [listingPriceInput, setListingPriceInput] = useState<string>('');

  const nextWarehouse = WAREHOUSE_LEVELS.find((w) => w.level === warehouse.level + 1);
  const isWeightOverloaded = totalWeight > warehouse.maxWeightKg;
  const isSlotsFull = inventory.length >= warehouse.maxSlots;

  const handleOpenListingModal = (item: Item) => {
    setListingModalItem(item);
    // Suggest market value + 10%
    const suggested = Math.round((item.currentMarketValue * 1.1) / 100) * 100;
    setListingPriceInput(suggested.toString());
  };

  const handleConfirmListing = () => {
    if (!listingModalItem) return;
    const price = parseInt(listingPriceInput.replace(/\D/g, ''), 10);
    if (isNaN(price) || price <= 0) {
      alert('Укажите корректную цену продажи!');
      return;
    }
    sounds.playPing();
    onListItemForSale(listingModalItem, price);
    setListingModalItem(null);
  };

  return (
    <div className="space-y-4">
      {/* Warehouse Status & Upgrade Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0 shadow-inner">
              <Warehouse className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  {warehouse.name}
                </h2>
                <span className="text-[10px] bg-neutral-800 text-sky-400 border border-neutral-700 px-2 py-0.5 rounded-full font-bold">
                  Уровень {warehouse.level}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                {warehouse.description}
              </p>
            </div>
          </div>

          {/* Upgrade Button */}
          {nextWarehouse && (
            <button
              onClick={() => {
                if (playerMoney >= nextWarehouse.upgradeCost) {
                  sounds.playSuccess();
                  onUpgradeWarehouse();
                } else {
                  sounds.playFail();
                  alert(`Недостаточно средств для улучшения склада! Нужно ${nextWarehouse.upgradeCost.toLocaleString('ru-RU')} ₽`);
                }
              }}
              disabled={playerMoney < nextWarehouse.upgradeCost}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                playerMoney >= nextWarehouse.upgradeCost
                  ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black'
                  : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
              }`}
            >
              <span>Улучшить до «{nextWarehouse.name}»</span>
              <span className="font-mono bg-neutral-900/40 px-2 py-0.5 rounded">
                {nextWarehouse.upgradeCost.toLocaleString('ru-RU')} ₽
              </span>
            </button>
          )}
        </div>

        {/* Meters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Weight progress */}
          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 flex items-center gap-1.5 font-medium">
                <Weight className="w-3.5 h-3.5 text-sky-400" />
                Вес имущества:
              </span>
              <span className={`font-mono font-bold ${isWeightOverloaded ? 'text-rose-400 animate-pulse' : 'text-neutral-200'}`}>
                {totalWeight.toFixed(1)} / {warehouse.maxWeightKg} кг
              </span>
            </div>
            <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isWeightOverloaded ? 'bg-rose-500' : 'bg-sky-500'
                }`}
                style={{ width: `${Math.min(100, (totalWeight / warehouse.maxWeightKg) * 100)}%` }}
              />
            </div>
          </div>

          {/* Slots progress */}
          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 flex items-center gap-1.5 font-medium">
                <Package className="w-3.5 h-3.5 text-amber-400" />
                Занято слотов:
              </span>
              <span className={`font-mono font-bold ${isSlotsFull ? 'text-rose-400 animate-pulse' : 'text-neutral-200'}`}>
                {inventory.length} / {warehouse.maxSlots} шт.
              </span>
            </div>
            <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isSlotsFull ? 'bg-rose-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, (inventory.length / warehouse.maxSlots) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {warehouse.rentPerDay > 0 && (
          <p className="text-[11px] text-neutral-400 italic">
            💡 Аренда помещения: <span className="text-rose-400 font-mono font-semibold">{warehouse.rentPerDay} ₽ / день</span> (списывается каждую ночь при смене дня).
          </p>
        )}
      </div>

      {/* Inventory Items Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Товары на складе ({inventory.length})
          </h3>
          <span className="text-xs text-neutral-500">
            Общая рыночная стоимость: ~{inventory.reduce((acc, it) => acc + it.currentMarketValue, 0).toLocaleString('ru-RU')} ₽
          </span>
        </div>

        {inventory.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center text-neutral-400">
            <Package className="w-12 h-12 mx-auto text-neutral-600 mb-3" />
            <p className="text-base font-semibold text-neutral-300 mb-1">Склад пуст</p>
            <p className="text-xs text-neutral-500">
              Купите что-нибудь на Авито или выиграйте партию на банкротных торгах!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {inventory.map((item) => {
              const boughtPrice = item.boughtPrice || 0;
              const potentialProfit = item.currentMarketValue - boughtPrice;

              return (
                <div
                  key={item.id}
                  className={`bg-neutral-900 border rounded-2xl p-4 shadow-sm flex flex-col justify-between transition ${
                    item.isListed 
                      ? 'border-amber-500/60 ring-1 ring-amber-500/20' 
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-bold text-white text-sm sm:text-base leading-snug">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                            {item.condition === 'mint' ? 'Идеал' : item.condition === 'good' ? 'Рабочий' : item.condition === 'worn' ? 'Потертый' : 'Труп/Лом'}
                          </span>
                          <span className="text-[11px] text-neutral-400 font-mono flex items-center gap-1">
                            <Weight className="w-3 h-3 text-neutral-500" />
                            {item.weightKg} кг
                          </span>
                          {item.isRestored && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-emerald-400" />
                              Обслужен
                            </span>
                          )}
                        </div>
                      </div>

                      {item.isListed && (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold px-2 py-1 rounded-lg">
                          На Авито: {item.listedPrice?.toLocaleString('ru-RU')} ₽
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-400 line-clamp-2 mb-2 italic">
                      «{item.description}»
                    </p>

                    {/* Defect banner */}
                    {item.hiddenDefect && (
                      <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                        <span>Дефект: {item.hiddenDefect}</span>
                      </div>
                    )}
                  </div>

                  {/* Financial Details & Actions */}
                  <div className="pt-3 border-t border-neutral-800/80 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-neutral-500 uppercase block">Куплен за</span>
                        <span className="font-mono font-bold text-neutral-300">
                          {boughtPrice.toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-neutral-500 uppercase block">Рыночная цена</span>
                        <span className="font-mono font-extrabold text-amber-400">
                          ~{item.currentMarketValue.toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                    </div>

                    {/* Button actions */}
                    <div className="grid grid-cols-3 gap-2">
                      {item.isListed ? (
                        <button
                          onClick={() => onUnlistItem(item.id)}
                          className="col-span-1 px-2 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs rounded-xl border border-neutral-700 transition"
                        >
                          Снять с продажи
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenListingModal(item)}
                          className="col-span-1 px-2 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                        >
                          <Tag className="w-3.5 h-3.5" />
                          <span>Продать</span>
                        </button>
                      )}

                      {/* Repair / Maintenance button */}
                      <button
                        onClick={() => onOpenRestoration(item)}
                        className="col-span-1 px-2 py-2 bg-neutral-800 hover:bg-neutral-700 text-sky-400 font-semibold text-xs rounded-xl border border-neutral-700 transition flex items-center justify-center gap-1 cursor-pointer"
                        title="Предпродажная подготовка: чистка, термопаста, полировка"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Обслужить</span>
                      </button>

                      {/* Quick Scrap Sell */}
                      <button
                        onClick={() => {
                          if (confirm(`Сдать «${item.name}» скупщику на лом за ${Math.round(item.currentMarketValue * 0.55).toLocaleString('ru-RU')} ₽?`)) {
                            sounds.playCash();
                            onQuickScrapSell(item);
                          }
                        }}
                        className="col-span-1 px-2 py-2 bg-neutral-800 hover:bg-rose-950/40 hover:border-rose-700 text-rose-400 font-semibold text-xs rounded-xl border border-neutral-700 transition flex items-center justify-center gap-1 cursor-pointer"
                        title="Срочный выкуп скупщику по 55% от рынка (освободить склад)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Сдать в лом</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Listing Modal */}
      {listingModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-neutral-700 w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-400" />
              Выставить товар на Авито
            </h3>

            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
              <p className="font-bold text-white text-sm">{listingModalItem.name}</p>
              <div className="flex items-center justify-between text-xs text-neutral-400 mt-1">
                <span>Рыночная цена сейчас:</span>
                <span className="text-amber-400 font-mono font-bold">~{listingModalItem.currentMarketValue.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Ваша цена продажи (₽):
              </label>
              <input
                type="number"
                value={listingPriceInput}
                onChange={(e) => setListingPriceInput(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2.5 text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Если поставить цену выше рынка, покупатели будут дольше откликаться или сбивать цену в чате.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setListingModalItem(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl border border-neutral-700 transition"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmListing}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black rounded-xl transition shadow-md cursor-pointer"
              >
                Опубликовать объявление
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
