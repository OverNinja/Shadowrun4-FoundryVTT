export async function registerSharedPartials() {
  const basePath = 'systems/shadowrun4e/templates/sheets/shared';

  const templatePaths = [
    { path: `${basePath}/effect-table.hbs`, name: 'effect-table' },
  ];

  await Promise.all(
    templatePaths.map(async ({ path, name }) => {
      try {
        const res = await fetch(path);
        const partial = await res.text();
        Handlebars.registerPartial(name, partial);
        console.log(`${name} partial registered successfully.`);
      } catch (error) {
        console.error(`Error loading and registering ${name} partial:`, error);
      }
    })
  );
}
