import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("deployment builds from source into the ignored dist directory", async () => {
  const config = await readFile(new URL("../wrangler.toml", import.meta.url), "utf8");
  assert.match(config, /name = "ettranslate"/);
  assert.match(config, /main = "dist\/index\.js"/);
  assert.match(config, /command = "node scripts\/build-single-worker\.mjs"/);
  const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  assert.match(pkg.scripts.deploy, /--keep-vars/);
});
