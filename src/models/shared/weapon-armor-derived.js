/**
 * Single source of truth for weapon and armor "effective stat" math.
 *
 * These are pure functions: they take already-resolved data (system data +
 * an array of installed-mod system data) and return derived numbers. They
 * have NO knowledge of Foundry Documents, actors, or item lookups — that
 * resolution is the caller's job, because the two call sites resolve mods
 * differently:
 *
 *   - DataModel#prepareDerivedData() resolves mods via `actor.items.get(id)`
 *     (live Documents, walked at runtime).
 *   - Sheet context builders (e.g. buildWeaponContext/buildArmorContext)
 *     resolve mods via a Map built from a flat `toObject()` item array.
 *
 * Keeping resolution out of this module is what lets both call sites share
 * the exact same formula without forcing one of them into the other's data
 * shape.
 */

export const AP_HALF_TYPES = new Set([
  'ELECTRICITY',
  'FIRE',
  'LASER',
  'STUN_HALF',
]);

const EXTERNAL_MOUNTS = new Set(['top', 'barrel', 'under']);

/**
 * @param {any[]} mods - resolved mod system-data-bearing objects (each must have `.system`)
 */
export function hasExternalMountConflict(mods) {
  const seen = new Set();
  for (const m of mods) {
    const mount = m.system?.mount;
    if (!EXTERNAL_MOUNTS.has(mount)) continue;
    if (seen.has(mount)) return true;
    seen.add(mount);
  }
  return false;
}

function computeUsedModSlots(mods) {
  return mods
    .filter((m) => !EXTERNAL_MOUNTS.has(m.system?.mount))
    .reduce((a, m) => a + (m.system?.slotCost ?? 0), 0);
}

/**
 * Filters a raw resolved-item array down to ones of a given type, as a
 * defensive narrowing step. Mirrors the `m?.type === 'Weapon Mod'` guard
 * that lived in the DataModel, now shared so context builders get the same
 * protection against stale/mistyped ids.
 *
 * @param {any[]} items
 * @param {string} type
 */
export function filterModsByType(items, type) {
  return (items ?? []).filter((m) => m?.type === type);
}

/**
 * Sums a numeric `system[key]` field across a list of resolved mods.
 * @param {any[]} mods
 * @param {string} key
 */
export function sumModField(mods, key) {
  return mods.reduce((a, m) => a + (m.system?.[key] ?? 0), 0);
}

/**
 * @param {any[]} mods - resolved mods (each `{ system: {...}, cost?, ... }`)
 * @param {number} [baseCost]
 */
function computeTotalCost(mods, baseCost) {
  return (baseCost ?? 0) + mods.reduce((a, m) => a + (m.system?.cost ?? 0), 0);
}

/**
 * Computes effective stats for a ranged weapon.
 *
 * @param {object} system - the weapon's system data (damage, ap, rc, smartlink, damageType, armorType, cost, ...)
 * @param {object|null} ammo - resolved loaded-ammo data, or null. Shape: `{ name, system: { damageOverride?, damageBonus?, apBonus?, damageTypeOverride? } }`
 * @param {any[]} mods - resolved installed Weapon Mod items (each with `.system`)
 * @returns {{
 *   effectiveDamage: number, effectiveAP: number, effectiveRC: number,
 *   effectiveSmartlink: boolean, effectiveDamageType: string, effectiveApHalf: boolean,
 *   effectiveArmorType: string, loadedAmmoName: string|null,
 *   usedModSlots: number, modSlotWarning: boolean, totalCost: number,
 * }}
 */
