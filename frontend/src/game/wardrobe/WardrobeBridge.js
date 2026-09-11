import { SlotType, ASSETS } from '../config.js';
import { eventBus } from '../EventBus.js';
import { WardrobeEvents } from '../WardrobeEvents.js';
import { ApiClient } from '../../api.js';

/** Порядок и названия вкладок гардероба. */
const SLOT_ORDER = [SlotType.Kettle, SlotType.Top, SlotType.Bottom, SlotType.Tights];

const SLOT_LABELS = {
  [SlotType.Kettle]: 'Чайник',
  [SlotType.Top]: 'Топ',
  [SlotType.Bottom]: 'Низ',
  [SlotType.Tights]: 'Колготочки',
};

/** Как часто шлём в React обновление сердец, сек. */
const HEARTS_EMIT_INTERVAL = 0.1;

/** Как часто кладём сейв на сервер, сек. */
const SERVER_SAVE_INTERVAL = 5;

/**
 * Мост Phaser-React + серверный автосейв.
 * Каждые 5 сек PUT /api/save/, при закрытии вкладки - flush с keepalive.
 * По запросу React отдаёт snapshot сейва (для выхода из аккаунта).
 */
export class WardrobeBridge {
  constructor(scene, deps) {
    this._scene = scene;
    this._score = deps.scoreManager;
    this._items = deps.itemManager;
    this._save = deps.saveManager;
    this._clicks = deps.clickManager;
    this._slavik = deps.slavikAnimator;

    this._isOpen = false;
    this._heartsTimer = 0;
    this._lastSentHearts = null;
    this._saveTimer = 0;

    this._thanksSwitch = false;

    this._handleOpen = () => this.open();
    this._handleClose = () => this.close();
    this._handleSelect = (itemId) => this.select(itemId);
    this._handleSnapshot = () => {
      // Защита: если epoch в ApiClient не совпадает с нашим — значит сессия
      // уже сменилась, и мы zombie. Не отдаём snapshot, чтобы не затереть чужой аккаунт.
      if (ApiClient.getEpoch() !== this._sessionEpoch) return;
      eventBus.emit('save:snapshot:data', this._buildSavePayload());
    };
    this._handleUnload = () => {
      // keepalive-запрос успеет уйти при закрытии вкладки
      ApiClient.putSave(this._buildSavePayload(), true).catch(() => {});
    };

    eventBus.on(WardrobeEvents.OPEN, this._handleOpen);
    eventBus.on(WardrobeEvents.CLOSE, this._handleClose);
    eventBus.on(WardrobeEvents.SELECT, this._handleSelect);
    eventBus.on('save:snapshot', this._handleSnapshot);
    window.addEventListener('beforeunload', this._handleUnload);
  }

  get isOpen() {
    return this._isOpen;
  }

  open() {
    this._isOpen = true;
    this._scene._inputBlocked = true;
    this._heartsTimer = 0;
    this._lastSentHearts = null;
    this._emitState();
  }

  close() {
    this._isOpen = false;
    this._scene._inputBlocked = false;
    eventBus.emit(WardrobeEvents.STATE, { isOpen: false });
  }

  select(itemId) {

    if (!this._isSceneAlive()) return;

    const item = this._items.getItemById(itemId);
    if (!item) return;

    if (item.isPurchased) {
      this._slavik.equipItem(item.type, item.layerKey);
      this._save.markEquipped(item.type, item.id);
      this._emitState();
      this._scene._sound.playSound('votTak');
      return;
    }

    if (this._score.totalHearts < item.cost) {
      this._emitState();
      this._scene._sound.playSound('hmm');
      return;
    }

    this._clicks.applyBuff(item);
    this._score.removeScore(item.cost);
    item.isPurchased = true;
    this._slavik.equipItem(item.type, item.layerKey);
    this._save.markPurchased(item.id);
    this._save.markEquipped(item.type, item.id);
    this._save.saveScore(this._score.totalHearts);
    this._flushSave();
    this._emitState();

    let thanksAudio = this._thanksSwitch ? 'love' : 'beautiful'
    this._thanksSwitch = !this._thanksSwitch;

    this._scene._sound.playSound(thanksAudio);
  }

