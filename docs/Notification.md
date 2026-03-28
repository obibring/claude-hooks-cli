# Notification

Runs when Claude Code sends a notification to the user.

## Handler Types

**Command only** — does not support `prompt`, `agent`, or `http`.

## Matcher

Matches `notification_type`. Valid values: `permission_prompt`,
`idle_prompt`, `auth_success`, `elicitation_dialog`.

## Input (stdin JSON)

Common fields plus:

- `notification_type` — one of the four notification types
- `message` — notification message body
- `title` — notification title

## Output (stdout JSON)

Universal fields only. No hook-specific output.

## Gotchas

- **Command-only**: Using `prompt`, `agent`, or `http` handler types
  will not work.
- **Fixed enum for matcher**: Unlike tool name matchers which support
  regex, notification type matcher must be an exact enum value.
