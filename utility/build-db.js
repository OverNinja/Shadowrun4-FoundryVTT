import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Only `skills` and `actions` ship as pre-built compendium sources. All other
// item content (weapons, armor, gear, ammo, spells, programs, …) is created at
// runtime via the in-app XML importer; see utility/examples for the data shapes.
const PACKS = ['skills', 'actions'];

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

for (const pack of PACKS) {
  const inputFile = path.resolve('utility/packs', `${pack}.json`);
  if (!fs.existsSync(inputFile)) {
    console.warn(`Skipping missing source file: ${inputFile}`);
    continue;
  }
  run(`node utility/split-json.js ${pack}`);
  run(`node utility/pack.js ${pack}`);
}

console.log('\nAll packs built.');
