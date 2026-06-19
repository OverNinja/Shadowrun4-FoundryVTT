import { genericItemSchema } from '@models/shared';

const fields = foundry.data.fields;

/**
 * @typedef {object} SR4ArmorModSystem
 * @property {number} ballisticBonus
 * @property {number} impactBonus
 * @property {number} capacityCost
 */

export class SR4ArmorModData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...genericItemSchema(),
      ballisticBonus: new fields.NumberField({ initial: 0, integer: true }),
      impactBonus: new fields.NumberField({ initial: 0, integer: true }),
      capacityCost: new fields.NumberField({ initial: 1, integer: true }),
    };
  }
}
