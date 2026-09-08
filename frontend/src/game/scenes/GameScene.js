import Phaser from "phaser";
import { SaveManager } from "../managers/SaveManager.js";
import { ItemManager } from "../managers/ItemManager.js";
import { SlavikAnimator } from "../managers/SlavikAnimator.js";
import { ScoreManager } from "../managers/ScoreManager.js";
import { MoodManager } from "../managers/MoodManager.js";
import { BuffManager } from "../managers/BuffManager.js";
import { ClickManager } from "../managers/ClickManager.js";
import { WardrobeBridge } from "../wardrobe/WardrobeBridge.js";
import { UI_REF, getDpr } from "../config.js";

/** Как часто автосохраняем счёт, секунд. */
const SCORE_SAVE_INTERVAL = 5;

/**
 * Главная игровая сцена.
 *
 * Что изменилось по сравнению с предыдущей версией:
 *  - УДАЛЕНЫ EquipmentManager (4 кнопки слотов слева) и MenuManager (старое меню внутри Phaser).
 *    Покупка и надевание одежды теперь происходят только в React-панели гардероба.
 *  - ДОБАВЛЕН WardrobeBridge: единственный мост между сценой и React-панелью.
 *  - reservedBottomHeight больше нет (кнопки слотов пропали), поэтому
 *    BuffManager и ClickManager получают bottomReserved = 0.
 */
export class GameScene extends Phaser.Scene {
  constructor() {
    super("Game");
    this._saveTimer = 0;
    this._isResetting = false;
    this._inputBlocked = false;
  }

  create() {
    // --- Сохранения и каталог предметов ---
    this._saveManager = new SaveManager(this.registry.get('savePayload') || {});
    this._itemManager = new ItemManager(this._saveManager);

    // --- Фон на весь экран ---
    this.background = this.add.image(0, 0, "backGround").setOrigin(0, 0);

    // --- Персонаж ---
    this._slavik = new SlavikAnimator(this);

    // --- Игровая логика ---
    this._scoreManager = new ScoreManager(this);
    this._scoreManager.setTotal(this._saveManager.loadedTotalHearts);

    this._moodManager = new MoodManager(this);
    this._buffManager = new BuffManager(this);
    this._clickManager = new ClickManager(this);
    this._clickManager.initTotalClicks(this._saveManager.totalClicks);
    this._scoreManager.initTotalCollected(this._saveManager.totalHeartsCollected);

    // Восстанавливаем бонусы от уже купленных предметов и надеваем сохранённый аутфит
    this._itemManager.initializeItems();
    for (const item of this._itemManager.getPurchasedItems()) {
      this._clickManager.applyBuff(item);
    }
    this._itemManager.equipSavedOutfit(this._slavik);

    // --- Мост к React-панели гардероба ---
    this._wardrobe = new WardrobeBridge(this, {
      scoreManager: this._scoreManager,
      itemManager: this._itemManager,
      saveManager: this._saveManager,
      clickManager: this._clickManager,
      slavikAnimator: this._slavik,
    });

    // --- Колбэки ---

    // Кормим монстра за 50 сердец -> +1 к настроению
    this._buffManager.onClicked = () => {
      if (this._inputBlocked) return;
      if (this._scoreManager.totalHearts >= this._buffManager.monsterCost) {
        this._scoreManager.removeScore(this._buffManager.monsterCost);
        this._moodManager.increaseMood(1.0);
      }
    };

    // Клик по персонажу -> сердца + настроение
    this._slavik.onClicked = () => {
      if (this._inputBlocked) return;
      const scoreGained = this._clickManager.processClick(this._moodManager.multiplier);
      this._scoreManager.addScore(scoreGained);
      this._clickManager.processMoodGain(this._moodManager);
    };

    // --- Клавиатура ---
    if (this.input.keyboard) {
      this._ctrlKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);
    }

    // Ctrl+R / Cmd+R — полный сброс прогресса
    this._resetHandler = (event) => {
      if (event.key === "r" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        if (window.confirm("Удалить весь прогресс и сбросить игру?")) {
          this._isResetting = true;
          this._saveManager.clear();
          window.location.reload();
        }
      }
    };
    window.addEventListener("keydown", this._resetHandler);

