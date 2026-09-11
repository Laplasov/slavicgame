// Reference design resolution — every layout number in the game is expressed
// against this, then scaled at runtime to fit the real canvas size.
// This mirrors Game1.UiReference (Width = 800, Height = 480) from the C# version.
export const UI_REF = { width: 800, height: 480 };

// Custom web font used for every in-game Text object. Registered via the
// @font-face rule in index.html (assets/font/UraBumBumSP.ttf) and preloaded
// in BootScene before the game starts. Arial/sans-serif stay as fallbacks
// in case the font file is ever missing, so text never disappears.
export const FONT_FAMILY = '"UraBumBum", Arial, sans-serif';

export const SoundCategory = Object.freeze({
  Music: 'music',
  Sfx: 'sfx',
});

// Player-controlled category sliders — persisted separately (localStorage).
export const DEFAULT_VOLUMES = {
  [SoundCategory.Music]: 1.0,
  [SoundCategory.Sfx]: 1.0,
};

/**
 * @typedef {Object} SoundDef
 * @property {string} path - Asset path passed to `this.load.audio(key, path)`.
 * @property {string} category - SoundCategory.Music or SoundCategory.Sfx; which slider controls this sound.
 * @property {Phaser.Types.Sound.SoundConfig} soundConfig - Passed directly into `this.sound.add()` / `this.sound.play()`.
 */

/** @type {Record<string, SoundDef>} */
export const SOUNDS = {
  mainSong: {
    path: '/assets/audio_slavic/Polished_Petals.ogg',
    category: SoundCategory.Music,
    soundConfig: { loop: true, volume: 0.2 },
  },
  puryHigh: {
    path: '/assets/audio_slavic/PuryHigh.ogg',
    category: SoundCategory.Sfx,
    soundConfig: {},
  },
  pury: {
    path: '/assets/audio_slavic/Pury.ogg',
    category: SoundCategory.Sfx,
    soundConfig: {},
  },
  kiss: {
    path: '/assets/audio_slavic/kiss.ogg',
    category: SoundCategory.Sfx,
    soundConfig: {},
  },
  yappy: {
    path: '/assets/audio_slavic/yappy.ogg',
    category: SoundCategory.Sfx,
    soundConfig: { volume: 0.5, detune: 200 },
  },
  love: {
    path: '/assets/audio_slavic/love.ogg',
    category: SoundCategory.Sfx,
    soundConfig: {},
  },
  hmm: {
    path: '/assets/audio_slavic/Hmm.ogg',
    category: SoundCategory.Sfx,
    soundConfig: {},
  },
  votTak: {
    path: '/assets/audio_slavic/vot_tak.ogg',
    category: SoundCategory.Sfx,
    soundConfig: {},
  },
  beautiful: {
    path: '/assets/audio_slavic/beautiful.ogg',
    category: SoundCategory.Sfx,
    soundConfig: {},
  },
};

