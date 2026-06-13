import {
  createDialogParameters,
  createRollDialog,
  dialogActions,
  getChecked,
  localize,
  renderTemplate,
  soakTemplatePath,
} from '../dialogutility';

/**
 * @param {import('@documents/index').SR4Actor} defender
 * @param {number} incomingDamage
 * @param {boolean} isPhysical
 * @param {number} effectiveArmor
 * @returns {Promise<{ hits: number, isGlitch: boolean, rolledDice: number, edgeUsed: boolean } | null>}
 */
export async function openSoakDialog(
  defender,
  incomingDamage,
  isPhysical,
  effectiveArmor
) {
  const body = defender.getAttribute('BODY') ?? 0;
  const soakBonus =
    /** @type {any} */ (defender).system?.modifiers?.soakBonus ?? 0;
  const soakPool = body + effectiveArmor + soakBonus;
  const params = createDialogParameters(defender, soakPool);
  const damageType = isPhysical
    ? localize('sr4.damage.physical')
    : localize('sr4.damage.stun');

  const content = await renderTemplate(soakTemplatePath(), {
    ...params,
    incomingDamage,
    damageType,
    body,
    effectiveArmor,
    soakBonus,
  });

  let edgeUsed = false;
  const result = await createRollDialog({
    title: localize('sr4.soak.title'),
    content,
    dice: soakPool,
    onRoll: async (dialog) => {
      edgeUsed = getChecked(dialog, 'edge');
      return dialogActions(
        dialog,
        defender,
        localize('sr4.soak.title'),
        soakPool,
        undefined,
        { emitDefense: false }
      );
    },
  });

  if (!result) return null;
  return {
    hits: result.successes,
    isGlitch: result.isGlitch,
    rolledDice: soakPool,
    edgeUsed,
  };
}
