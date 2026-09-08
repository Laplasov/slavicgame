import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { GameScene } from './scenes/GameScene.js';
import { getDpr } from './config.js';

/**
 * Фабрика игры. Создаёт Phaser.Game и кладёт серверный сейв в registry,
 * откуда GameScene заберёт его при создании.
 */
export function startGame(parentElement, savePayload) {
  const dpr = getDpr();

  const contentSize = () => {
    const cs = window.getComputedStyle(parentElement);
    const w = parentElement.clientWidth
      - parseFloat(cs.paddingLeft || '0')
      - parseFloat(cs.paddingRight || '0');
    const h = parentElement.clientHeight
      - parseFloat(cs.paddingTop || '0')
      - parseFloat(cs.paddingBottom || '0');
    return { w: Math.max(1, w), h: Math.max(1, h) };
  };

  const start = contentSize();

  const game = new Phaser.Game({
    type: Phaser.CANVAS,
    parent: parentElement,
    backgroundColor: '#000000',
    width: Math.floor(start.w * dpr),
    height: Math.floor(start.h * dpr),
    scale: {
      mode: Phaser.Scale.NONE,
    },
    input: {
      activePointers: 3,
    },
    audio: {
      noAudio: true,
    },
    scene: [BootScene, GameScene],
  });

  // Серверный сейв передаём сцене через registry
  game.registry.set('savePayload', savePayload || {});

  const applyDisplaySize = () => {
    const { w, h } = contentSize();
    game.canvas.style.width = `${w}px`;
    game.canvas.style.height = `${h}px`;
  };

  const applyResize = () => {
    const { w, h } = contentSize();
    game.scale.resize(Math.floor(w * dpr), Math.floor(h * dpr));
    applyDisplaySize();
  };

  applyDisplaySize();
  window.addEventListener('resize', applyResize);
  window.addEventListener('orientationchange', applyResize);
  game.events.once('destroy', () => {
    window.removeEventListener('resize', applyResize);
    window.removeEventListener('orientationchange', applyResize);
  });

  return game;
}
