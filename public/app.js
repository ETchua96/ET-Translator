const MAX_TEXT_LENGTH = 5000;
const HISTORY_KEY = "et-business-translator-history-v1";
const PAGE_LANGUAGE_KEY = "et-business-translator-page-language-v1";
const RESULT_CACHE_KEY = "et-business-translator-result-cache-v1";
const DEVICE_ID_KEY = "et-translator-device-id-v1";
const DEVICE_LABEL_KEY = "et-translator-device-label-v1";
const RESULT_CACHE_LIMIT = 30;
const TEXT_STORAGE = sessionStorage;

const UI_COPY = {
  en: {
    pageTitle: "ET Translator",
    brand: "English ⇄ Chinese",
    title: "ET Translator",
    translateTab: "Translate",
    textLabel: "Text",
    sourcePlaceholder: "Paste a work chat, meeting note, PRD line, or email sentence.",
    directionLabel: "Direction",
    directionAria: "Translation direction",
    toneLabel: "Tone",
    toneAria: "Tone",
    providerLabel: "AI",
    providerAria: "AI provider",
    toneBusiness: "Business",
    tonePlain: "Plain",
    tonePolished: "Polished",
    translateButton: "Translate",
    translatingButton: "Translating",
    pasteButton: "Paste",
    clearButton: "Clear",
    copyButton: "Copy",
    translationLabel: "Translation",
    waitingText: "Waiting for text",
    translationPlaceholder: "Your translation will appear here.",
    pinyinLabel: "Hanyu Pinyin",
    pinyinPlaceholder: "Pinyin appears when Chinese text is involved.",
    meaningLabel: "Meaning",
    meaningPlaceholder: "Plain meaning appears here.",
    termsLabel: "Business Terms",
    termsPlaceholder: "Key terms and word meanings appear here.",
    alternativesLabel: "Alternatives",
    alternativesPlaceholder: "Alternate phrasing appears here.",
    recentLabel: "Recent",
    historyAria: "Recent translations",
    emptyHistory: "No recent translations yet.",
    enterText: "Enter something to translate.",
    keepUnderLimit: "Keep it under 5000 characters.",
    translationFailed: "Translation failed.",
    clipboardBlocked: "Clipboard permission was blocked.",
    copyFailed: "Copy failed.",
    noTranslationReturned: "No translation returned.",
    noPinyinReturned: "No pinyin returned.",
    noMeaningReturned: "No meaning returned.",
    noKeyTermsReturned: "No key terms returned.",
    noAlternatePhrasingReturned: "No alternate phrasing returned.",
    alternativeLabel: "Alternative",
    status: {
      Ready: "Ready",
      Translating: "Translating",
      Error: "Error",
      Copied: "Copied"
    }
  },
  zh: {
    pageTitle: "ET Translator",
    brand: "英文 ⇄ 中文",
    title: "ET Translator",
    translateTab: "翻译",
    textLabel: "原文",
    sourcePlaceholder: "粘贴工作聊天、会议记录、PRD 内容或邮件句子。",
    directionLabel: "翻译方向",
    directionAria: "翻译方向",
    toneLabel: "语气",
    toneAria: "语气",
    providerLabel: "AI",
    providerAria: "AI 服务",
    toneBusiness: "商务",
    tonePlain: "简单",
    tonePolished: "润色",
    translateButton: "翻译",
    translatingButton: "翻译中",
    pasteButton: "粘贴",
    clearButton: "清空",
    copyButton: "复制",
    translationLabel: "翻译结果",
    waitingText: "等待输入",
    translationPlaceholder: "翻译结果会显示在这里。",
    pinyinLabel: "汉语拼音",
    pinyinPlaceholder: "涉及中文时会显示拼音。",
    meaningLabel: "含义",
    meaningPlaceholder: "简单含义会显示在这里。",
    termsLabel: "商务词汇",
    termsPlaceholder: "关键词和词义会显示在这里。",
    alternativesLabel: "替代表达",
    alternativesPlaceholder: "其他表达方式会显示在这里。",
    recentLabel: "最近记录",
    historyAria: "最近翻译记录",
    emptyHistory: "暂无最近翻译。",
    enterText: "请输入要翻译的内容。",
    keepUnderLimit: "请控制在 5000 字以内。",
    translationFailed: "翻译失败。",
    clipboardBlocked: "浏览器阻止了剪贴板权限。",
    copyFailed: "复制失败。",
    noTranslationReturned: "没有返回翻译结果。",
    noPinyinReturned: "没有返回拼音。",
    noMeaningReturned: "没有返回含义。",
    noKeyTermsReturned: "没有返回关键词。",
    noAlternatePhrasingReturned: "没有返回替代表达。",
    alternativeLabel: "替代表达",
    status: {
      Ready: "就绪",
      Translating: "翻译中",
      Error: "错误",
      Copied: "已复制"
    }
  }
};

