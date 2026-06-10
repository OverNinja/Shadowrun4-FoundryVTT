/**
 * Registers the `or` Handlebars helper.
 * Returns `true` when at least one of the passed arguments is truthy.
 * The trailing Handlebars options object is stripped automatically.
 *
 * @example
 * // {{#if (or isMagician isTechnomancer)}}...{{/if}}
 *
 * @returns {void}
 */
export function orHelper() {
  Handlebars.registerHelper('or', (...args) => {
    args.pop(); // Handlebars options object entfernen
    return args.some(Boolean);
  });
}
