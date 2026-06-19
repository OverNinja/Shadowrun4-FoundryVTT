import { describe, it, expect } from 'vitest';
import { elementToRecord } from '@importer/parse-xml.js';

/**
 * Builds a minimal DOM-like node usable by elementToRecord, which only reads
 * `tagName`, `children` and `textContent`.
 *
 * @param {string} tagName
 * @param {string | Array} value - leaf text, or child nodes
 * @returns {{ tagName: string, children: any[], textContent: string }}
 */
function node(tagName, value) {
  if (Array.isArray(value)) {
    return { tagName, children: value, textContent: '' };
  }
  return { tagName, children: [], textContent: value };
}

describe('elementToRecord', () => {
  it('reads leaf children as strings', () => {
    const el = node('weapon', [
      node('name', 'Ares Predator'),
      node('ap', '-1'),
    ]);
    expect(elementToRecord(el)).toEqual({ name: 'Ares Predator', ap: '-1' });
  });

  it('reads repeated same-tag children as an array', () => {
    const el = node('skill', [
      node('specs', [node('spec', 'Pistols'), node('spec', 'Rifles')]),
    ]);
    expect(elementToRecord(el)).toEqual({ specs: ['Pistols', 'Rifles'] });
  });

  it('reads a single-child block as a nested object, not an array', () => {
    const el = node('gear', [
      node('name', 'Ammo: APDS'),
      node('weaponbonus', [node('ap', '-4')]),
    ]);
    expect(elementToRecord(el)).toEqual({
      name: 'Ammo: APDS',
      weaponbonus: { ap: '-4' },
    });
  });

  it('reads a multi-child block with distinct tags as a nested object', () => {
    const el = node('gear', [
      node('weaponbonus', [
        node('ap', '2'),
        node('damage', '-1'),
        node('damagetype', 'S'),
      ]),
    ]);
    expect(elementToRecord(el)).toEqual({
      weaponbonus: { ap: '2', damage: '-1', damagetype: 'S' },
    });
  });
});
