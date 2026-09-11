import { SOUNDS, DEFAULT_VOLUMES, SoundCategory } from '../config.js';

const VOLUME_STEP = 0.1;

export class SoundManager {
  constructor(scene) {
    this._scene = scene;
    this._bgm = null;
    this._currentMusicKey = null;

    this._addVolumeKey = () => this.adjustMusicVolume(VOLUME_STEP);
    this._subtractVolumeKey = () => this.adjustMusicVolume(-VOLUME_STEP);

    if (scene.input.keyboard) {
      scene.input.keyboard.on('keydown-NUMPAD_ADD', this._addVolumeKey);
      scene.input.keyboard.on('keydown-NUMPAD_SUBTRACT', this._subtractVolumeKey);
    }
  }

  playSound(key, overrides = {}) {
    const def = SOUNDS[key];
    this._scene.sound.play(key, {
      ...def.soundConfig,
      volume: this._resolveVolume(key),
      ...overrides,
    });
  }

  setMusic(key) {
    if (this._bgm) {
      this._bgm.stop();
      this._bgm.destroy();
    }
    this._currentMusicKey = key;
    const def = SOUNDS[key];
    this._bgm = this._scene.sound.add(key, {
      ...def.soundConfig,
      volume: this._resolveVolume(key),
    });
    this._scene.input.once('pointerdown', () => {
      if (!this._bgm.isPlaying) {
        this._bgm.play();
      }
    });
  }

  adjustMusicVolume(delta) {
    const current = DEFAULT_VOLUMES[SoundCategory.Music];
    const next = Math.min(1, Math.max(0, current + delta));
    DEFAULT_VOLUMES[SoundCategory.Music] = next;

    if (this._bgm && this._currentMusicKey) {
      this._bgm.setVolume(this._resolveVolume(this._currentMusicKey));
    }
  }

  _resolveVolume(key) {
    const def = SOUNDS[key];
    const baseVolume = def.soundConfig.volume ?? 1;
    const categoryVolume = DEFAULT_VOLUMES[def.category];
    return baseVolume * categoryVolume;
  }

  destroy() {
    if (this._scene.input.keyboard) {
      this._scene.input.keyboard.off('keydown-NUMPAD_ADD', this._addVolumeKey);
      this._scene.input.keyboard.off('keydown-NUMPAD_SUBTRACT', this._subtractVolumeKey);
    }
    if (this._bgm) {
      this._bgm.stop();
      this._bgm.destroy();
      this._bgm = null;
    }
  }
}