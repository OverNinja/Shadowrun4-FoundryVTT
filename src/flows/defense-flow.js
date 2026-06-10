import { getGame, openDefenseDialog } from '@utils/index';
import { ApplyDamageFlow } from './apply-damage-flow';
import { createEdgeRerollHandler } from './util/edge-reroll.handler';

/**
 * @param {import('@documents/index').SR4Actor} actor
 * @param {import('@models/index').SR4Weapon} weapon
 * @param {number} successes
 * @returns {void}
 */
export function emitDefenseTrigger(actor, weapon, successes) {
  if (!weapon?.type || !getGame().user?.targets) return;
  for (const target of getGame().user.targets) {
    const defenderId = target.actor?.id;
    if (!defenderId) continue;
    getGame().socket?.emit('system.shadowrun4e', {
      action: 'triggerDefense',
      payload: {
        defenderId,
        attackerId: actor.id,
        successes,
        weapon,
      },
    });
  }
}

export class DefenseFlow {
  /**
   * @param {import('@documents/index').SR4Actor} defender
   * @param {string} attackerId
   * @param {number} successes
   * @param {import('@models/index').SR4Weapon} weapon
   * @returns {Promise<void>}
   */
  static async start(defender, attackerId, successes, weapon) {
    await new DefenseFlow().handleDefenseRequest(
      defender.id,
      attackerId,
      successes,
      weapon
    );
  }

  /**
   * @param {string} defenderId
   * @param {string} attackerId
   * @param {number} successes
   * @param {import('@models/index').SR4Weapon} weapon
   * @returns {Promise<void>}
   */
  async handleDefenseRequest(defenderId, attackerId, successes, weapon) {
    /** @type {import('@documents/index').SR4Actor | undefined} */
    const defender = getGame().actors?.get(defenderId);
    /** @type {import('@documents/index').SR4Actor | undefined} */
    const attacker = getGame().actors?.get(attackerId);
    if (!defender || !attacker) return;

    const {
      successes: defenseHits,
      isGlitch,
      rolledDice,
    } = await openDefenseDialog(defender, attacker, successes, weapon);
    if (defenseHits === null) return;
    if (defenseHits) return;
    /**
     * @param {number} resolvedDefenseHits
     * @param {boolean} [edgeUsed]
     * @returns {Promise<void>}
     */
    const applyAfterDefense = async (resolvedDefenseHits, edgeUsed = false) => {
      const netSuccesses = Math.max(successes - resolvedDefenseHits, 0);
      if (netSuccesses === 0) return;
      const finalDamage = +weapon.system.damage + +netSuccesses;
      const isPhysical = weapon.system.damageType === 'physical';

      const onReroll = edgeUsed
        ? undefined
        : createEdgeRerollHandler(
            defender,
            { successes: resolvedDefenseHits, rolledDice, isGlitch },
            (newDefenseHits) => applyAfterDefense(newDefenseHits, true)
          );

      await ApplyDamageFlow.sendDecisionMessage(
        defender,
        finalDamage,
        isPhysical,
        'combat',
        { onReroll, edgeUsed }
      );
    };

    await applyAfterDefense(defenseHits);
  }
}
