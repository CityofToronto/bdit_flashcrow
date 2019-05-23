# Flashcrow Web Application Frontend

The `src` folder contains the Flashcrow Web Application Frontend, written as an SPA (Single-Page Application) using [Vue.js](https://vuejs.org/).

- `main.js`: entry point to the frontend application;
- `App.vue`: the "root component" mounted by our entry point;
- `src/store.js`: frontend application data store, using [Vuex](https://vuex.vuejs.org/);
- `src/router.js`: frontend application routes, using [Vue Router](https://router.vuejs.org/);
- `src/views`: top-level "views" that implement the application routes;
- `src/components`: components used by those top-level views;
  - `src/components/tds`: "Toronto Design System" components, designed for general web application use;
- `src/lib`: utility libraries used in the frontend.

Note that we currently have no formal process around promoting components into `src/components/tds`.  It is recommended that any new components you create go in `src/components`, and that their names start with `Fc` (short for "Flashcrow").