const state = {
  direction: "en-zh",
  tone: "business",
  provider: "deepseek",
  pageLanguage: loadPageLanguage(),
  currentResult: null,
  history: loadHistory(),
  resultCache: loadResultCache()
};

clearLegacyPersistentTextStorage();

const elements = {
  form: document.querySelector("#translatorForm"),
  translateView: document.querySelector("#translateView"),
  pageLanguageControl: document.querySelector("#pageLanguageControl"),
  sourceText: document.querySelector("#sourceText"),
  charCount: document.querySelector("#charCount"),
  directionControl: document.querySelector("#directionControl"),
  toneControl: document.querySelector("#toneControl"),
  providerControl: document.querySelector("#providerControl"),
  translateButton: document.querySelector("#translateButton"),
  pasteButton: document.querySelector("#pasteButton"),
  clearButton: document.querySelector("#clearButton"),
  errorText: document.querySelector("#errorText"),
  connectionStatus: document.querySelector("#connectionStatus"),
  languagePair: document.querySelector("#languagePair"),
  translationText: document.querySelector("#translationText"),
  pinyinText: document.querySelector("#pinyinText"),
  meaningText: document.querySelector("#meaningText"),
  termsList: document.querySelector("#termsList"),
  alternativesList: document.querySelector("#alternativesList"),
  copyTranslationButton: document.querySelector("#copyTranslationButton"),
  copyPinyinButton: document.querySelector("#copyPinyinButton"),
  clearHistoryButton: document.querySelector("#clearHistoryButton"),
  historyList: document.querySelector("#historyList"),
};

elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  await translate();
});

elements.pageLanguageControl.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-lang]");

  if (button) {
    setPageLanguage(button.dataset.lang);
  }
});

elements.sourceText.addEventListener("input", updateCharCount);
elements.directionControl.addEventListener("click", (event) => selectSegment(event, "direction", "direction"));
elements.toneControl.addEventListener("click", (event) => selectSegment(event, "tone", "tone"));
elements.providerControl.addEventListener("click", (event) => selectSegment(event, "provider", "provider"));
elements.pasteButton.addEventListener("click", () => pasteFromClipboard(elements.sourceText, updateCharCount, elements.errorText));
elements.clearButton.addEventListener("click", clearInput);
elements.copyTranslationButton.addEventListener("click", copyTranslation);
elements.copyPinyinButton.addEventListener("click", () => copyText(elements.pinyinText.textContent, elements.errorText));
elements.clearHistoryButton.addEventListener("click", clearHistory);

applyPageLanguage();
updateCharCount();
renderHistory();

function setPageLanguage(language) {
  if (!UI_COPY[language]) {
    return;
  }

  state.pageLanguage = language;
  localStorage.setItem(PAGE_LANGUAGE_KEY, language);
  applyPageLanguage();
}

