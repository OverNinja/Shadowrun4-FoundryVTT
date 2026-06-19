const fields = foundry.data.fields;

/**
 * @typedef {object} SR4QualitySystem
 * @property {string} description    - Rich-text description.
 * @property {string} notes          - Free-form notes.
 * @property {'Positive'|'Negative'} category - Quality polarity.
 * @property {number} bp             - Build point / karma cost.
 * @property {number|null} limit     - Maximum number of times the quality may be taken.
 * @property {string} source         - Rulebook reference.
 */

/** DataModel for qualities (type: "Quality"). */
export class SR4QualityData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      description: new fields.HTMLField({ initial: '' }),
      notes: new fields.StringField({ initial: '' }),
      category: new fields.StringField({
        initial: 'Positive',
        choices: ['Positive', 'Negative'],
        blank: false,
      }),
      bp: new fields.NumberField({ initial: 0, integer: true }),
      limit: new fields.NumberField({
        initial: null,
        nullable: true,
        integer: true,
      }),
      source: new fields.StringField({ initial: '' }),
    };
  }
}
