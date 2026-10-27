import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

test("usage dashboard requires the configured admin PIN", async () => {
  const response = await worker.fetch(new Request("https://translator.test/admin/usage"), { ADMIN_PIN: "test-pin" });
  assert.ok([401, 403].includes(response.status));
});

test("usage API rejects requests without the configured admin PIN", async () => {
  const response = await worker.fetch(new Request("https://translator.test/api/usage"), { ADMIN_PIN: "test-pin" });
  assert.ok([401, 403].includes(response.status));
});
