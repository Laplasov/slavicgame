/**
 * Сейв игрока в памяти (источник правды - сервер, SQLite).
 * Конструктор принимает payload с сервера: /api/save/.
 * Никакого localStorage: прогресс привязан к аккаунту.
 */
export class SaveManager {
  constructor(payload = {}) {
    this._purchasedIds = new Set(payload.purchased_ids || []);
    this._totalHearts = Number(payload.hearts) || 0;
    this._equippedIds = { ...(payload.equipped || {}) };
    this.totalClicks = Number(payload.total_clicks) || 0;
    this.totalHeartsCollected = Number(payload.total_hearts_collected) || 0;
  }

  get loadedTotalHearts() {
    return this._totalHearts;
  }

  isPurchased(itemId) {
    return this._purchasedIds.has(itemId);
  }

  markPurchased(itemId) {
    this._purchasedIds.add(itemId);
  }

  saveScore(totalHearts) {
    this._totalHearts = Math.max(0, Math.floor(totalHearts));
  }

  getEquippedItemId(slot) {
    return Object.prototype.hasOwnProperty.call(this._equippedIds, slot)
      ? this._equippedIds[slot]
      : null;
  }

  markEquipped(slot, itemId) {
    this._equippedIds[slot] = itemId;
  }

  purchasedIdsList() {
    return Array.from(this._purchasedIds);
  }

  equippedMap() {
    return { ...this._equippedIds };
  }

  clear() {
    this._purchasedIds.clear();
    this._totalHearts = 0;
    this._equippedIds = {};
    this.totalClicks = 0;
    this.totalHeartsCollected = 0;
  }
}
