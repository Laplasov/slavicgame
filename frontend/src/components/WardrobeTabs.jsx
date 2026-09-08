/**
 * strip Row of 4 tabs: Чайник / Топ / Низ / Колготочки.
 * Показывает название вкладки и количество предметов в ней.
 *
 * @param {Array}  slots      - [{ slot, label, items }]
 * @param {string} activeSlot - активная вкладка
 * @param {Function} onSelect - callback(slot)
 */
export default function WardrobeTabs({ slots, activeSlot, onSelect }) {
  return (
    <div className="wardrobe-tabs" role="tablist">
      {slots.map((entry) => {
        const isActive = entry.slot === activeSlot;
        return (
          <button
            key={entry.slot}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={isActive ? 'wardrobe-tab wardrobe-tab--active' : 'wardrobe-tab'}
            onClick={() => onSelect(entry.slot)}
          >
            <span className="wardrobe-tab__label">{entry.label}</span>
            <span className="wardrobe-tab__count">{entry.items.length}</span>
          </button>
        );
      })}
    </div>
  );
}
