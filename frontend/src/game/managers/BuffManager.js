import Phaser from "phaser";
import { FONT_FAMILY } from '../config.js';

// Mirrors BuffManager.cs.
export class BuffManager {
  constructor(scene) {
    this.scene = scene;
    this.monsterCost = 50;
    this.onClicked = null; // callback()
    this._isPressed = false;

    this.panel = scene.add.image(0, 0, 'buffPanel').setOrigin(0, 0).setInteractive({ useHandCursor: true });
    this.monster = scene.add.image(0, 0, 'monster').setOrigin(0, 0);
    this.heart = scene.add.image(0, 0, 'heartIcon').setOrigin(0, 0);
    this.text = scene.add.text(0, 0, '', {
      fontFamily: FONT_FAMILY,
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0, 1);

    this.panel.on('pointerover', () => { this._isHovered = true; });
    this.panel.on('pointerout', () => { this._isHovered = false; this._isPressed = false; });
    this.panel.on('pointerdown', () => {
      this._isPressed = true;
      if (this.onClicked) this.onClicked();
    });
    this.panel.on('pointerup', () => { this._isPressed = false; });
  }

  resize(scale, bottomReserved = 0) {
    const mode = this.scene._layoutMode;
    const d = this.scene._dpr || 1;
    const MIN_SCALE = (mode === 'portrait' ? 1.05 : 1.0) * d;
    const MAX_SCALE = (mode === 'portrait' ? 1.45 : 2.0) * d;
    this._scale = Phaser.Math.Clamp(scale, MIN_SCALE, MAX_SCALE);
    this._bottomReserved = bottomReserved;
    this._redraw();
  }

  update() {
    this._redraw();
  }

  _redraw() {
    const scale = this._scale || 1;

    const bottomReserved = this._bottomReserved || 0;

    const panelWidth = this.panel.width * scale;
    const panelHeight = this.panel.height * scale;
    const padding = 20 * scale;

    const panelX = padding;
    const panelY = this.scene.scale.height - panelHeight - padding - bottomReserved;

    this.panel.setPosition(panelX, panelY);
    this.panel.setDisplaySize(panelWidth, panelHeight);
    this.panel.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.panel.width, this.panel.height), Phaser.Geom.Rectangle.Contains);
    this.panel.setAlpha(this._isPressed ? 1.0 : 0.7);

    const monsterScale = 0.6;
    const monsterWidth = this.monster.width * monsterScale * scale;
    const monsterHeight = this.monster.height * monsterScale * scale;
    const monsterX = panelX + (panelWidth - monsterWidth) / 2;
    const monsterY = panelY + (panelHeight - monsterHeight) / 2;
    this.monster.setPosition(monsterX, monsterY);
    this.monster.setDisplaySize(monsterWidth, monsterHeight);

    const costText = ` ${this.monsterCost}`;
    this.text.setFontSize(16 * scale);
    this.text.setText(costText);

    const heartScale = this.text.height / this.heart.height;
    const heartWidth = this.heart.width * heartScale;
    const heartHeight = this.text.height;
    const totalWidth = heartWidth + this.text.width;

    const startX = panelX + panelWidth / 2 - totalWidth / 2 - 5 * scale;
    const posY = panelY + panelHeight - 5 * scale;

    this.heart.setPosition(startX, posY - heartHeight);
    this.heart.setDisplaySize(heartWidth, heartHeight);

    this.text.setPosition(startX + heartWidth, posY);
  }
}
