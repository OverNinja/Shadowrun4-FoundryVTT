/**
 * @fileoverview Pure mapper turning quality statblock records into SR4 item data.
 */

import { parseNumber, sourceOf } from './helpers.js';

/**
 * Maps a quality record to a "Quality" item. The Chummer `bonus`, `required`
 * and `forbidden` blocks are intentionally ignored; automation is handled
 * manually via ActiveEffects, as elsewhere in the system.
 *
 * @param {Record<string, string | string[]>} record
 * @returns {{ name: string, type: string, system: object }}
 */
export function mapQuality(record) {
  const category = String(record.category ?? '').trim();
  return {
    name: /** @type {string} */ (record.name) ?? 'Unnamed Quality',
    type: 'Quality',
    system: {
      category: category === 'Negative' ? 'Negative' : 'Positive',
      bp: parseNumber(record.bp, 0),
      limit: null,
      source: sourceOf(record),
    },
  };
}