function applyPageLanguage() {
  document.documentElement.lang = state.pageLanguage === "zh" ? "zh-Hans" : "en";
  document.title = t("pageTitle");

  for (const element of document.querySelectorAll("[data-i18n]")) {
    element.textContent = t(element.dataset.i18n);
  }

  for (const element of document.querySelectorAll("[data-i18n-placeholder]")) {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  }

  for (const element of document.querySelectorAll("[data-i18n-aria]")) {
    element.setAttribute("aria-label", t(element.dataset.i18nAria));
  }

  for (const button of elements.pageLanguageControl.querySelectorAll("[data-lang]")) {
    const isActive = button.dataset.lang === state.pageLanguage;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }

  if (state.currentResult) {
    renderResult(state.currentResult);
  }

  setStatus(elements.connectionStatus.dataset.status || "Ready");
  renderHistory();
}

function t(key) {
  return UI_COPY[state.pageLanguage]?.[key] || UI_COPY.en[key] || key;
}

function tStatus(status) {
  return UI_COPY[state.pageLanguage]?.status?.[status] || UI_COPY.en.status[status] || status;
}

async function translate() {
  const text = elements.sourceText.value.trim();

  clearError(elements.errorText);

  if (!text) {
    showError(t("enterText"), elements.errorText);
    elements.sourceText.focus();
    return;
  }

  if (text.length > MAX_TEXT_LENGTH) {
    showError(t("keepUnderLimit"), elements.errorText);
    return;
  }

  const cachedResult = getCachedResult(text);

  if (cachedResult) {
    state.currentResult = cachedResult;
    renderResult(cachedResult);
    saveHistory({ input: text, direction: state.direction, tone: state.tone, provider: state.provider, result: cachedResult });
    clearSourceText();
    setStatus("Ready");
    return;
  }

  state.currentResult = null;
  resetResult();
  setBusy(true);

  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...deviceHeaders()
      },
      body: JSON.stringify({
        text,
        context: "",
        direction: state.direction,
        tone: state.tone,
        provider: state.provider
      })
    });
    const data = await readJsonResponse(response, "/api/translate");

    if (!response.ok) {
      throw new Error(data.error || t("translationFailed"));
    }

    state.currentResult = data;
    renderResult(data);
    saveCachedResult(text, data);
    saveHistory({ input: text, direction: state.direction, tone: state.tone, provider: state.provider, result: data });
    clearSourceText();
  } catch (error) {
    showError(error instanceof Error ? error.message : t("translationFailed"), elements.errorText);
  } finally {
    setBusy(false);
  }
}

function getCachedResult(text) {
  return state.resultCache[createResultCacheKey(text)] || null;
}

function saveCachedResult(text, result) {
  const key = createResultCacheKey(text);
  const nextCache = {
    [key]: result,
    ...state.resultCache
  };

  state.resultCache = Object.fromEntries(Object.entries(nextCache).slice(0, RESULT_CACHE_LIMIT));
  TEXT_STORAGE.setItem(RESULT_CACHE_KEY, JSON.stringify(state.resultCache));
}

function createResultCacheKey(text) {
  return JSON.stringify({
    text: text.trim(),
    direction: state.direction,
    tone: state.tone,
    provider: state.provider
  });
}

async function readJsonResponse(response, endpoint) {
  const text = await response.text();

  if (!text.trim()) {
    throw new Error(`API returned an empty response. Status: ${response.status}. Try opening ${endpoint} on your live site to check whether the Worker is active.`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`API did not return JSON. Status: ${response.status}. First part of response: ${text.slice(0, 180)}`);
  }
}

function renderResult(result) {
  elements.languagePair.textContent = `${result.sourceLanguage || "Source"} → ${result.targetLanguage || "Target"}`;
  elements.translationText.textContent = result.translation || t("noTranslationReturned");
  elements.pinyinText.textContent = result.pinyin || t("noPinyinReturned");
  elements.meaningText.textContent = result.meaning || t("noMeaningReturned");
  renderTerms(result.terms || []);
  renderAlternatives(result.alternatives || []);
}

