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
| CLI framework   | Commander.js                                                             |
| Node target     | >=18                                                                     |
| No build step   | Runs directly via `node bin/cli.mjs` or shebang                          |
| Formatting      | Prettier via `bun run lint`. Pre-commit hook runs lint-staged via husky. |
