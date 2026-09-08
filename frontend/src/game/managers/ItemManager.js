import { SlotType } from '../config.js';
import { itemData } from '../items.js';

export class ItemProfile {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.iconKey = data.iconKey;
    this.layerKey = data.layerKey;
    this.cost = data.cost;
    this.type = SlotType[data.type];
    this.isPurchased = data.isPurchased;
    this.description = data.description || '';
    this.clickValueBonus = data.bonuses?.click || 0;
    this.critChanceBonus = data.bonuses?.crit || 0;
    this.passiveIncomeBonus = data.bonuses?.passive || 0;
    this.moodCapBonus = data.bonuses?.mood || 0;
  }
}

export class ItemManager {
  constructor(save) {
    this._save = save;
    this._allItems = [];
    this.defaultTop = itemData.defaultOutfit.Top;
    this.defaultTights = itemData.defaultOutfit.Tights;
    this.defaultBottom = itemData.defaultOutfit.Bottom;
    this.defaultKettle = itemData.defaultOutfit.Kettle;
  }

  initializeItems() {
    // Load all items from JSON, BUT sync them with the SaveManager!
    this._allItems = itemData.items.map(data => {
      const profile = new ItemProfile(data);
      
      // If the save file says we bought this item, override the default false value
      if (this._save.isPurchased(profile.id)) {
        profile.isPurchased = true;
      }
      
      return profile;
    });
  }

  equipDefaultOutfit(animator) {
    animator.equipItem(SlotType.Top, this.defaultTop);
    animator.equipItem(SlotType.Tights, this.defaultTights);
    animator.equipItem(SlotType.Bottom, this.defaultBottom);
    animator.equipItem(SlotType.Kettle, this.defaultKettle);
  }

  getItemsByType(type) {
    return this._allItems.filter((i) => i.type === type);
  }

  getPurchasedItems() {
    return this._allItems.filter((i) => i.isPurchased);
  }

  getItemById(id) {
    return this._allItems.find((i) => i.id === id) || null;
  }

  equipSavedOutfit(animator) {
    this._equipSlotFromSaveOrDefault(animator, SlotType.Kettle, this.defaultKettle);
    this._equipSlotFromSaveOrDefault(animator, SlotType.Top, this.defaultTop);
    this._equipSlotFromSaveOrDefault(animator, SlotType.Bottom, this.defaultBottom);
    this._equipSlotFromSaveOrDefault(animator, SlotType.Tights, this.defaultTights);
  }

  _equipSlotFromSaveOrDefault(animator, slot, defaultLayerKey) {
    const savedId = this._save.getEquippedItemId(slot);
    if (savedId) {
      const item = this.getItemById(savedId);
      // Now this will correctly find the item because isPurchased is true!
      if (item && item.isPurchased) {
        animator.equipItem(slot, item.layerKey);
        return;
      }
    }
    animator.equipItem(slot, defaultLayerKey);
  }
}