    // Сохраняемся при закрытии вкладки
    this._beforeUnloadHandler = () => {
      if (!this._isResetting) {
        this._saveManager.saveScore(this._scoreManager.totalHearts);
      }
    };
    window.addEventListener("beforeunload", this._beforeUnloadHandler);

    // При остановке сцены снимаем все подписки
    this.events.on("shutdown", this._onShutdown, this);

    // --- Лейаут ---
    this._applyLayout(this.scale.width, this.scale.height);
    this.scale.on("resize", (gameSize) => this._applyLayout(gameSize.width, gameSize.height));

    // Сообщаем React-экрану загрузки, что игра полностью создана и готова.
    window.dispatchEvent(new CustomEvent('slavicgame:ready'));
  }

  /** Пересчитать размеры и позиции всех элементов под текущий размер окна. */
  _applyLayout(width, height) {
    const PORTRAIT_ASPECT_THRESHOLD = 1.3;
    const MIN_SCALE = 0.7;

    // 'portrait' (телефон) или 'landscape' (ПК) — менеджеры читают это поле напрямую
    this._layoutMode = height > width * PORTRAIT_ASPECT_THRESHOLD ? "portrait" : "landscape";

    const d = getDpr();
    this._dpr = d;
    const cssWidth = width / d;
    const cssHeight = height / d;
    const scale = Math.max(MIN_SCALE, Math.min(cssWidth / UI_REF.width, cssHeight / UI_REF.height)) * d;

    // Фон методом cover: пропорции не искажаются, лишнее обрезается,
    // центр комнаты совпадает с центром экрана
    const bgSrc = this.background.texture.getSourceImage();
    const bgScale = Math.max(width / bgSrc.width, height / bgSrc.height);
    const bgW = bgSrc.width * bgScale;
    const bgH = bgSrc.height * bgScale;
    this.background.setDisplaySize(bgW, bgH);
    this.background.setPosition((width - bgW) / 2, (height - bgH) / 2);
    this._slavik.resize(scale * 0.85);  // Уменьшаем персонажа на 15%, чтобы лицо не перекрывало полоску настроения
    this._scoreManager.resize(scale);
    this._moodManager.resize(scale);

    // Раньше здесь передавался reservedBottomHeight от EquipmentManager (полоса кнопок
    // слотов внизу в портретном режиме). Кнопок больше нет, поэтому 0.
    this._buffManager.resize(scale, 0);
    this._clickManager.resize(scale, 0);
  }

  /** Игровой цикл, вызывается каждый кадр. */
  update(time, delta) {
    const deltaSeconds = delta / 1000;

    // Эмуляция клика по Ctrl. Пока панель гардероба открыта — клики заблокированы.
    if (
      !this._wardrobe.isOpen &&
      this._ctrlKey &&
      Phaser.Input.Keyboard.JustDown(this._ctrlKey)
    ) {
      this._slavik.click();
    }

    // Автосейв каждые SCORE_SAVE_INTERVAL секунд
    this._saveTimer += deltaSeconds;
    if (this._saveTimer >= SCORE_SAVE_INTERVAL) {
      this._saveTimer = 0;
      this._saveManager.saveScore(this._scoreManager.totalHearts);
    }

    this._slavik.update(deltaSeconds);
    this._scoreManager.update(deltaSeconds);
    this._moodManager.update(deltaSeconds);
    this._buffManager.update();
    this._clickManager.update(deltaSeconds, this._scoreManager);

    // Отправляем в React актуальное число сердец (только пока панель открыта)
    this._wardrobe.update(deltaSeconds);
  }

  /** Очистка при остановке сцены. */
  _onShutdown() {
    window.removeEventListener("keydown", this._resetHandler);
    window.removeEventListener("beforeunload", this._beforeUnloadHandler);
    // Гарантированный cleanup моста: снимает beforeunload и переводит
    // его в zombie-режим (epoch не совпадёт с текущим ApiClient)
    if (this._wardrobe && typeof this._wardrobe.destroy === 'function') {
      try { this._wardrobe.destroy(); } catch (e) { /* ignore */ }
    }
  }
}
