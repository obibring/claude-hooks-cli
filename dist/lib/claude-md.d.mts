import type { z } from "zod/v4"

/**
 * Parser for CLAUDE.md files with typed frontmatter.
 *
 * Two usage patterns:
 *
 * **1. Explicit TypeScript type (no runtime validation):**
 * ```ts
 * interface MyFrontmatter { name: string; version: string }
 * const md = new ClaudeMd<MyFrontmatter>(contents)
 * md.frontmatter.name  // string
 * ```
 *
 * **2. Zod schema (inferred type + runtime validation):**
 * ```ts
 * const schema = z.object({ name: z.string(), version: z.string() })
 * const md = new ClaudeMd(contents, schema)
 * md.frontmatter.name  // string — type inferred from schema
 * ```
 *
 * @typeParam T - Shape of the frontmatter object. Inferred from Zod schema when provided.
 */
export class ClaudeMd<T extends Record<string, unknown> = Record<string, unknown>> {
  /**
   * Create a ClaudeMd parser with an explicit TypeScript type for frontmatter.
   * No runtime validation is performed — the frontmatter is parsed as key-value pairs
   * and cast to `T`.
   *
   * @param contents - Raw CLAUDE.md file contents (including frontmatter delimiters)
   */
  constructor(contents: string)

  /**
   * Create a ClaudeMd parser with a Zod schema for frontmatter validation.
   * The frontmatter is parsed and then validated against the schema at access time.
   * Throws a `ZodError` if validation fails.
   *
   * @param contents - Raw CLAUDE.md file contents (including frontmatter delimiters)
   * @param schema - Zod schema to validate and type the frontmatter
   */
  constructor(contents: string, schema: z.ZodType<T>)

  /**
   * The parsed frontmatter object, typed as `T`.
   * Lazily parsed on first access. If a Zod schema was provided, the frontmatter
   * is validated against it (throws `ZodError` on failure).
   */
  get frontmatter(): T

  /**
   * The markdown content below the frontmatter delimiters.
   * Lazily parsed on first access.
   */
  get content(): string

  /**
   * The raw string passed to the constructor.
   */
  get raw(): string

  /**
   * Returns `true` if the raw contents contain frontmatter delimiters (`---`).
   */
  get hasFrontmatter(): boolean
}
