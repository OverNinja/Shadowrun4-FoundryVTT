import { genericItemSchema } from '@models/shared';

const fields = foundry.data.fields;

export class SR4AutosoftData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...genericItemSchema(),
      autosoftType: new fields.StringField({
        initial: 'maneuvering',
        blank: false,
      }),
      target: new fields.StringField({ initial: '', blank: true }),
    };
  }
}