export function computeRangedWeaponDerived(system, ammo, mods) {
  const ammoDamageOverride = ammo?.system?.damageOverride;

  const modDamageBonus = sumModField(mods, 'damageBonus');
  const effectiveDamage = Math.max(
    0,
    typeof ammoDamageOverride === 'number'
      ? ammoDamageOverride
      : (system.damage ?? 0) + (ammo?.system?.damageBonus ?? 0) + modDamageBonus
  );
  const effectiveAP =
    (system.ap ?? 0) +
    (ammo?.system?.apBonus ?? 0) +
    sumModField(mods, 'apBonus');
  const effectiveRC = (system.rc ?? 0) + sumModField(mods, 'rcBonus');
  const effectiveSmartlink =
    !!system.smartlink || mods.some((m) => m.system?.grantsSmartlink);
  const effectiveDamageType =
    ammo?.system?.damageTypeOverride || system.damageType || '';
  const effectiveApHalf = AP_HALF_TYPES.has(effectiveDamageType);
  const effectiveArmorType = effectiveApHalf
    ? 'impact'
    : (system.armorType ?? 'ballistic');

  const usedModSlots = computeUsedModSlots(mods);

  return {
    effectiveDamage,
    effectiveAP,
    effectiveRC,
    effectiveSmartlink,
    effectiveDamageType,
    effectiveApHalf,
    effectiveArmorType,
    loadedAmmoName: ammo?.name ?? null,
    usedModSlots,
    modSlotWarning:
      hasExternalMountConflict(mods) || usedModSlots > (system.modSlots ?? 6),
    totalCost: computeTotalCost(mods, system.cost),
  };
}

/**
 * Computes effective stats for a melee weapon.
 *
 * @param {object} system - the weapon's system data (damage, ap, attackSkill, noStrengthBonus, damageType, armorType, cost, ...)
 * @param {any[]} mods - resolved installed Weapon Mod items (each with `.system`)
 * @param {{ strengthBonus?: number, meleeDamageModifier?: number, unarmedDamageModifier?: number }} [modifiers]
 *   Caller-supplied source values. The DataModel derives `strengthBonus` from
 *   `actor.getAttribute('STRENGTH')` directly; the sheet context builder
 *   instead receives a pre-calculated `meleeDmgBonus`. Both are passed in
 *   here as the same named param so the formula itself never has to know
 *   which source produced the number.
 */
export function computeMeleeWeaponDerived(
  system,
  mods,
  { strengthBonus = 0, meleeDamageModifier = 0, unarmedDamageModifier = 0 } = {}
) {
  const strBonus = system.noStrengthBonus ? 0 : strengthBonus;
  const unarmedMod =
    system.attackSkill === 'unarmedcombat' ? unarmedDamageModifier : 0;

  const effectiveDamage = Math.max(
    0,
    (system.damage ?? 0) +
      strBonus +
      meleeDamageModifier +
      unarmedMod +
      sumModField(mods, 'damageBonus')
  );
  const effectiveAP = (system.ap ?? 0) + sumModField(mods, 'apBonus');
  const effectiveDamageType = system.damageType || '';
  const effectiveApHalf = AP_HALF_TYPES.has(effectiveDamageType);
  const effectiveArmorType = effectiveApHalf
    ? 'impact'
    : (system.armorType ?? 'impact');

  const usedModSlots = computeUsedModSlots(mods);

  return {
    effectiveDamage,
    effectiveAP,
    effectiveDamageType,
    effectiveApHalf,
    effectiveArmorType,
    usedModSlots,
    modSlotWarning:
      hasExternalMountConflict(mods) || usedModSlots > (system.modSlots ?? 6),
    totalCost: computeTotalCost(mods, system.cost),
  };
}

/**
 * Computes effective stats for a piece of armor.
 *
 * @param {object} system - armor system data (ballisticarmor, impactarmor, capacity, cost, ...)
 * @param {any[]} mods - resolved installed Armor Mod items (each with `.system`)
 * @returns {{
 *   effectiveBallistic: number, effectiveImpact: number, maxCapacity: number,
 *   usedCapacity: number, capacityWarning: boolean, totalCost: number,
 * }}
 */
export function computeArmorDerived(system, mods) {
  const ballistic = system.ballisticarmor ?? 0;
  const impact = system.impactarmor ?? 0;

  const effectiveBallistic = ballistic + sumModField(mods, 'ballisticBonus');
  const effectiveImpact = impact + sumModField(mods, 'impactBonus');
  const maxCapacity = system.capacity ?? Math.max(ballistic, impact);
  const usedCapacity = sumModField(mods, 'capacityCost');
  const capacityWarning = usedCapacity > maxCapacity;

  return {
    effectiveBallistic,
    effectiveImpact,
    maxCapacity,
    usedCapacity,
    capacityWarning,
    totalCost: computeTotalCost(mods, system.cost),
  };
}
