/**
 * @fileoverview Browser-only XML parsing layer for the statblock importer.
 * Relies on the runtime `DOMParser`; kept separate from the pure mappers so the
 * mappers stay unit-testable under Node.
 */

import { TAG_CONFIGS } from './registry.js';

/**
 * Distinct XML element names the importer knows how to read.
 * @type {string[]}
 */
const KNOWN_TAGS = [...new Set(TAG_CONFIGS.map((c) => c.xmlTag))];

/**
 * Converts a single statblock element into a record. Leaf children become
 * string values. A child with multiple children that all share one tag name
 * (e.g. `specs/spec`, `mods/mod`) becomes a string array; any other child with
 * element children (including single-child blocks like `weaponbonus/ap`)
 * becomes a nested record so individual values stay addressable.
 *
 * @param {Element} element
 * @returns {Record<string, unknown>}
 */
export function elementToRecord(element) {
  /** @type {Record<string, unknown>} */
  const record = {};
  for (const child of element.children) {
    const key = child.tagName;
    const nested = [...child.children];
    if (nested.length === 0) {
      record[key] = child.textContent?.trim() ?? '';
    } else if (
      nested.length > 1 &&
      new Set(nested.map((n) => n.tagName)).size === 1
    ) {
      record[key] = nested.map((n) => n.textContent?.trim() ?? '');
    } else {
      record[key] = elementToRecord(child);
    }
  }
  return record;
}

/**
 * Parses an XML string into per-tag record arrays. The document root is never
 * inspected, so any container layout is accepted.
 *
 * @param {string} xmlString
 * @returns {Record<string, Array<Record<string, unknown>>>}
 * @throws {Error} When the XML is malformed.
 */
export function extractRecords(xmlString) {
  const doc = new DOMParser().parseFromString(xmlString, 'application/xml');
  const error = doc.querySelector('parsererror');
  if (error) {
    throw new Error(error.textContent?.trim() || 'Invalid XML document.');
  }

  /** @type {Record<string, Array<Record<string, unknown>>>} */
  const result = {};
  const root = doc.documentElement;
  for (const tag of KNOWN_TAGS) {
    const elements = [...root.querySelectorAll(`:scope > * > ${tag}`)];
    if (elements.length > 0) result[tag] = elements.map(elementToRecord);
  }
  return result;
}
