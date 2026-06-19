/**
 * @fileoverview Pure mapper turning armor statblock records into SR4 item data.
 */

import { commerceFields, parseNumber, sourceOf } from './helpers.js';

/**
 * Maps an armor record to an "Armor" item.
 *
 * @param {Record<string, string | string[]>} record
 * @returns {{ name: string, type: string, system: object }}
 */
export function mapArmor(record) {
  return {
    name: /** @type {string} */ (record.name) ?? 'Unnamed Armor',
    type: 'Armor',
    system: {
      ballisticarmor: parseNumber(record.b, 0),
      impactarmor: parseNumber(record.i, 0),
      capacity: parseNumber(record.armorcapacity, 0),
      ...commerceFields(record),
      source: sourceOf(record),
    },
  };
}
