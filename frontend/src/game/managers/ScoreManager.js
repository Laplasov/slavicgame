import Phaser from "phaser";
import { UI_REF, FONT_FAMILY } from '../config.js';

// The C# version split the total across four `int` fields (score/k/m/b) to
// avoid overflow. JS numbers are IEEE-754 doubles and represent integers
// exactly up to 2^53 (~9 quadrillion) — far past anything this idle game
// will reach — so a single number does the same job with less code.
export class ScoreManager {
  constructor(scene) {
    this.scene = scene;
    this._total = 0;

    this._heartScale = 1.0;
    this._targetHeartScale = 1.0;
    this._scaleSpeed = 15;
    this.totalCollected = 0;

    this.panel = scene.add.image(0, 0, 'heartsPanel').setOrigin(0, 0);
    this.heart = scene.add.image(0, 0, 'heartIcon').setOrigin(0, 0);
    this.text = scene.add.text(0, 0, '', {
      fontFamily: FONT_FAMILY,
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'left',
    }).setOrigin(0, 0);
  }

  get totalHearts() {
    return this._total;
  }

  setTotal(totalHearts) {
    this._total = Math.max(0, totalHearts);
  }

  addScore(amount, animate = true) {
    this._total += amount;
    if (amount > 0) this.totalCollected += amount;
    if (animate) {
      this._heartScale = 1.3;
      this._targetHeartScale = 1.0;
    }
  }

  initTotalCollected(value) {
    this.totalCollected = Number(value) || 0;
  }

  removeScore(amount) {
    this.setTotal(this._total - amount);
  }

  getFormattedScore() {
    const n = this._total;
    if (n >= 1_000_000_000) return `${Math.floor(n / 1e9)}.${Math.floor((n % 1e9) / 1e8)}B`;
    if (n >= 1_000_000) return `${Math.floor(n / 1e6)}.${Math.floor((n % 1e6) / 1e5)}M`;
    if (n >= 1_000) return `${Math.floor(n / 1e3)}.${Math.floor((n % 1e3) / 1e2)}K`;
    return `${Math.floor(n)}`;
  }

  update(deltaSeconds) {
    const t = Phaser.Math.Clamp(this._scaleSpeed * deltaSeconds, 0, 1);
    this._heartScale = Phaser.Math.Linear(this._heartScale, this._targetHeartScale, t);
    if (Math.abs(this._heartScale - 1.0) < 0.01) this._heartScale = 1.0;

    this._redraw();
  }

  resize(scale) {
    const mode = this.scene._layoutMode;
    const d = this.scene._dpr || 1;
    const cssWidth = this.scene.scale.width / d;

    // На телефоне панель сердечек должна оставаться читаемой.
    // Не даём ей становиться крошечной на узких экранах.
    // Границы указаны в CSS-масштабе и умножены на плотность d.
    const MIN_SCALE = (mode === 'portrait' ? 0.95 : 1.2) * d;
    const MAX_SCALE = (mode === 'portrait'
      ? Phaser.Math.Clamp(cssWidth / 340, 1.0, 1.35)
      : 2.0) * d;

    this._scale = Phaser.Math.Clamp(scale, MIN_SCALE, MAX_SCALE);
    this._redraw();
  }

  _redraw() {
    const scale = this._scale || 1;
    const padding = 10 * scale;
    const panelHeight = 60 * scale;
    const heartSize = 40 * scale;
    const textGap = 15 * scale;

    const displayText = `${this.getFormattedScore()}\nСердечки`;
    this.text.setFontSize(18 * scale);
    this.text.setText(displayText);

    const panelWidth = padding + heartSize + textGap + this.text.width + padding;

    const panelX = padding;
    const panelY = padding;

    this.panel.setPosition(panelX, panelY);
    this.panel.setDisplaySize(panelWidth, panelHeight);

    const scaledHeartSize = heartSize * this._heartScale;
    const heartX = panelX + padding + (heartSize - scaledHeartSize) / 2;
    const heartY = panelY + (panelHeight - scaledHeartSize) / 2;
    this.heart.setPosition(heartX, heartY);
    this.heart.setDisplaySize(scaledHeartSize, scaledHeartSize);

    const textX = panelX + padding + heartSize + textGap;
    const textY = panelY + (panelHeight - this.text.height) / 2;
    this.text.setPosition(textX, textY);
  }
}
