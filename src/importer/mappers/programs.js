/**
 * @fileoverview Pure mapper turning program statblock records into SR4 item data.
 */

import { sourceOf, upper } from './helpers.js';

/**
 * Maps a program record to a "Program" item.
 *
 * @param {Record<string, string | string[]>} record
 * @returns {{ name: string, type: string, system: object }}
 */
export function mapProgram(record) {
  return {
    name: /** @type {string} */ (record.name) ?? 'Unnamed Program',
    type: 'Program',
    system: {
      category: String(record.category ?? '').trim(),
      complexform: upper(record.complexform) === 'YES',
      maxrating: null,
      source: sourceOf(record),
    },
  };
}
