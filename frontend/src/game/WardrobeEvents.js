/**
 * Справочник имён событий гардероба.
 * Вынесен отдельно, чтобы React и Phaser не опечатывались в строках.
 *
 * Направление:
 *   OPEN / CLOSE / SELECT  ->  React отправляет, Phaser принимает
 *   STATE / HEARTS         ->  Phaser отправляет, React принимает
 */
export const WardrobeEvents = Object.freeze({
  OPEN: 'wardrobe:open',
  CLOSE: 'wardrobe:close',
  SELECT: 'wardrobe:select',
  STATE: 'wardrobe:state',
  HEARTS: 'wardrobe:hearts',
});
