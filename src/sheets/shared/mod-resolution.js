/**
 * Shared helper for resolving "installed mods" + "available mods" pairs from
 * a flat item array, used by both the actor-sheet context builders
 * (buildWeaponContext/buildArmorContext) and SR4ItemSheet#_prepareContext.
 *
 * This is the single place that knows how to go from
 * `installedModIds + a pool of mod items` to:
 *   - the resolved installed mod objects (for cost/stat math)
 *   - the "available to install" list (pool minus already-installed)
 *
 * Previously this logic was hand-duplicated per mod type (Weapon Mod,
 * Armor Mod, and — eventually — Vehicle Mod), differing only in the type
 * string and a couple of property names. Any behavioral change (sort order,
 * capacity validation, filtering orphaned mods, etc.) now only needs to
 * happen here.
 */

/**
 * @param {{ id: string, name: string, system: any }[]} modPool - all mod items of the relevant type, already mapped to {id, name, system}
 * @param {string[]} installedModIds
 * @param {Set<string>} [allClaimedIds] - IDs claimed by ANY host item; when provided, available = pool minus claimed (prevents double-install across hosts)
 * @returns {{
 *   installedMods: { id: string, name: string, system: any }[],
 *   availableMods: { id: string, name: string, system: any }[],
 * }}
 */
export function resolveModsAndAvailability(
  modPool,
  installedModIds,
  allClaimedIds
) {
  const modById = new Map(modPool.map((m) => [m.id, m]));
  const claimed = allClaimedIds ?? new Set(installedModIds ?? []);

  const installedMods = (installedModIds ?? [])
    .map((id) => modById.get(id))
    .filter(Boolean);

  const availableMods = modPool.filter((m) => !claimed.has(m.id));

  return { installedMods, availableMods };
}

/**
 * Builds a `{id, name, system}` mod pool from a flat item array (e.g. the
 * output of `actor.toObject(false).items`), filtered to one item type.
 *
 * @param {any[]} items
 * @param {string} type - e.g. 'Weapon Mod', 'Armor Mod', 'Vehicle Mod'
 */
export function buildModPoolFromItems(items, type) {
  return items
    .filter((i) => i.type === type)
    .map((i) => ({ id: i._id, name: i.name, system: i.system }));
}

/**
 * Builds a `{id, name, system}` mod pool from live actor-embedded items
 * (e.g. `actor.items`), filtered to one item type. Used by sheets that
 * operate on a single Document (SR4ItemSheet) rather than a flat array.
 *
 * @param {any} actorItemsCollection - a Foundry EmbeddedCollection (actor.items)
 * @param {string} type
 */
export function buildModPoolFromCollection(actorItemsCollection, type) {
  return actorItemsCollection
    .filter((i) => i.type === type)
    .map((i) => ({ id: i.id, name: i.name, system: i.system }));
}
