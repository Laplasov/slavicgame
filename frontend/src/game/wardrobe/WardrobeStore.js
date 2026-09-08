import { eventBus } from '../EventBus.js';
import { WardrobeEvents } from '../WardrobeEvents.js';

/** Стартовое состояние, пока Phaser ещё ничего не прислал. */
const INITIAL_STATE = Object.freeze({
  isOpen: false,
  hearts: 0,
  layoutMode: 'landscape',
  stats: { click: 0, crit: 0, passive: 0, limit: 0 },
  playerStats: { totalClicks: 0, totalHeartsCollected: 0 },
  slots: [],
});

/**
 * Хранилище состояния гардероба для React.
 * Подписано на шину событий, хранит последний снимок состояния.
 * React читает его через useSyncExternalStore (см. useWardrobeState.js).
 */
export class WardrobeStore {
  constructor() {
    this._state = INITIAL_STATE;
    this._listeners = new Set();

    this._handleState = (patch) => this._apply(patch);
    this._handleHearts = (hearts) => this._apply({ hearts });

    eventBus.on(WardrobeEvents.STATE, this._handleState);
    eventBus.on(WardrobeEvents.HEARTS, this._handleHearts);
  }

  getState() {
    return this._state;
  }

  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  getSnapshot() {
    return new Promise((resolve) => {
      const off = eventBus.on('save:snapshot:data', (data) => {
        off();
        resolve(data);
      });
      eventBus.emit('save:snapshot');
      window.setTimeout(() => {
        off();
        resolve(null);
      }, 1000);
    });
  }

  open() {
    eventBus.emit(WardrobeEvents.OPEN);
  }

  close() {
    eventBus.emit(WardrobeEvents.CLOSE);
  }

  select(itemId) {
    eventBus.emit(WardrobeEvents.SELECT, itemId);
  }

  _apply(patch) {
    if (!patch) return;
    this._state = { ...this._state, ...patch };
    for (const listener of Array.from(this._listeners)) {
      listener();
    }
  }
}

export const wardrobeStore = new WardrobeStore();