function resetResult() {
  elements.languagePair.textContent = t("waitingText");
  elements.translationText.textContent = t("translationPlaceholder");
  elements.pinyinText.textContent = t("pinyinPlaceholder");
  elements.meaningText.textContent = t("meaningPlaceholder");
  elements.termsList.replaceChildren(emptyItem(t("termsPlaceholder")));
  elements.alternativesList.replaceChildren(emptyItem(t("alternativesPlaceholder")));
}

function renderTerms(terms) {
  elements.termsList.replaceChildren();

  if (!terms.length) {
    elements.termsList.append(emptyItem(t("noKeyTermsReturned")));
    return;
  }

  for (const term of terms) {
    const item = document.createElement("li");
    item.className = "term-item";

    const head = document.createElement("div");
    head.className = "term-head";

    const title = document.createElement("strong");
    title.textContent = [term.source, term.translation].filter(Boolean).join(" → ");

    const pinyin = document.createElement("span");
    pinyin.textContent = term.pinyin || "";

    const meaning = document.createElement("p");
    meaning.textContent = term.meaning || "";

    const note = document.createElement("small");
    note.textContent = term.note || "";

    head.append(title, pinyin);
    item.append(head, meaning, note);
    elements.termsList.append(item);
  }
}

function renderAlternatives(alternatives) {
  elements.alternativesList.replaceChildren();

  if (!alternatives.length) {
    elements.alternativesList.append(emptyItem(t("noAlternatePhrasingReturned")));
    return;
  }

  for (const alternative of alternatives) {
    const item = document.createElement("li");
    item.className = "alternative-item";

    const label = document.createElement("strong");
    label.textContent = alternative.label || t("alternativeLabel");

    const text = document.createElement("p");
    text.textContent = alternative.text || "";

    const meta = document.createElement("small");
    meta.textContent = [alternative.pinyin, alternative.whenToUse].filter(Boolean).join(" · ");

    item.append(label, text, meta);
    elements.alternativesList.append(item);
  }
}

function emptyItem(text) {
  const item = document.createElement("li");
  item.className = "empty-state";
  item.textContent = text;
  return item;
}

function selectSegment(event, stateKey, dataKey) {
  const button = event.target.closest("button");

  if (!button || !button.dataset[dataKey]) {
    return;
  }

  state[stateKey] = button.dataset[dataKey];

  for (const segment of button.parentElement.querySelectorAll(".segment")) {
    segment.classList.toggle("active", segment === button);
  }

}

async function pasteFromClipboard(target, updateCount, errorElement) {
  clearError(errorElement);

  try {
    const text = await navigator.clipboard.readText();
    target.value = text;
    updateCount();
    target.focus();
  } catch {
    showError(t("clipboardBlocked"), errorElement);
  }
}

function clearInput() {
  clearSourceText();
  state.currentResult = null;
  resetResult();
  clearError(elements.errorText);
  elements.sourceText.focus();
}

function clearSourceText() {
  elements.sourceText.value = "";
  updateCharCount();
}

async function copyTranslation() {
  if (!state.currentResult) {
    await copyText(elements.translationText.textContent, elements.errorText);
    return;
  }

  const result = state.currentResult;
  await copyText(result.translation || elements.translationText.textContent, elements.errorText);
}

async function copyText(text, errorElement) {
  clearError(errorElement);

  try {
    await navigator.clipboard.writeText(text.trim());
    setStatus("Copied");
    window.setTimeout(() => setStatus("Ready"), 1400);
  } catch {
    showError(t("copyFailed"), errorElement);
  }
}

function saveHistory(entry) {
  const historyEntry = {
    ...entry,
    id: createHistoryId(),
    createdAt: new Date().toISOString()
  };

  state.history = [historyEntry, ...state.history].slice(0, 10);
  TEXT_STORAGE.setItem(HISTORY_KEY, JSON.stringify(state.history));
  renderHistory();
}

