import { genericItemSchema } from '@models/shared';

const fields = foundry.data.fields;

/**
 * @typedef {object} SR4WeaponModSystem
 * @property {number} damageBonus
 * @property {number} apBonus
 * @property {number} rcBonus
 * @property {boolean} grantsSmartlink
 * @property {string} modeOverride
 * @property {'top'|'barrel'|'under'|'internal'} mount
 * @property {number} slotCost
 */

export class SR4WeaponModData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...genericItemSchema(),
      damageBonus: new fields.NumberField({ initial: 0, integer: true }),
      apBonus: new fields.NumberField({ initial: 0, integer: true }),
      rcBonus: new fields.NumberField({ initial: 0, integer: true }),
      grantsSmartlink: new fields.BooleanField({ initial: false }),
      modeOverride: new fields.StringField({ initial: '', blank: true }),
      mount: new fields.StringField({
        initial: 'internal',
        choices: ['top', 'barrel', 'under', 'internal'],
        blank: false,
      }),
      slotCost: new fields.NumberField({ initial: 1, integer: true }),
    };
  }
}
