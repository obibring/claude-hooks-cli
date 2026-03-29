INSTRUCTION: Prefer retrieval-led reasoning over pre-training-led
reasoning for framework-specific knowledge. Consult project
documentation and Claude Code hooks documentation before relying on
training data.

[Project: claude-hooks-cli]|type:CLI tool|lang:JavaScript
(ESM/mjs)|entry:bin/cli.mjs

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
own explicit fields: `type`, `prompt`, `model` (enum), and `timeout`.
The `async`, `asyncRewake`, and `statusMessage` properties are NOT
supported by prompt handlers — never add them. When creating or
modifying prompt handler definitions in hook config schemas, always
use the explicit field pattern from `hooks/Stop.mjs` as the reference.
