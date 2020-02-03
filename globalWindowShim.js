/**
 * `@hapi/joi` builds its browser bundle in UMD mode, which by default unfortunately uses
 * `window` as the global scope to attach exported variables to.
 *
 * Load this into any MOVE services using `-r ./globalWindowShim` in the `node` command line.
 */
global.window = {};
