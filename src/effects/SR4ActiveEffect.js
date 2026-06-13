import { EFFECT_TEMPLATES } from './effect.templates.js';

export class SR4ActiveEffect extends foundry.documents.ActiveEffect {
  get isTemporary() {
    return (
      this.statuses.size > 0 ||
      !!this.flags?.sr4?.showOnToken ||
      super.isTemporary
    );
  }

  /**
   * Creates an ActiveEffect on `parent` from a named template.
   * @param {string} key - Key into EFFECT_TEMPLATES
   * @param {foundry.documents.Actor} parent
   * @param {Record<string, unknown>} [overrides] - Top-level fields shallow-merged onto the template clone.
   *   Nested keys (e.g. `duration`) replace the template value wholesale; they are not deep-merged.
   * @returns {Promise<SR4ActiveEffect>}
   */
  static fromTemplate(key, parent, overrides = {}) {
    const template = EFFECT_TEMPLATES[key];
    if (!template) throw new Error(`Unknown SR4 effect template: ${key}`);
    const data = { ...foundry.utils.deepClone(template), ...overrides };
    data.name = game.i18n.localize(data.name);
    return this.create(data, { parent });
  }
}
