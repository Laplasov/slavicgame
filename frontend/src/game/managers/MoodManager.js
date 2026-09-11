import Phaser from "phaser";
import { FONT_FAMILY } from '../config.js';

/** Количество цветных сегментов, из которых собирается градиент заливки. */
const GRADIENT_SEGMENTS = 32;

/** Опорные цвета градиента: низ зелёный, середина жёлтая, верх красный. */
const COLOR_GREEN = { r: 0x7c, g: 0xe0, b: 0x8a };
const COLOR_YELLOW = { r: 0xff, g: 0xd1, b: 0x66 };
const COLOR_RED = { r: 0xf6, g: 0x6d, b: 0x5b };

/**
 * Менеджер настроения в виде вертикального "градусника" слева.
 *
 * Внешнее API не изменилось (currentMood, multiplier, increaseMood,
 * decreaseMood, update, resize), поэтому GameScene и ClickManager не трогаем.
 *
 * Отрисовка:
 *  - тёмная полупрозрачная колба со скруглёнными торцами;
 *  - заливка снизу вверх: 1.0 настроения = 0%, 8.0 = 100% (линейно);
 *  - цвет заливки - градиент вдоль колонки (зелёный снизу, красный сверху);
 *  - штрихи-деления через каждую 1.0 настроения;
 *  - тёмная обводка вокруг колбы;
 *  - подпись "Настроенице: xN.N" под колбой.
 */
export class MoodManager {
  constructor(scene) {
    this.scene = scene;

    this._minMood = 1.0;
    this._maxMood = 8.0;
    this._currentMood = this._minMood;
    this._displayedMood = this._minMood;

    this._moodDecayRate = 0.05;
    this._moodDecayTimer = 0;
    this._scale = 1;

    // Вся графика колбы (фон, заливка, деления, обводка) в одном Graphics
    this._gfx = scene.add.graphics();

    // Подпись под колбой
    this.text = scene.add.text(0, 0, '', {
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
    }).setOrigin(0.5, 0.5);
  }

  get currentMood() {
    return this._currentMood;
  }

  get multiplier() {
    return this._currentMood;
  }

  increaseMood(amount) {
    this._currentMood = Math.min(this._maxMood, this._currentMood + amount);
  }

  decreaseMood(amount) {
    this._currentMood = Math.max(this._minMood, this._currentMood - amount);
  }

  update(deltaSeconds) {
    // Плавное падение настроения со временем
    this._moodDecayTimer += deltaSeconds;
    if (this._moodDecayTimer >= 0.1) {
      const decayAmount = this._moodDecayRate * this._currentMood * this._moodDecayTimer;
      this._currentMood = Math.max(this._minMood, this._currentMood - decayAmount);
      this._moodDecayTimer = 0;
    }

    // Плавная интерполяция отображаемого значения
    const lerpAmount = Math.min(1, deltaSeconds * 5);
    this._displayedMood = Phaser.Math.Linear(this._displayedMood, this._currentMood, lerpAmount);

    this._redraw();
  }

  resize(scale) {
    const mode = this.scene._layoutMode;
    const d = this.scene._dpr || 1;
    const MIN_SCALE = (mode === 'portrait' ? 1.0 : 0.9) * d;
    const MAX_SCALE = (mode === 'portrait' ? 1.0 : 2.0) * d;
    this._scale = Phaser.Math.Clamp(scale, MIN_SCALE, MAX_SCALE);
    this._redraw();
  }

  /**
   * Цвет градиента на высоте t (0 - самый низ колбы, 1 - самый верх).
   * Возвращает целое 0xRRGGBB для Graphics.fillStyle.
   */
  _colorAt(t) {
    const from = t < 0.5 ? COLOR_GREEN : COLOR_YELLOW;
    const to = t < 0.5 ? COLOR_YELLOW : COLOR_RED;
    const k = t < 0.5 ? t * 2 : (t - 0.5) * 2;
    const r = Math.round(Phaser.Math.Linear(from.r, to.r, k));
    const g = Math.round(Phaser.Math.Linear(from.g, to.g, k));
    const b = Math.round(Phaser.Math.Linear(from.b, to.b, k));
    return (r << 16) | (g << 8) | b;
  }

