import { openActionDialog } from '@utils/index';
import { SR4NpcBaseSheet } from './sr4-npc-base-sheet.js';

export default class SR4VehicleSheet extends SR4NpcBaseSheet {
  static DEFAULT_OPTIONS = {
    classes: ['shadowrun4e', 'sheet', 'actor', 'vehicle'],
    position: { width: 750, height: 700 },
    actions: {
      monitorBox: SR4VehicleSheet.#onMonitorBox,
      rollAutonomous: SR4VehicleSheet.#onRollAutonomous,
      attackRoll: SR4VehicleSheet.#onAttackRoll,
      clearRigger: SR4VehicleSheet.#onClearRigger,
    },
  };

  static PARTS = {
    sheet: {
      template: 'systems/shadowrun4e/templates/sheets/actors/vehicle.sheet.hbs',
      scrollable: [''],
    },
  };

  // ---------------------------------------------------------------------------
  // Context
  // ---------------------------------------------------------------------------

  async _prepareContext(options) {
    const actorData = this.document.toObject(false);
    const items = actorData.items || [];

    return {
      editMode: this.editMode,
      actor: {
        img: actorData.img,
        name: actorData.name,
        uuid: this.document.uuid,
      },
      system: actorData.system,
      flags: actorData.flags,
      riggerName: await this._resolveLinkedActorName(
        actorData.system.riggerUuid
      ),
      autosofts: items.filter((i) => i.type === 'Autosoft'),
      weapons: items.filter(
        (i) => i.type === 'Ranged Weapon' || i.type === 'Melee Weapon'
      ),
    };
  }

  // ---------------------------------------------------------------------------
  // Listeners
  // ---------------------------------------------------------------------------

  _onRender(context, options) {
    super._onRender(context, options);

    // Inline item field updates (autosoft type/rating/target)
    this.element
      .querySelectorAll('.item-list input, .item-list select')
      .forEach((el) => {
        el.addEventListener('change', async (event) => {
          const target = /** @type {HTMLInputElement | HTMLSelectElement} */ (
            event.currentTarget
          );
          const itemEl = target.closest('[data-item-id]');
          if (!itemEl) return;
          const item = this.actor.items.get(
            /** @type {HTMLElement} */ (itemEl).dataset.itemId
          );
          if (!item) return;
          const value =
            target.dataset.dtype === 'Number'
              ? Number(target.value)
              : target.value;
          await item.update({ [target.name]: value });
        });
      });
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  static async #onMonitorBox(event, target) {
    const index = Number(target.dataset.index);
    const path = 'system.conditionMonitor.physical.current';
    const current = foundry.utils.getProperty(this.actor, path);
    const newValue = index + 1 === current ? index : index + 1;
    await this.actor.update({ [path]: newValue });
  }

  static async #onRollAutonomous(event, target) {
    const itemId =
      target.dataset.itemId ?? target.closest('[data-item-id]')?.dataset.itemId;
    const autosoft = this.actor.items.get(itemId);
    const pilot = this.actor.system.pilot ?? 0;
    const rating = autosoft?.system?.rating ?? 0;
    const numDice = pilot + rating;
    if (numDice < 1) {
      ui?.notifications?.warn(game.i18n.localize('sr4.vehicle.noDicePool'));
      return;
    }
    const label = autosoft
      ? `${game.i18n.localize('sr4.vehicle.autonomous')}: ${autosoft.name}`
      : game.i18n.localize('sr4.vehicle.pilotRoll');
    openActionDialog(this.actor, label, numDice);
  }

  static async #onAttackRoll(event, target) {
    const itemId = target.closest('[data-item-id]')?.dataset.itemId;
    const weapon = this.actor.items.get(itemId);
    const pilot = this.actor.system.pilot ?? 0;
    const label = `${game.i18n.localize('sr4.vehicle.autonomous')}: ${weapon?.name ?? ''}`;
    openActionDialog(this.actor, label, pilot);
  }

  static async #onClearRigger() {
    await this.actor.update({ 'system.riggerUuid': '' });
  }
}
