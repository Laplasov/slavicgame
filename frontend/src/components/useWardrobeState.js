import { useSyncExternalStore } from 'react';
import { wardrobeStore } from '../game/wardrobe/WardrobeStore.js';

/**
 * Хук-обёртка над WardrobeStore.
 *
 * Это НЕ класс, а вспомогательный хук, чтобы WardrobeButton и WardrobePanel
 * не дублировали код подписки. Возвращает объект состояния гардероба:
 *   { isOpen, hearts, layoutMode, slots }
 */
export function useWardrobeState() {
  return useSyncExternalStore(
    (onChange) => wardrobeStore.subscribe(onChange),
    () => wardrobeStore.getState(),
    () => wardrobeStore.getState(),
  );
}
