/**
 * Registers the `includes` Handlebars helper.
 * Returns `true` when `array` contains `value` (uses `Array.prototype.includes`).
 * Safely returns `undefined` when `array` is nullish.
 *
 * @example
 * // {{#if (includes allowedTypes item.type)}}...{{/if}}
 *
 * @returns {void}
 */
export function includesHelper() {
  Handlebars.registerHelper('includes', (array, value) =>
    array?.includes(value)
  );
}
