/**
 * Registers the `and` Handlebars helper.
 * Returns `true` when both operands are truthy.
 *
 * @example
 * // {{#if (and isAdmin isActive)}}...{{/if}}
 *
 * @returns {void}
 */
export function andHelper() {
  Handlebars.registerHelper('and', (a, b) => a && b);
}
