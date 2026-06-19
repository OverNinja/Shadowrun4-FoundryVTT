# Item data shape examples

Each `*.example.json` file shows the structure of a single item entry per type,
as produced for the system's item DataModels. They are **reference only** and are
not consumed by the build (`utility/build-db.js` only packs `skills`).

Item content (weapons, armor, gear, ammo, spells, programs) is created at runtime
through the in-app XML importer, which maps external XML statblocks onto these
same `system` shapes. Use these files when adjusting a mapper in
`src/importer/mappers/` to verify the expected target fields.
