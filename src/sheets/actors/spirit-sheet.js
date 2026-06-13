import { handleSkillRoll, openActionDialog } from '@utils/index';
import { SR4NpcBaseSheet } from './sr4-npc-base-sheet.js';

export default class SR4SpiritSheet extends SR4NpcBaseSheet {
  static DEFAULT_OPTIONS = {
    classes: ['shadowrun4e', 'sheet', 'actor', 'spirit'],
    position: { width: 700, height: 700 },
    actions: {
      monitorBox: SR4SpiritSheet.#onMonitorBox,
      rollAttribute: SR4SpiritSheet.#onRollAttribute,
      rollSkill: SR4SpiritSheet.#onRollSkill,
      clearOwner: SR4SpiritSheet.#onClearOwner,
    },
  };

  static PARTS = {
    sheet: {
      template: 'systems/shadowrun4e/templates/sheets/actors/spirit.sheet.hbs',
      scrollable: [''],
    },
  };

  // ---------------------------------------------------------------------------
  // Context
  // ---------------------------------------------------------------------------

  async _prepareContext(options) {
    const actorData = this.document.toObject(false);
    const items = actorData.items || [];

    const ss = actorData.system.sheetStats;
    const sheetStats = [
      {
        label: 'sr4.stats.BODY',
        name: 'system.sheetStats.BODY',
        value: ss.BODY,
        rollLabel: 'BOD',
      },
      {
        label: 'sr4.stats.AGILITY',
        name: 'system.sheetStats.AGILITY',
        value: ss.AGILITY,
        rollLabel: 'AGI',
      },
      {
        label: 'sr4.stats.REACTION',
        name: 'system.sheetStats.REACTION',
        value: ss.REACTION,
        rollLabel: 'REA',
      },
      {
        label: 'sr4.stats.STRENGTH',
        name: 'system.sheetStats.STRENGTH',
        value: ss.STRENGTH,
        rollLabel: 'STR',
      },
      {
        label: 'sr4.stats.CHARISMA',
        name: 'system.sheetStats.CHARISMA',
        value: ss.CHARISMA,
        rollLabel: 'CHA',
      },
      {
        label: 'sr4.stats.INTUITION',
        name: 'system.sheetStats.INTUITION',
        value: ss.INTUITION,
        rollLabel: 'INT',
      },
      {
        label: 'sr4.stats.LOGIC',
        name: 'system.sheetStats.LOGIC',
        value: ss.LOGIC,
        rollLabel: 'LOG',
      },
      {
        label: 'sr4.stats.WILLPOWER',
        name: 'system.sheetStats.WILLPOWER',
        value: ss.WILLPOWER,
        rollLabel: 'WIL',
      },
      {
        label: 'sr4.stats.MAGIC',
        name: 'system.sheetStats.MAGIC',
        value: ss.MAGIC,
        rollLabel: 'MAG',
      },
      {
        label: 'sr4.stats.EDGE',
        name: 'system.sheetStats.EDGE',
        value: ss.EDGE,
      },
      {
        label: 'sr4.stats.CURRENTEDGE',
        name: 'system.sheetStats.CURRENTEDGE',
        value: ss.CURRENTEDGE,
      },
      {
        label: 'sr4.stats.ESSENCE',
        name: 'system.sheetStats.ESSENCE',
        value: ss.ESSENCE,
      },
      {
        label: 'sr4.stats.INITIATIVE',
        name: 'system.sheetStats.INITIATIVE',
        value: ss.INITIATIVE,
      },
      {
        label: 'sr4.stats.ASTRALINITIATIVE',
        name: 'system.sheetStats.ASTRALINITIATIVE',
        value: ss.ASTRALINITIATIVE,
      },
    ];

    return {
      editMode: this.editMode,
      actor: {
        img: actorData.img,
        name: actorData.name,
        uuid: this.document.uuid,
      },
      system: actorData.system,
      flags: actorData.flags,
      ownerName: await this._resolveLinkedActorName(actorData.system.ownerUuid),
      critterPowers: items.filter((i) => i.type === 'CritterPower'),
      skills: items
        .filter((i) => i.type === 'Skill')
        .sort((a, b) => a.name.localeCompare(b.name)),
      sheetStats,
    };
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  static async #onMonitorBox(event, target) {
    const index = Number(target.dataset.index);
    const type =
      target.dataset.type ?? target.closest('.monitor-track')?.dataset.type;
    if (!type) return;
    const path = `system.conditionMonitor.${type}.value`;
    const current = foundry.utils.getProperty(this.actor, path);
    const newValue = index + 1 === current ? index : index + 1;
    await this.actor.update({ [path]: newValue });
  }

  static async #onRollSkill(event, target) {
    const skillName = target.dataset.skillName;
    if (skillName) await handleSkillRoll(this.actor, skillName);
  }

  static #onRollAttribute(event, target) {
    const label = target.dataset.label ?? 'Attribute';
    const value = Number(target.dataset.value ?? 0);
    if (value < 1) return;
    openActionDialog(this.actor, label, value);
  }

  static async #onClearOwner() {
    await this.actor.update({ 'system.ownerUuid': '' });
  }
}
