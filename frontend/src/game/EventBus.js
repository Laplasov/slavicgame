/**
 * Простая шина событий (publish/subscribe).
 * Нужна, потому что React-компоненты и Phaser-сцена живут в разных мирах:
 * React не может дёргать методы сцены напрямую, а Phaser не знает про React.
 * Оба слоя импортируют ОДИН экземпляр `eventBus` и общаются через него.
 */
export class EventBus {
  constructor() {
    // Map<имяСобытия, Set<функция-обработчик>>
    this._listeners = new Map();
  }

  /** Подписаться на событие. Возвращает функцию отписки. */
  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  /** Отписаться от события. */
  off(event, callback) {
    const set = this._listeners.get(event);
    if (!set) return;
    set.delete(callback);
    if (set.size === 0) this._listeners.delete(event);
  }

  /** Разослать событие всем подписчикам. */
  emit(event, payload) {
    const set = this._listeners.get(event);
    if (!set) return;
    // Копируем Set, чтобы отписка внутри обработчика не сломала итерацию
    for (const callback of Array.from(set)) {
      callback(payload);
    }
  }

  /** Полная очистка (используется при уничтожении сцены). */
  clear() {
    this._listeners.clear();
  }
}

// Единственный экземпляр на всё приложение.
export const eventBus = new EventBus();
