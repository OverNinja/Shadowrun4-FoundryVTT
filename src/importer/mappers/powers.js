/**
 * @fileoverview Pure mapper turning adept power statblock records into SR4 item
 * data.
 */

import { parseDecimal, sourceOf, upper } from './helpers.js';

/**
 * Maps an adept power record to a "Power" item. Powers flagged as having levels
 * use a per-level Power Point cost (`ratingMode: 'rated'`).
 *
 * @param {Record<string, unknown>} record
 * @returns {{ name: string, type: string, system: object }}
 */
export function mapPower(record) {
  const leveled = upper(record.levels) === 'YES';
  return {
    name: /** @type {string} */ (record.name) ?? 'Unnamed Power',
    type: 'Power',
    system: {
      cost: parseDecimal(record.points, 0),
      ratingMode: leveled ? 'rated' : 'none',
      rating: 1,
      geas: false,
      source: sourceOf(record),
    },
  };
}
