/** @typedef {"user" | "project" | "local"} SettingsScope */
/**
 * Resolves the settings file path based on scope.
 * @param {SettingsScope} scope
 * @returns {string}
 */
export function getSettingsPath(scope: SettingsScope): string;
/**
 * Reads and parses a Claude Code settings.json file.
 * Returns an empty object if the file doesn't exist.
 * @param {string} filePath
 * @returns {Promise<Record<string, unknown>>}
 */
export function readSettings(filePath: string): Promise<Record<string, unknown>>;
/**
 * Writes a settings object to a Claude Code settings.json file.
 * Creates parent directories if needed.
 * @param {string} filePath
 * @param {Record<string, unknown>} settings
 * @returns {Promise<void>}
 */
export function writeSettings(filePath: string, settings: Record<string, unknown>): Promise<void>;
export type SettingsScope = "user" | "project" | "local";
//# sourceMappingURL=settings-io.d.mts.map