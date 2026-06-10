import { SpellcastingFlow } from '@flows/index';
import { Attackskill } from '@models/index';
import { computeDerivedStats } from './derivedStats.mapper';
import { getGame } from '@utils/index';
import { SR4ActiveEffect } from '@effects/index';

/** @type {import('@models/index').SR4SheetStats} */
const DEFAULT_STATS = {
  BODY: 0,
  AGILITY: 0,
  REACTION: 0,
  STRENGTH: 0,
  CHARISMA: 0,
  INTUITION: 0,
  LOGIC: 0,
  WILLPOWER: 0,
  MAGIC: 0,
  RESONANCE: 0,
  EDGE: 0,
  CURRENTEDGE: 0,
  ESSENCE: 0,
  INITIATIVE: 0,
  ASTRALINITIATIVE: 0,
  MATRIXINITIATIVE: 0,
};

/**
 * @interface SR4Actor
 * @property {import('@models/index').SR4BaseCharacterSystem} system
 * @property {string} type
 */
export class SR4Actor extends foundry.documents.Actor {
  get actor() {
    return this;
  }

  prepareDerivedData() {
    // TODO: Spirits and NPCs also carry sheetStats — extend this when their
    // derived stats (wound modifier, augmented maximums) need computing too.
    if (this.type !== 'character') return;
    /** @type {any} */
    const self = this;
    /** @type {import('@models/index').SR4BaseCharacterSystem} */
    const systemData = self.system;
    if (!systemData?.sheetStats) return;

    /** @type {any[]} */
    const equipped = self.items.filter(
      (i) => i.type === 'Armor' && i.system?.equipped === true
    );

    const armorBonus = {
      ballistic: systemData.armor.ballistic,
      impact: systemData.armor.impact,
    };
    systemData.armor.ballistic =
      equipped.reduce((s, i) => s + (i.system.ballisticarmor || 0), 0) +
      armorBonus.ballistic;
    systemData.armor.impact =
      equipped.reduce((s, i) => s + (i.system.impactarmor || 0), 0) +
      armorBonus.impact;

    const derived = computeDerivedStats(systemData);
    Object.assign(systemData.derivedStats, derived);
  }

  /** @returns {import('@models/index').SR4SheetStats} */
  get sheetStats() {
    /** @type {any} */
    const self = this;
    /** @type {import('@models/index').SR4BaseCharacterSystem} */
    const sys = self.system;
    return sys.sheetStats ?? DEFAULT_STATS;
  }

  /** @returns {number} */
  get dicePoolModifier() {
    /** @type {any} */
    const self = this;
    /** @type {import('@models/index').SR4BaseCharacterSystem} */
    const sys = self.system;
    return sys.derivedStats?.dicePoolModifier ?? 0;
  }

  /**
   * @param {keyof import('@models/index').SR4SheetStats} attribute
   * @returns {number}
   */
  getAttribute(attribute) {
    return this.sheetStats[attribute] ?? 0;
  }

  async useEdge() {
    if (this.sheetStats.CURRENTEDGE > 0) {
      /** @type {any} */
      const self = this;
      await self.update({
        system: {
          sheetStats: { CURRENTEDGE: this.sheetStats.CURRENTEDGE - 1 },
        },
      });
    }
  }

  /**
   * @param {number} [newEdge]
   */
  async resetEdge(newEdge) {
    /** @type {any} */
    const self = this;
    await self.update({
      system: { sheetStats: { CURRENTEDGE: newEdge ?? this.sheetStats.EDGE } },
    });
  }

  /**
   * @param {string} skillName
   * @returns {import('@models/index').SR4Skill | null}
   */
  getSkill(skillName) {
    /** @type {any} */
    const self = this;
    return (
      self.items.find(
        (item) =>
          item.type === 'Skill' &&
          item.name.toLowerCase() === skillName.toLowerCase()
      ) ?? null
    );
  }

  /**
   * @param {string} skillKey
   * @returns {import('@models/index').SR4Skill | undefined}
   */
  findByAttackSkill(skillKey) {
    const label = Attackskill[skillKey];
    /** @type {any} */
    const self = this;
    return self.items.find(
      (item) => item.type === 'Skill' && item.system.label === label
    );
  }

  /**
   * @param {import('@models/index').SR4Skill} skill
   * @returns {string|undefined}
   */
  getSkillTranslatedLabelOrName(skill) {
    return skill.system.label
      ? getGame().i18n?.localize(skill.system.label)
      : skill.name;
  }

  /**
   * @param {string} spellId
   * @returns {Promise<void>}
   */
  async castSpell(spellId) {
    const spell = this.items.get(spellId);
    if (!spell) return;
    await SpellcastingFlow.start(this, spell);
  }

  /**
   * Toggles the disabled state of an ActiveEffect.
   * @param {string} effectId
   * @returns {Promise<SR4ActiveEffect|undefined>}
   */
  async toggleEffect(effectId) {
    const effect = this.effects.get(effectId);
    if (!effect) return;
    return effect.update({ disabled: !effect.disabled });
  }

  /**
   * Creates a new ActiveEffect on this actor from a named template.
   * Multiple calls stack independently (e.g. one per sustained spell).
   * @param {string} templateKey - Key into EFFECT_TEMPLATES (e.g. 'sustain')
   * @returns {Promise<SR4ActiveEffect>}
   */
  async applyEffectTemplate(templateKey) {
    return SR4ActiveEffect.fromTemplate(templateKey, this);
  }

  async updateTokenAppearance() {
    /** @type {any} */
    const self = this;
    const token = self.token;
    if (!token) return;
    const newEffects = [];
    /** @type {import('@models/index').SR4BaseCharacterSystem} */
    const sys = self.system;
    if (sys.conditionMonitor.stun.current > 0) {
      newEffects.push('icons/svg/wounded.svg');
    }
    await token.update({ effects: newEffects });
  }
}
