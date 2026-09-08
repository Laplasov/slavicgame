import Phaser from "phaser";
import { ASSETS, PLACEHOLDER_COLORS, FONT_FAMILY } from '../config.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
    this._failedKeys = new Set();
  }

    preload() {
    for (const [key, def] of Object.entries(ASSETS)) {
      this.load.image(key, def.path);
    }

    this.load.on('loaderror', (file) => {
      this._failedKeys.add(file.key);
      console.warn('[BootScene] texture 404 or load error:', file.key, file.url);
    });
  }

  create() {
    // Anything that failed to load (or has no /assets file yet) gets a
    // flat-colour placeholder of the right size, so layout code never has
    // to special-case "missing texture".
    for (const [key, def] of Object.entries(ASSETS)) {
      if (this._failedKeys.has(key) || !this.textures.exists(key)) {
        this._makePlaceholder(key, def.w, def.h, PLACEHOLDER_COLORS[key] ?? 0x888888);
      }
    }

    if (this._failedKeys.size > 0) {
      console.info(
        `[SlavicGame] Using placeholder art for ${this._failedKeys.size} missing image(s). ` +
        'Drop real PNGs into /assets using the paths listed in src/config.js to replace them.',
      );
    }

    // A CSS @font-face rule only *registers* a font — it doesn't guarantee
    // it's loaded yet. Canvas text (which is all Phaser Text objects are)
    // measures/draws synchronously on creation: if the font isn't ready at
    // that instant, the browser silently substitutes a fallback and never
    // re-draws once the real font finishes downloading. Blocking scene
    // start on document.fonts.load() here means every Text object created
    // in GameScene.create() is guaranteed to use the real font from frame one.
    const startGame = () => this.scene.start('Game');
    const fontName = FONT_FAMILY.split(',')[0].trim();

    if (document.fonts && document.fonts.load) {
      Promise.all([
        document.fonts.load(`16px ${fontName}`),
        document.fonts.load(`18px ${fontName}`),
      ]).catch(() => {
        // Font file missing/failed — fall back silently, FONT_FAMILY's
        // Arial/sans-serif fallback still keeps text readable.
      }).finally(startGame);
    } else {
      startGame();
    }
  }

  _makePlaceholder(key, w, h, color) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(color, 1);
    g.fillRoundedRect(0, 0, w, h, Math.min(10, Math.floor(Math.min(w, h) / 6)));
    g.lineStyle(2, 0xffffff, 0.5);
    g.strokeRoundedRect(1, 1, w - 2, h - 2, Math.min(10, Math.floor(Math.min(w, h) / 6)));
    g.generateTexture(key, w, h);
    g.destroy();
  }
}
