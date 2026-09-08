import { wardrobeStore } from '../game/wardrobe/WardrobeStore.js';
import { useWardrobeState } from './useWardrobeState.js';

/**
 * Кнопка «Гардероб» — единственный способ открыть панель.
 * Живёт в DOM поверх canvas (z-index 20), поэтому не зависит от Phaser.
 * Пока панель открыта — кнопка скрывается.
 */
export default function WardrobeButton() {
  const { isOpen } = useWardrobeState();

  if (isOpen) return null;

  return (
    <button
      type="button"
      className="wardrobe-button"
      onClick={() => wardrobeStore.open()}
    >
      Гардероб
    </button>
  );
}
