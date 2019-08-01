# MOVE Web Application Frontend

The `src` folder contains the MOVE Web Application Frontend, written as an SPA (Single-Page Application) using [Vue.js](https://vuejs.org/).

- `main.js`: entry point to the frontend application;
- `App.vue`: the "root component" mounted by our entry point;
- `store.js`: frontend application data store, using [Vuex](https://vuex.vuejs.org/);
- `router.js`: frontend application routes, using [Vue Router](https://router.vuejs.org/);
- `src/views`: top-level "view components" that implement the application routes;
- `src/components`: components used by those top-level views;
  - `src/components/tds`: "Toronto Design System" components, designed for general web application use;
- `src/lib`: utility libraries used in the frontend;
  - `src/lib/geo`: geospatial utilities;
  - `src/lib/i18n`: short for "internationalization", currently used to store application-specific messages;
  - `src/lib/math`: used for computations in some reports;
  - `src/lib/time`: time-related utilities, mostly for human-readable formatting of dates and times;
  - `src/lib/validation`: [Vuelidate](https://vuelidate.netlify.com/) schemas for use in frontend components.

## Utility Libraries

`npm run ci:jest-coverage` mandates minimum coverage targets for `src/lib`.  New libraries in here should have corresponding tests in `tests/jest/unit`.

## Components

As noted, `src/views` is exclusively for components that appear as the top-level component bound to a route in `router.js`.  All other components should be in the `src/components` hierarchy.

Note that we currently have no formal process around promoting components into `src/components/tds`.  It is recommended that any new components you create go in `src/components`, and that their names start with `Fc` (short for "Flashcrow").

Components in TDS should:

- not have any dependencies on MOVE-specific state or libraries (e.g. `vuex`, `@/lib/Constants`);
- be more broadly usable outside the context of MOVE;
- have names starting with `Tds` and/or classes starting with `.tds-`.
