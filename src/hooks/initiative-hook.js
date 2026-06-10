export class InitiativeHook {
  constructor() {
    Hooks.once('init', () => {
      console.log('SR4 | Init Initiative Override');

      CONFIG.Combat.initiative = {
        decimals: 0,
      };

      /**
       * SR4 Initiative:
       * base + hits(d6 >= 5)
       */
      Combatant.prototype._getInitiativeFormula = function () {
        const actor = this.actor;
        if (!actor) return '0';

        let base, malus;
        if (actor.type === 'vehicle') {
          base = (actor.system?.pilot ?? 0) + (actor.system?.response ?? 0);
          malus = Math.floor(
            (actor.system?.conditionMonitor?.physical?.current ?? 0) / 3
          );
        } else {
          base = actor.system?.derivedStats?.initiative?.physical ?? 0;
          malus = actor.system?.derivedStats?.malus ?? 0;
        }

        const initiative = Math.max(0, base - malus);
        return `${initiative} + ${initiative}d6cs>=5`;
      };
    });
  }
}
