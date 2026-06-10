const fields = foundry.data.fields;
import { conditionMonitorField } from '@models/shared';
import { SR4SheetStatsData } from './basecharacter.model.js';

export class SR4SpiritData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      force: new fields.NumberField({ initial: 3, integer: true }),
      spiritType: new fields.StringField({ initial: '', blank: true }),
      ownerUuid: new fields.StringField({ initial: '', blank: true }),
      services: new fields.NumberField({ initial: 0, integer: true }),
      sheetStats: new SR4SheetStatsData(),
      conditionMonitor: conditionMonitorField(),
      notes: new fields.HTMLField({ initial: '' }),
    };
  }
}