// Every image the original game loaded via Content.Load<Texture2D>(...).
// `path` is where the loader looks for it under /assets (drop your real art
// there using these exact relative paths and it will be used automatically).
// `w`/`h` are only used to build a placeholder rectangle if the real file is
// missing, so the game is playable immediately with no art at all.
export const ASSETS = {
  backGround: { path: '/assets/SlavicRoom.png', w: 800, h: 480 },

  baseBody: { path: '/assets/Slavic/BaseBody.png', w: 300, h: 480 },
  hairOverlay: { path: '/assets/Slavic/SlavicHairOverlay.png', w: 300, h: 480 }, // loaded but unused (matches original, which has the draw call commented out)

  heartsPanel: { path: '/assets/UI/MainHeartsPanel.png', w: 220, h: 70 },
  heartIcon: { path: '/assets/UI/HeartIcon.png', w: 40, h: 40 },

  moodBack: { path: '/assets/UI/MoodBack.png', w: 300, h: 40 },
  moodFront: { path: '/assets/UI/MoodFront.png', w: 300, h: 40 },

  buttonPanel: { path: '/assets/UI/ButtonPanel.png', w: 140, h: 50 },

  buffPanel: { path: '/assets/UI/BuffPanel.png', w: 110, h: 110 },
  monster: { path: '/assets/UI/Monster.png', w: 70, h: 70 },

  closeIcon: { path: '/assets/UI/ClossButton.png', w: 30, h: 30 },
  panel: { path: '/assets/UI/Panel.png', w: 60, h: 60 },
  scroll: { path: '/assets/UI/Scroll.png', w: 20, h: 200 },
  scrollHandler: { path: '/assets/UI/ScrollHandler.png', w: 20, h: 60 },

  // Default (starting) outfit — always owned, matches _defaultTop/_defaultBottom/etc.
  kettleIcon: { path: '/assets/Icons/collar.png', w: 64, h: 64 },
  defaultKettle: { path: '/assets/Slavic/BaseOutfit/Collar.png', w: 300, h: 480 },
  topIcon: { path: '/assets/Icons/black_top.png', w: 64, h: 64 },
  defaultTop: { path: '/assets/Slavic/BaseOutfit/Suit.png', w: 300, h: 480 },
  bottomIcon: { path: '/assets/Icons/red-skert.png', w: 64, h: 64 },
  defaultBottom: { path: '/assets/Slavic/BaseOutfit/Skirt.png', w: 300, h: 480 },
  tightsIcon: { path: '/assets/Icons/torn_tights.png', w: 64, h: 64 },
  defaultTights: { path: '/assets/Slavic/BaseOutfit/tights.png', w: 300, h: 480 },

  // "Голый" (naked/no layer) buff-only items reuse the default icon (the
  // C# version passed the shared `closeIcon` in as `defaultIcon` here).
  nakedIcon: { path: '/assets/UI/ClossButton.png', w: 64, h: 64 },

  // Hipster outfit set
  hipsterKettleIcon: { path: '/assets/Icons/hipster_beanie.png', w: 64, h: 64 },
  hipsterKettle: { path: '/assets/Slavic/HipsterOutfit/Cap.png', w: 300, h: 480 },
  hipsterTopIcon: { path: '/assets/Icons/hipster_top.png', w: 64, h: 64 },
  hipsterTop: { path: '/assets/Slavic/HipsterOutfit/Suit.png', w: 300, h: 480 },
  hipsterBottomIcon: { path: '/assets/Icons/hipster_shorts.png', w: 64, h: 64 },
  hipsterBottom: { path: '/assets/Slavic/HipsterOutfit/Shorts.png', w: 300, h: 480 },
  hipsterTightsIcon: { path: '/assets/Icons/hipster_tights.png', w: 64, h: 64 },
  hipsterTights: { path: '/assets/Slavic/HipsterOutfit/tights.png', w: 300, h: 480 },

  // Home outfit set
  homeKettleIcon: { path: '/assets/Icons/home_choker.png', w: 64, h: 64 },
  homeKettle: { path: '/assets/Slavic/DakakimuraOutfit/Collar.png', w: 300, h: 480 },
  homeTopIcon: { path: '/assets/Icons/home_shirt.png', w: 64, h: 64 },
  homeTop: { path: '/assets/Slavic/DakakimuraOutfit/Suit.png', w: 300, h: 480 },
  homeBottomIcon: { path: '/assets/Icons/home_skirt.png', w: 64, h: 64 },
  homeBottom: { path: '/assets/Slavic/DakakimuraOutfit/Skirt.png', w: 300, h: 480 },
  homeTightsIcon: { path: '/assets/Icons/home_socks.png', w: 64, h: 64 },
  homeTights: { path: '/assets/Slavic/DakakimuraOutfit/Sokcs.png', w: 300, h: 480 },

  // Maid outfit set
  maidKettleIcon: { path: '/assets/Icons/maid_ears.png', w: 64, h: 64 },
  maidKettle: { path: '/assets/Slavic/MaidOutfit/Ears.png', w: 300, h: 480 },
  maidTopIcon: { path: '/assets/Icons/maid_top.png', w: 64, h: 64 },
  maidTop: { path: '/assets/Slavic/MaidOutfit/Suit.png', w: 300, h: 480 },
  maidBottomIcon: { path: '/assets/Icons/maid_skirt.png', w: 64, h: 64 },
  maidBottom: { path: '/assets/Slavic/MaidOutfit/Skirt.png', w: 300, h: 480 },
  maidTightsIcon: { path: '/assets/Icons/maid_tights.png', w: 64, h: 64 },
  maidTights: { path: '/assets/Slavic/MaidOutfit/Tights.png', w: 300, h: 480 },

  // Alt outfit set
  altKettleIcon: { path: '/assets/Icons/alt_colar.png', w: 64, h: 64 },
  altKettle: { path: '/assets/Slavic/AltOutfit/alt_colar.png', w: 300, h: 480 },
  altTopIcon: { path: '/assets/Icons/alt_sirt.png', w: 64, h: 64 },
  altTop: { path: '/assets/Slavic/AltOutfit/alt_sirt.png', w: 300, h: 480 },
  altBottomIcon: { path: '/assets/Icons/alt_skirt.png', w: 64, h: 64 },
  altBottom: { path: '/assets/Slavic/AltOutfit/alt_skirt.png', w: 300, h: 480 },
  altTightsIcon: { path: '/assets/Icons/alt_tights.png', w: 64, h: 64 },
  altTights: { path: '/assets/Slavic/AltOutfit/alt_tights.png', w: 300, h: 480 },

  // Office outfit set
  officeTopIcon: { path: '/assets/Icons/office_shirt_icon.png', w: 64, h: 64 },
  officeTop: { path: '/assets/Slavic/OfficeOutfit/office_shirt.png', w: 300, h: 480 },
  officeBottomIcon: { path: '/assets/Icons/office_skirt_icon.png', w: 64, h: 64 },
  officeBottom: { path: '/assets/Slavic/OfficeOutfit/office_skirt.png', w: 300, h: 480 },
  officeTightsIcon: { path: '/assets/Icons/office_tights_icon.png', w: 64, h: 64 },
  officeTights: { path: '/assets/Slavic/OfficeOutfit/office_tights.png', w: 300, h: 480 },

  // Military outfit set
  militaryKettleIcon: { path: '/assets/Icons/military_hat.png', w: 64, h: 64 },
  militaryKettle: { path: '/assets/Slavic/MilitaryOutfit/hat.png', w: 300, h: 480 },
  militaryTopIcon: { path: '/assets/Icons/military_jacket.png', w: 64, h: 64 },
  militaryTop: { path: '/assets/Slavic/MilitaryOutfit/jacket.png', w: 300, h: 480 },
  militaryBottomIcon: { path: '/assets/Icons/military_shorts.png', w: 64, h: 64 },
  militaryBottom: { path: '/assets/Slavic/MilitaryOutfit/shorts.png', w: 300, h: 480 },
  militaryTightsIcon: { path: '/assets/Icons/military_tights.png', w: 64, h: 64 },
  militaryTights: { path: '/assets/Slavic/MilitaryOutfit/tights.png', w: 300, h: 480 },

};

