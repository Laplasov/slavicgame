/**
 * Карточка предмета в вертикальном списке панели.
 * Формат строки: иконка слева, название и бонусы в центре, цена или статус справа.
 *
 * Состояния:
 *   --locked   : не куплен (иконка слегка обесцвечена)
 *   --owned    : куплен, но не надет (зелёная рамка)
 *   --equipped : надет сейчас (жёлтая рамка + свечение)
 *   :disabled  : не куплен и сердец не хватает (полностью серый, не кликается)
 */
export default function WardrobeItemCard({ item, hearts, onSelect }) {
  const canAfford = item.isPurchased || hearts >= item.cost;

  let modifier = 'wardrobe-card--locked';
  if (item.isEquipped) modifier = 'wardrobe-card--equipped';
  else if (item.isPurchased) modifier = 'wardrobe-card--owned';

  return (
    <button
      type="button"
      className={`wardrobe-card ${modifier}`}
      disabled={!canAfford}
      onClick={() => onSelect(item.id)}
    >
      <span className="wardrobe-card__icon-wrap">
        <img className="wardrobe-card__icon" src={item.iconUrl} alt="" draggable="false" />
      </span>

      <span className="wardrobe-card__info">
        <span className="wardrobe-card__name">{item.name}</span>
        <span className="wardrobe-card__bonus">{item.bonusText}</span>
      </span>

      <span className="wardrobe-card__right">
        {item.isPurchased ? (
          <span className="wardrobe-card__state">
            {item.isEquipped ? 'Надето' : 'Куплено'}
          </span>
        ) : (
          <span className="wardrobe-card__price">
            <img src="/assets/UI/HeartIcon.png" alt="" draggable="false" />
            {item.cost}
          </span>
        )}
      </span>
    </button>
  );
}