  update(deltaSeconds) {
    // Автосейв на сервер каждые SERVER_SAVE_INTERVAL секунд
    this._saveTimer += deltaSeconds;
    if (this._saveTimer >= SERVER_SAVE_INTERVAL) {
      this._saveTimer = 0;
      this._flushSave();
    }

    if (!this._isOpen) return;
    this._heartsTimer += deltaSeconds;
    if (this._heartsTimer < HEARTS_EMIT_INTERVAL) return;
    this._heartsTimer = 0;

    const hearts = Math.floor(this._score.totalHearts);
    if (hearts === this._lastSentHearts) return;
    this._lastSentHearts = hearts;
    eventBus.emit(WardrobeEvents.HEARTS, hearts);
  }

  destroy() {
    eventBus.off(WardrobeEvents.OPEN, this._handleOpen);
    eventBus.off(WardrobeEvents.CLOSE, this._handleClose);
    eventBus.off(WardrobeEvents.SELECT, this._handleSelect);
    eventBus.off('save:snapshot', this._handleSnapshot);
    window.removeEventListener('beforeunload', this._handleUnload);
  }

  _isSceneAlive() {
    return !!(this._scene && this._scene.sound && this._scene.sound.game);
  }
  _flushSave() {
    const apiEpoch = ApiClient.getEpoch();
    console.log('[WardrobeBridge] flushSave: session=', this._sessionEpoch, 'api=', apiEpoch);
    // Если session epoch не определён (мост создан до setEpoch), используем api epoch
    if (!this._sessionEpoch && apiEpoch) {
      this._sessionEpoch = apiEpoch;
      console.log('[WardrobeBridge] session epoch was undefined, updated to:', apiEpoch);
    }
    // Если текущий токен/epoch в ApiClient не совпадает с нашим —
    // значит сессия уже сменилась (logout + новый login), и мы zombie.
    // Не шлём PUT, чтобы не затереть чужой аккаунт.
    if (this._sessionEpoch && apiEpoch !== this._sessionEpoch) {
      console.warn('[WardrobeBridge] flushSave BLOCKED: zombie detected');
      return;
    }
    ApiClient.putSave(this._buildSavePayload()).catch((err) => {
      console.error('[WardrobeBridge] flushSave error:', err && err.message);
      // 409 = сервер отверг epoch, сессия устарела — просим React перезагрузить
      if (err && err.status === 409) {
        window.dispatchEvent(new CustomEvent('slavicgame:session-expired'));
      }
    });
  }

  /** Payload сейва в формате /api/save/. */
  _buildSavePayload() {
    return {
      hearts: Math.floor(this._score.totalHearts),
      total_clicks: this._clicks.totalClicks || 0,
      total_hearts_collected: this._score.totalCollected || 0,
      purchased_ids: this._save.purchasedIdsList(),
      equipped: this._save.equippedMap(),
    };
  }

  _emitState() {
    eventBus.emit(WardrobeEvents.STATE, this._buildState());
  }

  _buildState() {
    return {
      isOpen: this._isOpen,
      hearts: Math.floor(this._score.totalHearts),
      layoutMode: this._scene._layoutMode || 'landscape',
      stats: {
        click: this._clicks.baseClickValue,
        crit: this._clicks.critChance,
        passive: this._clicks.passiveIncomePerSecond,
        limit: this._clicks.clickMoodLimit,
      },
      playerStats: {
        totalClicks: this._clicks.totalClicks || 0,
        totalHeartsCollected: this._score.totalCollected || 0,
      },
      slots: SLOT_ORDER.map((slot) => ({
        slot,
        label: SLOT_LABELS[slot],
        items: this._items.getItemsByType(slot).map((item) => this._serializeItem(item)),
      })),
    };
  }

  _serializeItem(item) {
    const asset = ASSETS[item.iconKey];
    return {
      id: item.id,
      name: item.name,
      iconUrl: asset ? asset.path : '',
      cost: item.cost,
      bonusText: this._bonusText(item),
      isPurchased: !!item.isPurchased,
      isEquipped: this._save.getEquippedItemId(item.type) === item.id,
      hasVisual: !!item.layerKey,
    };
  }

  _bonusText(item) {
    if (item.description && item.description.trim()) return item.description.trim();
    const parts = [];
    if (item.clickValueBonus) parts.push(`+${item.clickValueBonus} за клик`);
    if (item.critChanceBonus) parts.push(`+${Math.round(item.critChanceBonus * 100)}% крит`);
    if (item.passiveIncomeBonus) parts.push(`+${item.passiveIncomeBonus}/сек`);
    if (item.moodCapBonus) parts.push(`+${item.moodCapBonus} лимит настроения`);
    return parts.length > 0 ? parts.join(', ') : 'Без бонусов';
  }
}
