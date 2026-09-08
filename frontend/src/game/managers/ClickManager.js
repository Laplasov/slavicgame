import { FONT_FAMILY } from '../config.js';

// Mirrors ClickManager.cs.
export class ClickManager {
  constructor(scene) {
    this.scene = scene;

    this.baseClickValue = 1;
    this.clickMoodLimit = 2.0;

    this.critChance = 0.05;
    this.critMultiplier = 2.0;
    this.wasLastClickCrit = false;

    this.passiveIncomePerSecond = 0;
    this._passiveIncomeTimer = 0;
    this.totalClicks = 0;

    this.text = scene.add.text(0, 0, '', {
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'right',
    }).setOrigin(0, 0).setDepth(1);
  }

  processClick(moodMultiplier) {
    this.totalClicks += 1;
    let scoreToGain = this.baseClickValue;

    this.wasLastClickCrit = Math.random() < this.critChance;
    if (this.wasLastClickCrit) {
      scoreToGain = Math.floor(scoreToGain * this.critMultiplier);
    }

    scoreToGain = Math.floor(scoreToGain * moodMultiplier);
    return scoreToGain;
  }

  initTotalClicks(value) {
    this.totalClicks = Number(value) || 0;
  }

  processMoodGain(moodManager) {
    if (moodManager.currentMood <= this.clickMoodLimit) {
      moodManager.increaseMood(0.1);
    }
  }

  update(deltaSeconds, scoreManager) {
    if (this.passiveIncomePerSecond > 0) {
      this._passiveIncomeTimer += deltaSeconds;
      if (this._passiveIncomeTimer >= 1.0) {
        this._passiveIncomeTimer -= 1.0;
        //const isCrit = Math.random() < this.critChance;
        //if (isCrit) scoreManager.addScore(this.passiveIncomePerSecond * Math.floor(this.critMultiplier), false);
        //else scoreManager.addScore(this.passiveIncomePerSecond, false);
        scoreManager.addScore(this.passiveIncomePerSecond, false);
      }
    }
    this._redraw();
  }

  applyBuff(item) {
    this.baseClickValue += item.clickValueBonus;
    this.critChance += item.critChanceBonus;
    this.passiveIncomePerSecond += item.passiveIncomeBonus;
    this.clickMoodLimit += item.moodCapBonus;
  }

  resize(scale, bottomReserved = 0) {
    const mode = this.scene._layoutMode;
    const d = this.scene._dpr || 1;
    const MIN_SCALE = (mode === 'portrait' ? 1.45 : 1.0) * d;
    const MAX_SCALE = (mode === 'portrait' ? 1.9 : 2.0) * d;
    this._scale = Phaser.Math.Clamp(scale, MIN_SCALE, MAX_SCALE);
    this._bottomReserved = bottomReserved;
    this._redraw();
  }

  _redraw() {
    const scale = this._scale || 1;
    const bottomReserved = this._bottomReserved || 0;
    const margin = 12 * scale;
    const statsText = `Клик: ${this.baseClickValue}\nКрит: ${Math.round(this.critChance * 100)}%\nПассив: ${this.passiveIncomePerSecond}\nЛимит: ${this.clickMoodLimit.toFixed(1)}`;
    this.text.setFontSize(14 * scale);
    this.text.setText(statsText);
    const padX = 10 * scale;
    const padY = 8 * scale;
    const boxW = this.text.width + padX * 2;
    const boxH = this.text.height + padY * 2;
    const boxX = this.scene.scale.width - margin - boxW;
    const boxY = this.scene.scale.height - margin - bottomReserved - boxH;
    if (!this._backdrop) {
      this._backdrop = this.scene.add.graphics();
    }
    this._backdrop.clear();
    this._backdrop.fillStyle(0x000000, 0.45);
    this._backdrop.fillRoundedRect(boxX, boxY, boxW, boxH, 8 * scale);
    this.text.setPosition(boxX + padX, boxY + padY);
  }
}
