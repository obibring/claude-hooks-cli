import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { writeFileSync, mkdirSync, rmSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { buildInput, runScript } from "./test-utils.js"

const EVENT = "SessionStart"
const TMP_DIR = join(tmpdir(), "cch-test-" + Date.now())

function makeScript(envFilePath: string, options?: string): string {
  const optStr = options ? `, ${options}` : ""
  return `
    import { HookHandler } from './lib/handler.mjs';
    const handler = new HookHandler('${EVENT}');
    handler.parseInput();
    const vars = handler.getEnvFileVars(${optStr});
    process.stdout.write(JSON.stringify(vars));
    handler.exit("success");
  `
}

describe("HookHandler.getEnvFileVars()", () => {
  const envFilePath = join(TMP_DIR, "env-file")

  beforeAll(() => {
    mkdirSync(TMP_DIR, { recursive: true })
  })

  afterAll(() => {
    rmSync(TMP_DIR, { recursive: true, force: true })
  })

  it("parses simple KEY=value pairs", async () => {
    writeFileSync(envFilePath, "FOO=bar\nBAZ=qux\n", "utf-8")
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(makeScript(envFilePath), input, {
      CLAUDE_ENV_FILE: envFilePath,
    })

    expect(result.exitCode).toBe(0)
    const vars = JSON.parse(result.stdout)
    expect(vars.FOO).toBe("bar")
    expect(vars.BAZ).toBe("qux")
  })

  it("strips comment lines and inline comments", async () => {
    writeFileSync(
      envFilePath,
      "# This is a comment\nFOO=bar # inline comment\n# Another comment\nBAZ=qux\n",
      "utf-8",
    )
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(makeScript(envFilePath), input, {
      CLAUDE_ENV_FILE: envFilePath,
    })

    expect(result.exitCode).toBe(0)
    const vars = JSON.parse(result.stdout)
    expect(vars.FOO).toBe("bar")
    expect(vars.BAZ).toBe("qux")
  })

  it("unwraps matched double quotes", async () => {
    writeFileSync(envFilePath, 'FOO="hello world"\n', "utf-8")
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(makeScript(envFilePath), input, {
      CLAUDE_ENV_FILE: envFilePath,
    })

    expect(result.exitCode).toBe(0)
    const vars = JSON.parse(result.stdout)
    expect(vars.FOO).toBe("hello world")
  })

  it("unwraps matched single quotes", async () => {
    writeFileSync(envFilePath, "FOO='hello world'\n", "utf-8")
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(makeScript(envFilePath), input, {
      CLAUDE_ENV_FILE: envFilePath,
    })

    expect(result.exitCode).toBe(0)
    const vars = JSON.parse(result.stdout)
    expect(vars.FOO).toBe("hello world")
  })

  it("keeps unmatched quotes", async () => {
    writeFileSync(envFilePath, 'FOO="hello\nBAR=world"\n', "utf-8")
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(makeScript(envFilePath), input, {
      CLAUDE_ENV_FILE: envFilePath,
    })

    expect(result.exitCode).toBe(0)
    const vars = JSON.parse(result.stdout)
    expect(vars.FOO).toBe('"hello')
    expect(vars.BAR).toBe('world"')
  })

  it("later lines override earlier ones", async () => {
    writeFileSync(envFilePath, "FOO=first\nFOO=second\n", "utf-8")
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(makeScript(envFilePath), input, {
      CLAUDE_ENV_FILE: envFilePath,
    })

    expect(result.exitCode).toBe(0)
    const vars = JSON.parse(result.stdout)
    expect(vars.FOO).toBe("second")
  })

  it("skips lines without valid VAR_NAME=value structure", async () => {
    writeFileSync(
      envFilePath,
      "VALID=yes\n123INVALID=no\n=nokey\njust text\nALSO_VALID=ok\n",
      "utf-8",
    )
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(makeScript(envFilePath), input, {
      CLAUDE_ENV_FILE: envFilePath,
    })

    expect(result.exitCode).toBe(0)
    const vars = JSON.parse(result.stdout)
    expect(vars.VALID).toBe("yes")
    expect(vars.ALSO_VALID).toBe("ok")
    expect(vars["123INVALID"]).toBeUndefined()
    expect(vars[""]).toBeUndefined()
  })

  it("returns empty object when CLAUDE_ENV_FILE is not set", async () => {
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(makeScript(envFilePath), input, {})

    expect(result.exitCode).toBe(0)
    const vars = JSON.parse(result.stdout)
    expect(vars).toEqual({})
  })

  it("returns empty object when file does not exist", async () => {
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(makeScript(envFilePath), input, {
      CLAUDE_ENV_FILE: "/nonexistent/path/env-file",
    })

    expect(result.exitCode).toBe(0)
    const vars = JSON.parse(result.stdout)
    expect(vars).toEqual({})
  })

  it("handles empty lines and whitespace", async () => {
    writeFileSync(envFilePath, "\n  \n  FOO = bar  \n\n  BAZ=  qux  \n\n", "utf-8")
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(makeScript(envFilePath), input, {
      CLAUDE_ENV_FILE: envFilePath,
    })

    expect(result.exitCode).toBe(0)
    const vars = JSON.parse(result.stdout)
    expect(vars.FOO).toBe("bar")
    expect(vars.BAZ).toBe("qux")
  })

  it("uses custom readFile option instead of fs", async () => {
    const script = `
      import { HookHandler } from './lib/handler.mjs';
      const handler = HookHandler.for('SessionStart', {
        readFile: (path) => 'CUSTOM_VAR=from_readFile\\nANOTHER=works',
      });
      handler.parseInput();
      const vars = handler.getEnvFileVars();
      process.stdout.write(JSON.stringify(vars));
      handler.exit("success");
    `
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(script, input, {
      CLAUDE_ENV_FILE: "/fake/path/that/doesnt/exist",
    })

    expect(result.exitCode).toBe(0)
    const vars = JSON.parse(result.stdout)
    expect(vars.CUSTOM_VAR).toBe("from_readFile")
    expect(vars.ANOTHER).toBe("works")
  })

  it("custom readFile receives the correct file path", async () => {
    const expectedPath = "/my/custom/env/file"
    const script = `
      import { HookHandler } from './lib/handler.mjs';
      const handler = HookHandler.for('SessionStart', {
        readFile: (path) => {
          // Echo the path back as a var so we can verify it
          return 'RECEIVED_PATH=' + path;
        },
      });
      handler.parseInput();
      const vars = handler.getEnvFileVars();
      process.stdout.write(JSON.stringify(vars));
      handler.exit("success");
    `
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(script, input, {
      CLAUDE_ENV_FILE: expectedPath,
    })

    expect(result.exitCode).toBe(0)
    const vars = JSON.parse(result.stdout)
    expect(vars.RECEIVED_PATH).toBe(expectedPath)
  })

  it("custom readFile error returns empty object", async () => {
    const script = `
      import { HookHandler } from './lib/handler.mjs';
      const handler = HookHandler.for('SessionStart', {
        readFile: (path) => { throw new Error('read failed'); },
      });
      handler.parseInput();
      const vars = handler.getEnvFileVars();
      process.stdout.write(JSON.stringify(vars));
      handler.exit("success");
    `
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(script, input, {
      CLAUDE_ENV_FILE: "/some/path",
    })

    expect(result.exitCode).toBe(0)
    const vars = JSON.parse(result.stdout)
    expect(vars).toEqual({})
  })

  it("caches result and custom readFile is only called once", async () => {
    const script = `
      import { HookHandler } from './lib/handler.mjs';
      let callCount = 0;
      const handler = HookHandler.for('SessionStart', {
        readFile: (path) => {
          callCount++;
          return 'CALL_COUNT=' + callCount;
        },
      });
      handler.parseInput();
      const vars1 = handler.getEnvFileVars();
      const vars2 = handler.getEnvFileVars();
      process.stdout.write(JSON.stringify({ vars1, vars2, callCount }));
      handler.exit("success");
    `
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(script, input, {
      CLAUDE_ENV_FILE: "/some/path",
    })

    expect(result.exitCode).toBe(0)
    const data = JSON.parse(result.stdout)
    expect(data.callCount).toBe(1)
    expect(data.vars1.CALL_COUNT).toBe("1")
    expect(data.vars2.CALL_COUNT).toBe("1")
  })

  it("force: true re-calls custom readFile", async () => {
    const script = `
      import { HookHandler } from './lib/handler.mjs';
      let callCount = 0;
      const handler = HookHandler.for('SessionStart', {
        readFile: (path) => {
          callCount++;
          return 'CALL_COUNT=' + callCount;
        },
      });
      handler.parseInput();
      const vars1 = handler.getEnvFileVars();
      const vars2 = handler.getEnvFileVars({ force: true });
      process.stdout.write(JSON.stringify({ vars1, vars2, callCount }));
      handler.exit("success");
    `
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(script, input, {
      CLAUDE_ENV_FILE: "/some/path",
    })

    expect(result.exitCode).toBe(0)
    const data = JSON.parse(result.stdout)
    expect(data.callCount).toBe(2)
    expect(data.vars1.CALL_COUNT).toBe("1")
    expect(data.vars2.CALL_COUNT).toBe("2")
  })

  it("writeEnvFile writes all vars using custom writeFile", async () => {
    const script = `
      import { HookHandler } from './lib/handler.mjs';
      let written = null;
      const handler = HookHandler.for('SessionStart', {
        writeFile: (path, contents, opts) => {
          written = { path, contents, encoding: opts.encoding };
        },
      });
      handler.parseInput();
      handler.writeEnvFile({ FOO: "bar", BAZ: "qux" });
      process.stdout.write(JSON.stringify(written));
      handler.exit("success");
    `
    const input = JSON.stringify(buildInput(EVENT))
    const envPath = "/tmp/test-env-write"
    const result = await runScript(script, input, {
      CLAUDE_ENV_FILE: envPath,
    })

    expect(result.exitCode).toBe(0)
    const data = JSON.parse(result.stdout)
    expect(data.path).toBe(envPath)
    expect(data.contents).toBe("FOO=bar\nBAZ=qux\n")
    expect(data.encoding).toBe("utf-8")
  })

  it("writeEnvFile uses node:fs when no custom writeFile", async () => {
    writeFileSync(envFilePath, "OLD=data\n", "utf-8")
    const script = `
      import { HookHandler } from './lib/handler.mjs';
      import { readFileSync } from 'node:fs';
      const handler = HookHandler.for('SessionStart');
      handler.parseInput();
      handler.writeEnvFile({ NEW: "value", ANOTHER: "one" });
      const contents = readFileSync(process.env.CLAUDE_ENV_FILE, 'utf-8');
      process.stdout.write(contents);
      handler.exit("success");
    `
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(script, input, {
      CLAUDE_ENV_FILE: envFilePath,
    })

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("NEW=value\nANOTHER=one\n")
  })

  it("writeEnvFile invalidates cache", async () => {
    const script = `
      import { HookHandler } from './lib/handler.mjs';
      let fileContents = 'BEFORE=yes';
      const handler = HookHandler.for('SessionStart', {
        readFile: () => fileContents,
        writeFile: (path, contents) => { fileContents = contents; },
      });
      handler.parseInput();
      const before = handler.getEnvFileVars();
      handler.writeEnvFile({ AFTER: "yes" });
      const after = handler.getEnvFileVars();
      process.stdout.write(JSON.stringify({ before, after }));
      handler.exit("success");
    `
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(script, input, {
      CLAUDE_ENV_FILE: "/fake/path",
    })

    expect(result.exitCode).toBe(0)
    const data = JSON.parse(result.stdout)
    expect(data.before.BEFORE).toBe("yes")
    expect(data.before.AFTER).toBeUndefined()
    expect(data.after.AFTER).toBe("yes")
    expect(data.after.BEFORE).toBeUndefined()
  })

  it("appendToEnvFile appends using custom writeFile", async () => {
    const script = `
      import { HookHandler } from './lib/handler.mjs';
      let fileContents = 'EXISTING=val\\n';
      const handler = HookHandler.for('SessionStart', {
        readFile: () => fileContents,
        writeFile: (path, contents) => { fileContents = contents; },
      });
      handler.parseInput();
      handler.appendToEnvFile("NEW_VAR", "hello");
      process.stdout.write(fileContents);
      handler.exit("success");
    `
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(script, input, {
      CLAUDE_ENV_FILE: "/fake/path",
    })

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("EXISTING=val\nNEW_VAR=hello\n")
  })

  it("appendToEnvFile uses node:fs when no custom writeFile", async () => {
    writeFileSync(envFilePath, "FIRST=one\n", "utf-8")
    const script = `
      import { HookHandler } from './lib/handler.mjs';
      import { readFileSync } from 'node:fs';
      const handler = HookHandler.for('SessionStart');
      handler.parseInput();
      handler.appendToEnvFile("SECOND", "two");
      const contents = readFileSync(process.env.CLAUDE_ENV_FILE, 'utf-8');
      process.stdout.write(contents);
      handler.exit("success");
    `
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(script, input, {
      CLAUDE_ENV_FILE: envFilePath,
    })

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("FIRST=one\nSECOND=two\n")
  })

  it("appendToEnvFile invalidates cache", async () => {
    const script = `
      import { HookHandler } from './lib/handler.mjs';
      let fileContents = 'BEFORE=yes\\n';
      const handler = HookHandler.for('SessionStart', {
        readFile: () => fileContents,
        writeFile: (path, contents) => { fileContents = contents; },
      });
      handler.parseInput();
      const before = handler.getEnvFileVars();
      handler.appendToEnvFile("AFTER", "yes");
      const after = handler.getEnvFileVars();
      process.stdout.write(JSON.stringify({ before, after }));
      handler.exit("success");
    `
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(script, input, {
      CLAUDE_ENV_FILE: "/fake/path",
    })

    expect(result.exitCode).toBe(0)
    const data = JSON.parse(result.stdout)
    expect(data.before.BEFORE).toBe("yes")
    expect(data.before.AFTER).toBeUndefined()
    expect(data.after.BEFORE).toBe("yes")
    expect(data.after.AFTER).toBe("yes")
  })

  it("writeEnvFile does nothing when CLAUDE_ENV_FILE is not set", async () => {
    const script = `
      import { HookHandler } from './lib/handler.mjs';
      let writeCalled = false;
      const handler = HookHandler.for('SessionStart', {
        writeFile: () => { writeCalled = true; },
      });
      handler.parseInput();
      handler.writeEnvFile({ FOO: "bar" });
      process.stdout.write(JSON.stringify({ writeCalled }));
      handler.exit("success");
    `
    const input = JSON.stringify(buildInput(EVENT))
    const result = await runScript(script, input, {})

    expect(result.exitCode).toBe(0)
    const data = JSON.parse(result.stdout)
    expect(data.writeCalled).toBe(false)
  })
})
