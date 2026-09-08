import Phaser from "phaser";
// Mirrors SlavikAnimatorWeb.cs. Phaser's pointerdown event replaces the
// manual Mouse.GetState()/TouchPanel polling from the original.
export class SlavikAnimator {
  constructor(scene) {
    this.scene = scene;
    this.onClicked = null; // callback()

    this._currentScaleMultiplier = 1.0;
    this._targetScaleMultiplier = 1.0;
    this.easingSpeed = 12;

    // Draw order matches Draw(): base, Top, Tights, Bottom, Collar (kettle)
    this.base = scene.add.image(0, 0, 'baseBody').setOrigin(0.5, 0);
    this.topLayer = scene.add.image(0, 0, 'defaultTop').setOrigin(0.5, 0).setVisible(false);
    this.tightsLayer = scene.add.image(0, 0, 'defaultTights').setOrigin(0.5, 0).setVisible(false);
    this.bottomLayer = scene.add.image(0, 0, 'defaultBottom').setOrigin(0.5, 0).setVisible(false);
    this.collarLayer = scene.add.image(0, 0, 'defaultKettle').setOrigin(0.5, 0).setVisible(false);

    this.base.setInteractive({ useHandCursor: true });
    this.base.on('pointerdown', () => this.click());
  }

  equipItem(slotType, textureKey) {
    // textureKey === null means "no layer" (the naked/buff-only items).
    const layer = {
      Kettle: this.collarLayer,
      Top: this.topLayer,
      Bottom: this.bottomLayer,
      Tights: this.tightsLayer,
    }[slotType];
    if (!layer) return;

    // Защитный код: если текстура не загружена в TextureManager, не пытаемся надеть
    // (иначе Phaser падает с 'Cannot read properties of undefined (reading sys)')
    if (textureKey) {
      const tm = this.scene && this.scene.textures;
      if (!tm || !tm.exists(textureKey)) {
        console.warn('[SlavikAnimator] texture not loaded:', textureKey, '- skipping equip');
        return;
      }
      try {
        layer.setTexture(textureKey);
        layer.setVisible(true);
      } catch (err) {
        console.error('[SlavikAnimator] setTexture failed for', textureKey, err);
        return;
      }
    } else {
      layer.setVisible(false);
    }
    this._layoutLayer(layer);
  }

  click() {
    if (this.scene._inputBlocked) return
    this._currentScaleMultiplier = 0.9;
    if (this.onClicked) this.onClicked();
  }

  update(deltaSeconds) {
    const t = Phaser.Math.Clamp(this.easingSpeed * deltaSeconds, 0, 1);
    this._currentScaleMultiplier = Phaser.Math.Linear(this._currentScaleMultiplier, this._targetScaleMultiplier, t);
    if (Math.abs(this._currentScaleMultiplier - 1.0) < 0.001) this._currentScaleMultiplier = 1.0;

    this._redraw();
  }

  resize(scale) {
    this._scale = scale;
    this._layout();
    this._redraw();
  }

  get destination() {
    return this._destination || new Phaser.Geom.Rectangle(0, 0, 0, 0);
  }

  _layout() {
    const viewportW = this.scene.scale.width;
    const viewportH = this.scene.scale.height;
    const mode = this.scene._layoutMode;
    const texH = this.base.texture.getSourceImage().height;
    const texW = this.base.texture.getSourceImage().width;
    // Высота персонажа: доля экрана, на маленьких экранах меньше
    let heightFraction = 1.0;
    if (mode === 'portrait') {
      if (viewportW < 480) heightFraction = 0.72;
      else if (viewportW < 768) heightFraction = 0.80;
      else heightFraction = 0.85;
    }
    const targetHeight = viewportH * heightFraction;
    const texScale = targetHeight / texH;
    const scaledWidth = texW * texScale;
    const centerX = viewportW / 2;
    const xPos = centerX - scaledWidth / 2;
    // Отступ сверху: на телефоне персонаж ниже верхних панелей и кнопок
    const topOffset = mode === 'portrait' ? (viewportH - targetHeight) * 0.65 : 0;
    this._destination = new Phaser.Geom.Rectangle(xPos, topOffset, scaledWidth, targetHeight);
    this._targetWidth = scaledWidth;
    this._targetHeight = targetHeight;
    this._centerX = centerX;
  }

  _layoutLayer(layer) {
    if (!this._destination) return;
    layer.setPosition(this._centerX, this._destination.y);
    layer.setDisplaySize(this._targetWidth, this._targetHeight);
  }

  _redraw() {
    if (!this._destination) return;

    const finalWidth = this._targetWidth * this._currentScaleMultiplier;
    const finalHeight = this._targetHeight * this._currentScaleMultiplier;
    const offsetY = (this._targetHeight - finalHeight) / 2;

    const layers = [this.base, this.topLayer, this.tightsLayer, this.bottomLayer, this.collarLayer];
    for (const layer of layers) {
      layer.setPosition(this._centerX, this._destination.y + offsetY);
      layer.setDisplaySize(finalWidth, finalHeight);
    }

    this.base.setInteractive(
      new Phaser.Geom.Rectangle(-finalWidth / 2, 0, finalWidth, finalHeight),
      Phaser.Geom.Rectangle.Contains,
    );
  }
}
