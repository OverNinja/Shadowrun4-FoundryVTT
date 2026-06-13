import { handleAttackRoll } from '@utils/index';

export default class SR4BaseActorSheet extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.sheets.ActorSheetV2
) {
  /** @type {boolean} */
  editMode = false;

  _listenerAbort = new AbortController();

  static DEFAULT_OPTIONS = {
    form: {
      submitOnChange: true,
      closeOnSubmit: false,
    },
    actions: {
      deleteItem: SR4BaseActorSheet._onDeleteItem,
      editItem: SR4BaseActorSheet._onEditItem,
      toggleEquip: SR4BaseActorSheet._onToggleEquip,
      monitorBox: SR4BaseActorSheet._onMonitorBox,
      attackRoll: SR4BaseActorSheet._onAttackRoll,
      reloadWeapon: SR4BaseActorSheet._onReloadWeapon,
      editAmmo: SR4BaseActorSheet._onEditAmmo,
    },
  };

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  async _renderFrame(options) {
    const frame = await super._renderFrame(options);

    const headerControls = frame.querySelector(
      '.window-header .header-control'
    );

    const html = await foundry.applications.handlebars.renderTemplate(
      'systems/shadowrun4e/templates/ui/edit-mode-toggle.hbs',
      { editMode: this.editMode }
    );
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    const toggle = /** @type {HTMLElement} */ (wrapper.firstElementChild);

    toggle.querySelector('input')?.addEventListener('change', (ev) => {
      // @ts-ignore — checked exists on HTMLInputElement at runtime
      this.editMode = ev.currentTarget.checked;
      this.render();
    });

    if (headerControls?.parentElement) {
      headerControls.parentElement.prepend(toggle);
    }

    return frame;
  }

  // ---------------------------------------------------------------------------
  // Listeners
  // ---------------------------------------------------------------------------

  _onRender(context, options) {
    super._onRender?.(context, options);

    this._listenerAbort.abort();
    this._listenerAbort = new AbortController();
    const { signal } = this._listenerAbort;

    this.element
      .querySelectorAll('input[type="number"], input[type="text"]')
      .forEach((input) => {
        input.addEventListener('focus', () => input.select(), { signal });
      });

    this.element
      .querySelectorAll(
        '.item-list input, .item-list select, .weapon-list select'
      )
      .forEach((el) => {
        el.addEventListener(
          'change',
          async (event) => {
            const target = event.currentTarget;
            const itemEl = target.closest('.item');
            if (!itemEl) return;
            const itemId = itemEl.dataset.itemId;
            const item = this.actor.items.get(itemId);
            if (!item) return;
            const field = target.name;
            let value = target.value;
            if (target.type === 'checkbox') {
              value = target.checked;
            } else if (target.dataset.dtype === 'Number') {
              value = Number(value);
            }
            await item.update({ [field]: value });
          },
          { signal }
        );
      });

    this.element.querySelector('[data-edit="img"]')?.addEventListener(
      'click',
      () => {
        new foundry.applications.apps.FilePicker.implementation({
          type: 'image',
          current: this.actor.img,
          callback: (path) => this.actor.update({ img: path }),
        }).browse();
      },
      { signal }
    );
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  static async _onDeleteItem(event, target) {
    const itemId = target.closest('[data-item-id]')?.dataset.itemId;
    if (!itemId) return;
    await this.actor.deleteEmbeddedDocuments('Item', [itemId]);
  }

  static async _onEditItem(event, target) {
    const itemId = target.closest('[data-item-id]')?.dataset.itemId;
    if (!itemId) return;
    this.actor.items.get(itemId)?.sheet?.render(true);
  }

  static async _onToggleEquip(event, target) {
    const itemId = target.closest('[data-item-id]')?.dataset.itemId;
    if (!itemId) return;
    const item = this.actor.items.get(itemId);
    if (!item) return;
    await item.update({ 'system.equipped': !item.system.equipped });
  }

  static async _onMonitorBox(event, target) {
    const index = Number(target.dataset.index);
    const type =
      target.dataset.type ?? target.closest('.monitor-track')?.dataset.type;
    if (!type) return;
    const path = `system.conditionMonitor.${type}.value`;
    const current = foundry.utils.getProperty(this.actor, path);
    const newValue = index + 1 === current ? index : index + 1;
    await this.actor.update({ [path]: newValue });
  }

  static async _onAttackRoll(event, target) {
    const itemId = target.closest('[data-item-id]')?.dataset.itemId;
    const skillKey = target.dataset.attackSkill;
    if (!itemId || !skillKey) return;
    const weapon = this.actor.items.get(itemId);
    const skillName = this.actor.findByAttackSkill(skillKey)?.name;
    if (!skillName || !weapon) return;
    await handleAttackRoll(this.actor, skillName, weapon);
  }

  static async _onReloadWeapon(event, target) {
    const itemId = target.closest('[data-item-id]')?.dataset.itemId;
    const weapon = this.actor.items.get(itemId);
    if (!weapon || !weapon.system.loadedAmmoId) return;
    // quantity tracks total rounds consumed shot-by-shot; reload only resets the
    // magazine counter — no quantity deduction (ammo was already counted on fire).
    await weapon.update({ 'system.currentAmmo': weapon.system.maxAmmo });
  }

  static async _onEditAmmo(event, target) {
    const ammoId = target.dataset.ammoId;
    if (!ammoId) return;
    this.actor.items.get(ammoId)?.sheet?.render(true);
  }
}
