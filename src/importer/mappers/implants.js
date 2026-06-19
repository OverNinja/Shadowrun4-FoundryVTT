/**
 * @fileoverview Pure mappers turning cyberware/bioware statblock records into
 * SR4 "Implant" item data.
 */

import {
  commerceFields,
  parseDecimal,
  parseNumber,
  sourceOf,
} from './helpers.js';

/**
 * Maps an implant record to an "Implant" item of the given implant type.
 *
 * @param {Record<string, unknown>} record
 * @param {string} implantType - 'cyberware' or 'bioware'.
 * @returns {{ name: string, type: string, system: object }}
 */
function mapImplant(record, implantType) {
  const essence = parseDecimal(record.ess, 0);
  return {
    name: /** @type {string} */ (record.name) ?? 'Unnamed Implant',
    type: 'Implant',
    system: {
      essence,
      essenceActual: essence,
      capacity: parseNumber(record.capacity, 0),
      grade: 'standard',
      type: implantType,
      rating: parseNumber(record.rating, 0),
      ...commerceFields(record),
      source: sourceOf(record),
    },
  };
}

/**
 * Maps a cyberware record to an "Implant" item.
 *
 * @param {Record<string, unknown>} record
 * @returns {{ name: string, type: string, system: object }}
 */
export function mapCyberware(record) {
  return mapImplant(record, 'cyberware');
}

/**
 * Maps a bioware record to an "Implant" item.
 *
 * @param {Record<string, unknown>} record
 * @returns {{ name: string, type: string, system: object }}
 */
export function mapBioware(record) {
  return mapImplant(record, 'bioware');
}