function createHistoryId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function loadHistory() {
  try {
    const parsed = JSON.parse(TEXT_STORAGE.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadResultCache() {
  try {
    const parsed = JSON.parse(TEXT_STORAGE.getItem(RESULT_CACHE_KEY) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function loadPageLanguage() {
  const saved = localStorage.getItem(PAGE_LANGUAGE_KEY);
  return UI_COPY[saved] ? saved : "en";
}

function renderHistory() {
  elements.historyList.replaceChildren();

  if (!state.history.length) {
    const empty = document.createElement("p");
    empty.className = "empty-history";
    empty.textContent = t("emptyHistory");
    elements.historyList.append(empty);
    return;
  }

  for (const item of state.history) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "history-item";
    button.addEventListener("click", () => restoreHistoryItem(item));

    const input = document.createElement("span");
    input.className = "history-input";
    input.textContent = item.input;

    const output = document.createElement("span");
    output.className = "history-output";
    output.textContent = item.result?.translation || "";

    button.append(input, output);
    elements.historyList.append(button);
  }
}

function restoreHistoryItem(item) {
  elements.sourceText.value = item.input || "";
  state.direction = item.direction || "en-zh";
  state.tone = item.tone || "business";
  state.provider = item.provider || "deepseek";
  state.currentResult = item.result || null;
  updateSelectedSegments();
  updateCharCount();

  if (item.result) {
    renderResult(item.result);
  }
}

function clearHistory() {
  state.history = [];
  state.resultCache = {};
  TEXT_STORAGE.removeItem(HISTORY_KEY);
  TEXT_STORAGE.removeItem(RESULT_CACHE_KEY);
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem(RESULT_CACHE_KEY);
  renderHistory();
}

function clearLegacyPersistentTextStorage() {
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem(RESULT_CACHE_KEY);
}

function updateSelectedSegments() {
  for (const button of elements.directionControl.querySelectorAll(".segment")) {
    button.classList.toggle("active", button.dataset.direction === state.direction);
  }

  for (const button of elements.toneControl.querySelectorAll(".segment")) {
    button.classList.toggle("active", button.dataset.tone === state.tone);
  }

  for (const button of elements.providerControl.querySelectorAll(".segment")) {
    button.classList.toggle("active", button.dataset.provider === state.provider);
  }

}

function updateCharCount() {
  elements.charCount.textContent = `${elements.sourceText.value.length} / ${MAX_TEXT_LENGTH}`;
}

function deviceHeaders() {
  return {
    "x-et-device-id": getDeviceId(),
    "x-et-device-label": getDeviceLabel(),
    "x-et-screen": getScreenLabel(),
    "x-et-timezone": getTimezone()
  };
}

function getDeviceId() {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    deviceId = createHistoryId();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
}

function getDeviceLabel() {
  const saved = localStorage.getItem(DEVICE_LABEL_KEY);

  if (saved) {
    return saved;
  }

  const platform = navigator.userAgentData?.platform || navigator.platform || "Web";
  const label = `${platform} ${getScreenLabel()} ${getTimezone()}`;
  localStorage.setItem(DEVICE_LABEL_KEY, label);
  return label;
}

function getScreenLabel() {
  const ratio = Math.round((window.devicePixelRatio || 1) * 100) / 100;
  return `${screen.width}x${screen.height}@${ratio}x`;
}

function getTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
}

function setBusy(isBusy) {
  elements.translateButton.disabled = isBusy;
  elements.translateButton.textContent = isBusy ? t("translatingButton") : t("translateButton");
  setStatus(isBusy ? "Translating" : "Ready");
}

function setStatus(text) {
  elements.connectionStatus.dataset.status = text;
  elements.connectionStatus.textContent = tStatus(text);
}

function showError(message, errorElement) {
  errorElement.textContent = message;
  setStatus("Error");
}

function clearError(errorElement) {
  errorElement.textContent = "";
}

window.TranslatorApp = {
  renderTerms,
  copyTranslation
};
