import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import worker from "../dist/index.js";

test("built Worker serves the current HTML, JavaScript, CSS, and favicon", async () => {
  for (const [route, filename, contentType] of [
    ["/", "index.html", "text/html"],
    ["/app.js", "app.js", "text/javascript"],
    ["/styles.css", "styles.css", "text/css"],
    ["/favicon.svg", "favicon.svg", "image/svg+xml"]
  ]) {
    const response = await worker.fetch(new Request("https://translator.test" + route), {});
    assert.equal(response.status, 200);
    assert.ok(response.headers.get("content-type").startsWith(contentType));
    assert.equal(await response.text(), await readFile(new URL("../public/" + filename, import.meta.url), "utf8"));
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  }
});

test("removed Ask AI route returns 404", async () => {
  const response = await worker.fetch(new Request("https://translator.test/api/ask", { method: "POST" }), {});
  assert.equal(response.status, 404);
});
