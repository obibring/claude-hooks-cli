/**
 * Parser for CLAUDE.md files with typed frontmatter support.
 *
 * Two usage patterns:
 *   1. `new ClaudeMd<MyType>(contents)` — explicit TS type, no runtime validation
 *   2. `new ClaudeMd(contents, zodSchema)` — infers type from schema, validates at parse time
 */

/**
 * Parses YAML-like frontmatter from raw markdown.
 * Handles `key: value` pairs with multiline indented continuation.
 *
 * @param {string} raw
 * @returns {{ frontmatter: Record<string, string | boolean>, body: string }}
 */
function parseFrontmatterBlock(raw) {
  /** @type {Record<string, string | boolean>} */
  const frontmatter = {}

  if (!raw.startsWith("---")) {
    return { frontmatter, body: raw }
  }

  const endIdx = raw.indexOf("\n---", 3)
  if (endIdx === -1) {
    return { frontmatter, body: raw }
  }

  const fmBlock = raw.slice(4, endIdx)
  const body = raw.slice(endIdx + 4).replace(/^\n/, "")

  let currentKey = ""
  let currentValue = ""

  /** @param {string} key @param {string} val */
  function flush(key, val) {
    const trimmed = val.trim()
    if (trimmed === "true") {
      frontmatter[key] = true
    } else if (trimmed === "false") {
      frontmatter[key] = false
    } else {
      frontmatter[key] = trimmed
    }
  }

  for (const line of fmBlock.split("\n")) {
    const match = line.match(/^(\w[\w-]*):\s*(.*)$/)
    if (match) {
      if (currentKey) flush(currentKey, currentValue)
      currentKey = match[1]
      currentValue = match[2]
    } else if (currentKey && (line.startsWith("  ") || line.startsWith("\t"))) {
      currentValue += "\n" + line.trim()
    } else if (currentKey && line.trim() === "") {
      currentValue += "\n"
    }
  }

  if (currentKey) flush(currentKey, currentValue)

  return { frontmatter, body }
}

/**
 * Parser for CLAUDE.md files with typed frontmatter.
 */
export class ClaudeMd {
  /** @type {string} */
  #raw

  /** @type {import("zod/v4").z.ZodType | undefined} */
  #schema

  /** @type {Record<string, unknown> | null} */
  #parsedFrontmatter = null

  /** @type {string | null} */
  #parsedContent = null

  /** @type {boolean} */
  #parsed = false

  /**
   * @param {string} contents - Raw CLAUDE.md file contents
   * @param {import("zod/v4").z.ZodType} [schema] - Optional Zod schema to validate frontmatter
   */
  constructor(contents, schema) {
    if (typeof contents !== "string") {
      throw new Error("ClaudeMd contents must be a string")
    }
    this.#raw = contents
    this.#schema = schema
  }

  /**
   * Lazily parses the raw contents.
   */
  #parse() {
    if (this.#parsed) return
    const { frontmatter, body } = parseFrontmatterBlock(this.#raw)
    this.#parsedContent = body

    if (this.#schema) {
      this.#parsedFrontmatter = this.#schema.parse(frontmatter)
    } else {
      this.#parsedFrontmatter = frontmatter
    }

    this.#parsed = true
  }

  /**
   * Returns the parsed frontmatter object.
   * If a Zod schema was provided, the frontmatter is validated against it.
   * @returns {Record<string, unknown>}
   */
  get frontmatter() {
    this.#parse()
    return /** @type {Record<string, unknown>} */ (this.#parsedFrontmatter)
  }

  /**
   * Returns the markdown content below the frontmatter.
   * @returns {string}
   */
  get content() {
    this.#parse()
    return /** @type {string} */ (this.#parsedContent)
  }

  /**
   * Returns the raw contents passed to the constructor.
   * @returns {string}
   */
  get raw() {
    return this.#raw
  }

  /**
   * Returns true if the raw contents have frontmatter delimiters.
   * @returns {boolean}
   */
  get hasFrontmatter() {
    return this.#raw.startsWith("---") && this.#raw.indexOf("\n---", 3) !== -1
  }
}
