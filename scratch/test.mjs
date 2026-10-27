import assert from "node:assert/strict";
import { chromium, devices } from "playwright";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const server = spawn(process.execPath, [fileURLToPath(new URL("../scripts/local-server.mjs", import.meta.url))], {
  env: { ...process.env, PORT: "4187", DEEPSEEK_API_KEY: "", GEMINI_API_KEY: "", OPENAI_API_KEY: "" },
  stdio: ["ignore", "pipe", "inherit"]
});
await new Promise((resolve, reject) => {
  server.stdout.once("data", resolve);
  server.once("error", reject);
  server.once("exit", code => reject(new Error("Preview server exited: " + code)));
});

let browser;
try {
  browser = await chromium.launch({ headless: true });
  for (const [label, options] of [["desktop", { viewport: { width: 1280, height: 900 } }], ["mobile", devices["iPhone 13"]]]) {
    const context = await browser.newContext(options);
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("http://127.0.0.1:4187");
    assert.equal(await page.locator("#askView, #modeTabs").count(), 0);
    await page.fill("#sourceText", "Please confirm the requirements.");
    await page.click("#translateButton");
    await page.waitForFunction(() => document.querySelector("#translationText").textContent.includes("对齐"));
    assert.ok((await page.textContent("#pinyinText")).trim());
    await page.click('[data-direction="zh-en"]');
    await page.fill("#sourceText", "请确认需求。");
    await page.click("#translateButton");
    await page.waitForFunction(() => document.querySelector("#translationText").textContent.includes("align"));
    await page.click('[data-provider="gemini"]');
    assert.match(await page.locator('[data-provider="gemini"]').getAttribute("class"), /active/);
    await page.click('[data-lang="zh"]');
    assert.equal(await page.locator("html").getAttribute("lang"), "zh-Hans");
    await page.click('[data-lang="en"]');
    assert.equal(await page.locator("html").getAttribute("lang"), "en");
    assert.ok(await page.locator("#historyList button").count() >= 2);
    await page.locator("#historyList button").first().click();
    await page.fill("#sourceText", "Clear me");
    await page.click("#clearButton");
    assert.equal(await page.inputValue("#sourceText"), "");
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    assert.deepEqual(errors, []);
    console.log(label + ": both directions, provider and language switches, history, clear, and layout passed");
    await context.close();
  }
} finally {
  await browser?.close();
  server.kill();
}
