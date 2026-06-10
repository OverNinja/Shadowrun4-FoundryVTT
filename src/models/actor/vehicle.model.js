const fields = foundry.data.fields;
import { monitorField } from '@models/shared';

export class SR4VehicleData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      description: new fields.HTMLField({ initial: '' }),
      notes: new fields.HTMLField({ initial: '' }),
      cost: new fields.NumberField({ initial: 0, integer: true }),
      availability: new fields.StringField({ initial: '' }),
      legality: new fields.StringField({ initial: '' }),
      vehicleType: new fields.StringField({ initial: '' }),
      body: new fields.NumberField({ initial: 3, integer: true }),
      pilot: new fields.NumberField({ initial: 1, integer: true }),
      response: new fields.NumberField({ initial: 1, integer: true }),
      armor: new fields.NumberField({ initial: 0, integer: true }),
      sensor: new fields.NumberField({ initial: 1, integer: true }),
      handling: new fields.NumberField({ initial: 3, integer: true }),
      speed: new fields.NumberField({ initial: 3, integer: true }),
      accel: new fields.NumberField({ initial: 2, integer: true }),
      riggerUuid: new fields.StringField({ initial: '', blank: true }),
      conditionMonitor: new fields.SchemaField({
        physical: monitorField(),
      }),
    };
  }
}
