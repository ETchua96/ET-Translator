import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

const result = {
  sourceLanguage: "English", targetLanguage: "Chinese", translation: "请确认需求。",
  pinyin: "Qǐng quèrèn xūqiú.", meaning: "Please confirm the requirements.",
  terms: [], alternatives: [], usageNotes: [], confidence: "high"
};

function request(provider = "deepseek", direction = "en-zh", text = "Please confirm the requirements.") {
  return new Request("https://translator.test/api/translate", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ text, provider, direction, tone: "business" })
  });
}

test("DeepSeek request uses the configured model and returns a translation", async (t) => {
  t.mock.method(globalThis, "fetch", async (url, init) => {
    assert.equal(url, "https://api.deepseek.com/chat/completions");
    const body = JSON.parse(init.body);
    assert.equal(body.model, "model-test");
    assert.equal(body.max_tokens, 6000);
    return Response.json({ choices: [{ message: { content: JSON.stringify(result) }, finish_reason: "stop" }] });
  });
  const response = await worker.fetch(request(), { DEEPSEEK_API_KEY: "test-key", DEEPSEEK_MODEL: "model-test" });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).translation, result.translation);
});

test("Gemini handles Chinese to English through the same Worker", async (t) => {
  t.mock.method(globalThis, "fetch", async (url, init) => {
    assert.match(url, /generativelanguage\.googleapis\.com/);
    assert.equal(init.headers["x-goog-api-key"], "test-key");
    return Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify({ ...result, translation: "Confirm the requirements." }) }] } }] });
  });
  const response = await worker.fetch(request("gemini", "zh-en", "确认需求。"), { GEMINI_API_KEY: "test-key" });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).translation, "Confirm the requirements.");
});

test("missing API key returns a useful setup error", async () => {
  const response = await worker.fetch(request(), {});
  assert.equal(response.status, 500);
  assert.match((await response.json()).error, /DEEPSEEK_API_KEY/);
});

test("truncated DeepSeek response produces the output limit error", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json({ choices: [{ message: { content: null }, finish_reason: "length" }] }));
  const response = await worker.fetch(request(), { DEEPSEEK_API_KEY: "test-key" });
  assert.equal(response.status, 500);
  assert.match((await response.json()).error, /output limit/);
});

test("upstream errors preserve the provider error message", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json({ error: { message: "rate limited" } }, { status: 429 }));
  const response = await worker.fetch(request(), { DEEPSEEK_API_KEY: "test-key" });
  assert.equal(response.status, 502);
  assert.match((await response.json()).error, /rate limited/);
});