// Slot types (mirrors the SlotType enum: Kettle, Top, Bottom, Tights)
export const SlotType = Object.freeze({
  Kettle: 'Kettle',
  Top: 'Top',
  Bottom: 'Bottom',
  Tights: 'Tights',
});

// A colour per placeholder asset key, just so missing art is at least
// visually distinguishable on screen instead of every box being grey.
export const PLACEHOLDER_COLORS = {
  backGround: 0x2b2f3a,
  baseBody: 0xd9b38c,
  hairOverlay: 0x4a2f22,
  heartsPanel: 0x5a1e1e,
  heartIcon: 0xe63946,
  moodBack: 0x333333,
  moodFront: 0xffd166,
  buttonPanel: 0x3a5a40,
  buffPanel: 0x6a4c93,
  monster: 0xef476f,
  closeIcon: 0xaa0000,
  panel: 0x264653,
  scroll: 0x1d3557,
  scrollHandler: 0x457b9d,
  kettleIcon: 0x8d99ae,
  defaultKettle: 0x2a9d8f,
  topIcon: 0x8d99ae,
  defaultTop: 0x000000,
  bottomIcon: 0x8d99ae,
  defaultBottom: 0xc1121f,
  tightsIcon: 0x8d99ae,
  defaultTights: 0x7209b7,
  nakedIcon: 0xaaaaaa,
  hipsterKettleIcon: 0x8d99ae,
  hipsterKettle: 0xffb703,
  hipsterTopIcon: 0x8d99ae,
  hipsterTop: 0x023047,
  hipsterBottomIcon: 0x8d99ae,
  hipsterBottom: 0xfb8500,
  hipsterTightsIcon: 0x8d99ae,
  hipsterTights: 0x8ecae6,
};

/** Потолок плотности пикселей экрана для рендера (баланс резкости и производительности). */
export const MAX_DPR = 3;

/** Текущая плотность рендера: min(devicePixelRatio, MAX_DPR). */
export const getDpr = () => Math.min(window.devicePixelRatio || 1, MAX_DPR);