  _redraw() {
    const scale = this._scale || 1;
    const mode = this.scene._layoutMode;
    const screenH = this.scene.scale.height;

    // Границы колбы: низ панели сердечек сверху и верх панели монстра снизу.
    // Отступы сверху и снизу одинаковые (gap).
    const gap = 15 * scale;
    let topBound = 90 * scale;
    let bottomBound = screenH - 130 * scale;
    if (this.scene._scoreManager && this.scene._scoreManager.panel) {
      topBound = this.scene._scoreManager.panel.y + this.scene._scoreManager.panel.displayHeight;
    }
    if (this.scene._buffManager && this.scene._buffManager.panel) {
      bottomBound = this.scene._buffManager.panel.y;
    }
    const columnW = (mode === 'portrait' ? 24 : 20) * scale;
    const x = 15 * scale;
    const y = topBound + gap;
    const columnH = Math.max(80, bottomBound - gap - y);
    const radius = columnW / 2;

    const gfx = this._gfx;
    gfx.clear();

    // --- Фон колбы (тёмный, полупрозрачный) ---
    gfx.fillStyle(0x000000, 0.45);
    gfx.fillRoundedRect(x, y, columnW, columnH, radius);

    // --- Заливка ---
    // Линейно: 1.0 настроения = 0%, 8.0 = 100%
    const fillPercent = Phaser.Math.Clamp(
      (this._displayedMood - this._minMood) / (this._maxMood - this._minMood),
      0,
      1,
    );

    const inset = Math.max(2, 3 * scale);
    const ix = x + inset;
    const iy = y + inset;
    const iw = columnW - inset * 2;
    const ih = columnH - inset * 2;
    const fillH = ih * fillPercent;

    if (fillH > 1) {
      // Нижняя скруглённая "капля" (всегда зелёная, t = 0)
      const capH = Math.min(iw, fillH);
      const capRadius = Math.min(iw / 2, capH / 2);
      gfx.fillStyle(this._colorAt(0), 1);
      gfx.fillRoundedRect(ix, iy + ih - capH, iw, capH, {
        tl: 0,
        tr: 0,
        bl: capRadius,
        br: capRadius,
      });

      // Средние градиентные сегменты (между каплей и поверхностью жидкости)
      if (fillH > capH) {
        const midBottom = iy + ih - capH; // верх капли
        const midTop = iy + ih - fillH;   // поверхность жидкости
        for (let i = 0; i < GRADIENT_SEGMENTS; i++) {
          const segTop = iy + ih - ((i + 1) / GRADIENT_SEGMENTS) * ih;
          const segBottom = iy + ih - (i / GRADIENT_SEGMENTS) * ih;
          const drawTop = Math.max(segTop, midTop);
          const drawBottom = Math.min(segBottom, midBottom);
          if (drawBottom <= drawTop) continue;
          gfx.fillStyle(this._colorAt((i + 0.5) / GRADIENT_SEGMENTS), 1);
          gfx.fillRect(ix, drawTop, iw, drawBottom - drawTop);
        }
      }
    }

    // --- Штрихи-деления через каждую 1.0 настроения (внутренние значения 2..7) ---
    gfx.fillStyle(0x000000, 0.35);
    for (let v = 2; v <= 7; v++) {
      const tickY = iy + ih - ih * ((v - this._minMood) / (this._maxMood - this._minMood));
      gfx.fillRect(ix, tickY - 1, iw, 2);
    }

    // --- Тёмная обводка вокруг колбы ---
    gfx.lineStyle(Math.max(2, 2 * scale), 0x140f1e, 0.9);
    gfx.strokeRoundedRect(x, y, columnW, columnH, radius);

    // --- Подпись под колбой ---
    const labelGap = 8 * scale;
    // toFixed(1) гарантирует один знак после точки: 2 -> "2.0", 1 -> "1.0"
    const multiplierText = `x${this._currentMood.toFixed(1)}`;
    const fullLabel = this.scene._layoutMode === 'portrait'
      ? multiplierText
      : `Настроенице${multiplierText}`;
    const verticalText = fullLabel.split('').join('\n');

    // Целевая высота столбика текста - чуть короче колбы, чтобы не вылезал за неё
    const targetHeight = columnH * 0.92;
    let fontSize = 14 * scale;
    let lineSpacing = 3 * scale;

    this.text.setLineSpacing(lineSpacing);
    this.text.setFontSize(fontSize);
    this.text.setText(verticalText);

    // Подгон: пропорционально уменьшаем И шрифт, И межстрочный интервал,
    // чтобы столбик текста целиком помещался в высоту колбы
    for (let i = 0; i < 2; i += 1) {
      if (this.text.height <= targetHeight) break;
      const k = targetHeight / this.text.height;
      fontSize = Math.max(8, fontSize * k);
      lineSpacing = Math.max(1, lineSpacing * k);
      this.text.setFontSize(fontSize);
      this.text.setLineSpacing(lineSpacing);
    }

    this.text.setPosition(
      x + columnW + labelGap + this.text.width / 2,
      y + columnH / 2,
    );
  }
}
