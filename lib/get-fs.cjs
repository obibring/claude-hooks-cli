/** @type {typeof import("node:fs") | undefined} */
let _fs

/**
 * Lazily loads node:fs on first call. Cached for subsequent calls.
 * Exported from a .cjs file so ESM .mjs files can require() it
 * without issues across runtimes.
 * @returns {typeof import("node:fs")}
 */
function getFs() {
  if (!_fs) {
    _fs = require("node:fs")
  }
  return _fs
}

module.exports = { getFs }
