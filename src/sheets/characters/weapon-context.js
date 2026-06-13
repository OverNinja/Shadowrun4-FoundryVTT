import {
  Attackskill,
  DamageTypes,
  Shootingmodes,
  AP_HALF_TYPES,
} from '@models/index';

/**
 * Maps raw item source data into weapon view-model objects for character/NPC sheets.
 * Computes all five effective fields (damage, AP, damageType, apHalf, armorType)
 * from stored source data + loaded ammo, mirroring SR4RangedWeaponData.prepareDerivedData().
 *
 * @param {any[]} items - Flat item array from actor.toObject(false)
 * @returns {any[]}
 */
export function buildWeaponContext(items) {
  const availableAmmo = items
    .filter((i) => i.type === 'Ammo')
    .map((i) => ({ id: i._id, name: i.name, system: i.system }));
  const ammoById = new Map(availableAmmo.map((a) => [a.id, a]));

  return items
    .filter((i) => i.type === 'Ranged Weapon' || i.type === 'Melee Weapon')
    .map((w) => {
      const loadedAmmoItem =
        w.type === 'Ranged Weapon' && w.system?.loadedAmmoId
          ? (ammoById.get(w.system.loadedAmmoId) ?? null)
          : null;

      const effectiveDamage =
        (w.system?.damage ?? 0) + (loadedAmmoItem?.system.damageBonus ?? 0);
      const effectiveAP =
        (w.system?.ap ?? 0) + (loadedAmmoItem?.system.apBonus ?? 0);
      const effectiveDamageType =
        loadedAmmoItem?.system.damageTypeOverride || w.system?.damageType || '';
      const effectiveApHalf = AP_HALF_TYPES.has(effectiveDamageType);
      const effectiveArmorType = effectiveApHalf
        ? 'impact'
        : (w.system?.armorType ?? '');

      return {
        ...w,
        system: {
          ...w.system,
          effectiveDamage,
          effectiveAP,
          effectiveDamageType,
          effectiveApHalf,
          effectiveArmorType,
        },
        displayAttackSkill:
          Attackskill[w.system?.attackSkill] ?? w.system?.attackSkill ?? '',
        displayDamageType:
          DamageTypes[effectiveDamageType] ?? effectiveDamageType ?? '',
        displayMode: Shootingmodes[w.system?.mode] ?? w.system?.mode ?? '',
        availableAmmo: w.type === 'Ranged Weapon' ? availableAmmo : [],
        loadedAmmo: loadedAmmoItem
          ? {
              name: loadedAmmoItem.name,
              damageBonus: loadedAmmoItem.system.damageBonus ?? 0,
              apBonus: loadedAmmoItem.system.apBonus ?? 0,
              displayDamageTypeOverride: loadedAmmoItem.system
                .damageTypeOverride
                ? (DamageTypes[loadedAmmoItem.system.damageTypeOverride] ??
                  loadedAmmoItem.system.damageTypeOverride)
                : null,
              quantity: loadedAmmoItem.system.quantity ?? 0,
            }
          : null,
      };
    });
}
