/**
 * @fileoverview Shared pure helpers for the XML statblock mappers.
 * No DOM or Foundry dependencies — safe to unit test under Node.
 */

/**
 * Maps a weapon category to the system attack-skill key.
 * Values mirror the uppercase keys used by the shipped weapon compendia
 * (see `Attackskill` in `@models/items/weapons.model`).
 *
 * @type {Record<string, string>}
 */
export const CATEGORY_TO_ATTACKSKILL = {
  Blades: 'BLADES',
  Clubs: 'CLUBS',
  'Exotic Melee Weapons': 'EXOTIC_MELEE',
  'Exotic Ranged Weapons': 'EXOTIC_RANGED',
  Unarmed: 'UNARMED',
  Bows: 'ARCHERY',
  Crossbows: 'ARCHERY',
  'Throwing Weapons': 'THROWING',
  Tasers: 'PISTOLS',
  Holdouts: 'PISTOLS',
  'Light Pistols': 'PISTOLS',
  'Heavy Pistols': 'PISTOLS',
  'Machine Pistols': 'AUTOMATICS',
  'Submachine Guns': 'AUTOMATICS',
  'Assault Rifles': 'AUTOMATICS',
  'Battle Rifles': 'LONGARMS',
  'Sports Rifles': 'LONGARMS',
  'Sniper Rifles': 'LONGARMS',
  Shotguns: 'LONGARMS',
  'Special Weapons': 'HEAVY_WEAPONS',
  'Light Machine Guns': 'HEAVY_WEAPONS',
  'Medium Machine Guns': 'HEAVY_WEAPONS',
  'Heavy Machine Guns': 'HEAVY_WEAPONS',
  'Assault Cannons': 'HEAVY_WEAPONS',
  Flamethrowers: 'HEAVY_WEAPONS',
  'Laser Weapons': 'HEAVY_WEAPONS',
  'Grenade Launchers': 'HEAVY_WEAPONS',
  'Mortar Launchers': 'HEAVY_WEAPONS',
  'Missile Launchers': 'HEAVY_WEAPONS',
  'Vehicle Weapons': 'HEAVY_WEAPONS',
};

/**
 * Maps a three-letter attribute abbreviation to the full uppercase key
 * used by the system stat block.
 *
 * @type {Record<string, string>}
 */
export const ATTRIBUTE_ABBR_TO_KEY = {
  BOD: 'BODY',
  AGI: 'AGILITY',
  REA: 'REACTION',
  STR: 'STRENGTH',
  WIL: 'WILLPOWER',
  LOG: 'LOGIC',
  INT: 'INTUITION',
  CHA: 'CHARISMA',
  EDG: 'EDGE',
  ESS: 'ESSENCE',
  MAG: 'MAGIC',
  RES: 'RESONANCE',
};

/**
 * Extracts the first signed integer from a string.
 * Symbolic values such as "-", "-half" or "Variable(…)" yield the fallback.
 *
 * @param {unknown} value
 * @param {number} [fallback=0]
 * @returns {number}
 */
export function parseNumber(value, fallback = 0) {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return fallback;
  const match = value.match(/[+-]?\d+/);
  return match ? parseInt(match[0], 10) : fallback;
}

/**
 * Extracts the first decimal number from a string. Formula values such as
 * "Rating * 0.01" yield the first numeric literal (0.01) as a best estimate.
 *
 * @param {unknown} value
 * @param {number} [fallback=0]
 * @returns {number}
 */
export function parseDecimal(value, fallback = 0) {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return fallback;
  const match = value.match(/\d*\.\d+|\d+/);
  return match ? parseFloat(match[0]) : fallback;
}

/**
 * Combines a source book and page into a single citation string.
 *
 * @param {string} [source]
 * @param {string} [page]
 * @returns {string}
 */
export function formatSource(source, page) {
  const book = (source ?? '').trim();
  const pg = (page ?? '').trim();
  if (book && pg && pg !== '0') return `${book} p. ${pg}`;
  return book;
}

/**
 * Resolves the citation string from a statblock record's `source`/`page` fields.
 *
 * @param {Record<string, unknown>} record
 * @returns {string}
 */
export function sourceOf(record) {
  return formatSource(
    /** @type {string} */ (record.source),
    /** @type {string} */ (record.page)
  );
}

/**
 * Extracts the cost/availability fields shared by all purchasable items.
 *
 * @param {Record<string, unknown>} record
 * @returns {{ cost: number, avail: number, availability: string }}
 */
export function commerceFields(record) {
  return {
    cost: parseNumber(record.cost, 0),
    avail: parseNumber(record.avail, 0),
    availability: String(record.avail ?? '').trim(),
  };
}

/**
 * Trims and upper-cases a record value, treating nullish as empty.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function upper(value) {
  return String(value ?? '')
    .trim()
    .toUpperCase();
}

/**
 * @typedef {object} ParsedDamage
 * @property {number} damage
 * @property {string} damageType - One of PHYSICAL, STUN, ELECTRICITY, FIRE.
 * @property {boolean} strengthBased - True for Strength-scaling melee damage.
 */

/**
 * Parses a weapon damage code (e.g. "5S(e)", "6P", "(STR/2+1)P").
 *
 * @param {string} [raw]
 * @returns {ParsedDamage}
 */
export function parseDamage(raw) {
  const str = (raw ?? '').trim();
  if (!str) return { damage: 0, damageType: 'PHYSICAL', strengthBased: false };

  const strengthBased = /STR/i.test(str);
  let damage;
  if (strengthBased) {
    const offset = str.match(/STR\s*\/\s*2\s*([+-]\s*\d+)/i);
    damage = offset ? parseInt(offset[1].replace(/\s+/g, ''), 10) : 0;
  } else {
    const match = str.match(/\d+/);
    damage = match ? parseInt(match[0], 10) : 0;
  }

  let damageType;
  if (/\(e\)/i.test(str)) damageType = 'ELECTRICITY';
  else if (/\(f\)/i.test(str)) damageType = 'FIRE';
  else {
    const code = str.replace(/STR/gi, '').replace(/\([^)]*\)/g, '');
    damageType = /S/i.test(code) && !/P/i.test(code) ? 'STUN' : 'PHYSICAL';
  }

  return { damage, damageType, strengthBased };
}

/**
 * @typedef {object} ParsedAmmo
 * @property {number} capacity
 * @property {string} feed - Magazine feed abbreviation (e.g. "c", "m", "cy").
 */

/**
 * Parses a magazine string (e.g. "30(c)", "1(m)", "10(c) or external source").
 *
 * @param {string} [raw]
 * @returns {ParsedAmmo}
 */
export function parseAmmo(raw) {
  const str = (raw ?? '').trim();
  const multi = str.match(/(\d+)\s*x\s*(\d+)/i);
  const capacity = multi
    ? parseInt(multi[1], 10) * parseInt(multi[2], 10)
    : parseNumber(str, 0);
  const feed = str.match(/\(([a-z]+)\)/i);
  return { capacity, feed: feed ? feed[1].toLowerCase() : '' };
}

/**
 * Normalises a firing mode string; the placeholder "0" becomes empty.
 *
 * @param {string} [raw]
 * @returns {string}
 */
export function normalizeMode(raw) {
  const str = (raw ?? '').trim();
  return str === '0' ? '' : str;
}
