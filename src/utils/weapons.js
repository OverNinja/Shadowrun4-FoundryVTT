/**
 * @param {import('@documents/index').SR4Actor} actor
 * @param {string} weaponId
 */
export async function reloadWeapon(actor, weaponId) {
  const weapon = actor.items.get(weaponId);
  if (!weapon || weapon.system.maxAmmo === 0) return;
  if (weapon.system.currentAmmo >= weapon.system.maxAmmo) return;
  await weapon.update({ 'system.currentAmmo': weapon.system.maxAmmo });
}
