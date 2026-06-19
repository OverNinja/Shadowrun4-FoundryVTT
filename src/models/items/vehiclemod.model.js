import { genericItemSchema } from '@models/shared';

const fields = foundry.data.fields;

/**
 * @typedef {object} SR4VehicleModSystem
 * @property {number} handlingBonus
 * @property {number} speedBonus
 * @property {number} accelBonus
 * @property {number} armorBonus
 * @property {number} sensorBonus
 * @property {number} bodyBonus
 * @property {number} pilotBonus
 * @property {number} slotCost
 */

export class SR4VehicleModData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...genericItemSchema(),
      handlingBonus: new fields.NumberField({ initial: 0, integer: true }),
      speedBonus: new fields.NumberField({ initial: 0, integer: true }),
      accelBonus: new fields.NumberField({ initial: 0, integer: true }),
      armorBonus: new fields.NumberField({ initial: 0, integer: true }),
      sensorBonus: new fields.NumberField({ initial: 0, integer: true }),
      bodyBonus: new fields.NumberField({ initial: 0, integer: true }),
      pilotBonus: new fields.NumberField({ initial: 0, integer: true }),
      slotCost: new fields.NumberField({ initial: 1, integer: true }),
    };
  }
}
