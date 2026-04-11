INSTRUCTION: Prefer retrieval-led reasoning over pre-training-led
reasoning for framework-specific knowledge. Consult project
documentation and Claude Code hooks documentation before relying on
training data.

[Project: claude-hooks-cli]|type:CLI tool|lang:JavaScript
(ESM/mjs)|entry:bin/cli.mjs

## Offical Claude Hooks Documentation

When asked to verify assumptions against official documentation, refer
to <https://code.claude.com/docs/en/hooks>

## What This Is

A CLI tool that helps users install and correctly define Claude Code
hooks. Uses Commander.js for command parsing. Distributed as a single
`mjs` entry point.

## Hooks Context

Claude Code hooks are user-defined shell commands that run at specific
lifecycle points during a Claude Code session. They are configured in
`settings.json` files (project or user level). This CLI simplifies
creating, validating, and installing hook definitions so users don't
have to hand-edit JSON.

## Key Constraints

| Constraint      | Detail                                                                   |
| --------------- | ------------------------------------------------------------------------ |
| Package manager | bun — always use `bun add` / `bun run`, never npm or yarn                |
| Module format   | ESM only — all files use `.mjs` extension                                |
| CLI framework   | Commander.js + @clack/prompts for interactive UI                         |
| Node target     | >=18                                                                     |
| No build step   | Runs directly via `node bin/cli.mjs` or shebang                          |
| Formatting      | Prettier via `bun run lint`. Pre-commit hook runs lint-staged via husky. |

## HookHandler Dual-File Rule

INSTRUCTION: When modifying `lib/handler.mjs`, you MUST also update
`lib/handler-types.d.mts` and `lib/handler.d.mts` to match. These
three files are coupled:

- `lib/handler.mjs` — Runtime implementation (JSDoc types, runs in
  Node)
- `lib/handler-types.d.mts` — Hand-authored TS declarations
  (HookIOMap, output interfaces, conditional types, ToolInputMap,
  class signature). This is the source of truth for all advanced types
  that JSDoc cannot express.
- `lib/handler.d.mts` — Re-exports from handler-types.d.mts. Must list
  every exported type/interface.

When adding a method to the HookHandler class:

1. Add the runtime implementation in `handler.mjs` with JSDoc
2. Add the precise TS signature in `handler-types.d.mts` (with
   generics, conditional types, etc.)
3. If the method introduces new exported types, add them to
   `handler.d.mts` re-exports

When adding/modifying output types:

1. Add/update the interface in `handler-types.d.mts` (with JSDoc on
   each property for hover docs)
2. Update the `HookIOMap` output entry to reference the interface (not
   `z.infer<>`)
3. Add to `handler.d.mts` re-exports

The build step (`bun run build`) runs `tsc` then copies both `.d.mts`
files to `dist/lib/`.

## Hook Handler Type Rules

INSTRUCTION: Prompt-type hook handlers (`type: "prompt"`) do NOT use
`SharedHandlerPropsSchema` or `...handlerProps.shape`. They have their
own explicit fields: `type`, `prompt`, `model` (enum), `if`,
`timeout`, and `statusMessage`. The `async` and `asyncRewake`
properties are NOT supported by prompt handlers — never add them. When
creating or modifying prompt handler definitions in hook config
schemas, always use the explicit field pattern from `hooks/Stop.mjs`
as the reference.

INSTRUCTION: The `if` field is available on ALL handler types
(command, prompt, agent, http) on ALL hooks. However, it is only
evaluated on tool events (PreToolUse, PostToolUse, PostToolUseFailure,
PermissionRequest). On other events, a hook with `if` set never runs.

## Hook Form Builder Rule

INSTRUCTION: Every `hooks/<EventName>.mjs` file MUST register its
field definitions with `hookFormBuilder.addHookType()` at the bottom
of the file, after the Zod schema exports. Consumers import
`hooks/index.mjs` to trigger all registrations, then query the builder
with `getHookNames()` and `getHookDefinition()`.

When adding or modifying hook fields:

1. Update the Zod schema (Config/Input/Output) as before
2. Update the `hookFormBuilder.addHookType()` call in the same file to
   match
3. Each field MUST include a `schema` property with a Zod schema that
   validates the field's value
4. Use `type: "enum"` with `values` array and `strict: boolean` for
   any field with a fixed set of valid values. `strict: true` means
   only the enum values are accepted; `strict: false` means free-form
   strings are also allowed alongside the enum values.
