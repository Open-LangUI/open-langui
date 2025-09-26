import { z as bind_props, x as head, F as ensure_array_like, G as attr_class, y as attr, J as slot, K as stringify } from './index2-BJFtE22z.js';
import { a as ssr_context, e as escape_html } from './context-C33eFtlD.js';
import { D as fallback } from './utils2-nOtegcHM.js';
import './state.svelte-lwueA40H.js';

function onDestroy(fn) {
  /** @type {SSRContext} */
  ssr_context.r.on_destroy(fn);
}
function ModelSelect($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let model = fallback($$props["model"], "");
    let models = fallback($$props["models"], () => [], true);
    let modelsLoading = fallback($$props["modelsLoading"], false);
    let modelsError = fallback($$props["modelsError"], "");
    let onModelChange = fallback($$props["onModelChange"], () => {
    });
    let isOpen = false;
    let searchTerm = "";
    let label = "";
    let displayLabel = "";
    function handleDocumentClick(event) {
      return;
    }
    onDestroy(() => {
      if (typeof document === "undefined") return;
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("focusin", handleDocumentClick);
    });
    label = modelsLoading ? "Loading models…" : model || models[0] || modelsError || "No models available";
    {
      searchTerm = "";
    }
    searchTerm ? models.filter((item) => item.toLowerCase().includes(searchTerm.toLowerCase())) : models;
    displayLabel = label.length > 20 ? `${label.slice(0, 19)}…` : label;
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="flex items-center gap-3 w-full sm:w-full sm:max-w-[50vw] relative z-[950]"><div class="relative flex-1 min-w-0"><button type="button" class="flex w-full items-center gap-2 text-lg text-zinc-100 focus:outline-none bg-transparent border-0 p-0 cursor-pointer" aria-haspopup="listbox"${attr("aria-expanded", isOpen)} aria-controls="model-select-menu"${attr("disabled", modelsLoading || !models.length && !modelsError, true)}><span${attr_class(`truncate ${modelsError ? "text-red-300" : ""}`)}>${escape_html(displayLabel)}</span> <svg class="w-5 h-5 text-zinc-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clip-rule="evenodd"></path></svg></button> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { model, models, modelsLoading, modelsError, onModelChange });
  });
}
function HeaderBar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let model = fallback($$props["model"], "");
    let models = fallback($$props["models"], () => [], true);
    let modelsLoading = fallback($$props["modelsLoading"], false);
    let modelsError = fallback($$props["modelsError"], "");
    let onModelChange = fallback($$props["onModelChange"], () => {
    });
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<header class="sticky top-0 bg-zinc-900 p-4 flex flex-wrap items-center justify-between gap-4 z-[1000]"><div class="flex items-center gap-3 flex-1 min-w-0"><a href="/" class="flex items-center group" aria-label="OpenLang home"><img src="/images/openlang.svg" alt="OpenLang" class="h-7 w-auto group-hover:animate-tilt-shake"/></a> `);
      ModelSelect($$renderer3, {
        models,
        modelsLoading,
        modelsError,
        onModelChange,
        get model() {
          return model;
        },
        set model($$value) {
          model = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div> <button type="button" class="px-2 py-2 bg-transparent rotate-90 rounded-lg flex items-center gap-2 transition-colors hover:bg-zinc-600/60"><img src="/images/preferences.svg" alt="Open Preferences" class="h-6 w-auto"/></button></header>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { model, models, modelsLoading, modelsError, onModelChange });
  });
}
function TranslatorWorkspace($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let model = fallback($$props["model"], "");
    let temperature = fallback($$props["temperature"], 0.2);
    let languages = fallback($$props["languages"], () => [], true);
    let defaultSource = fallback($$props["defaultSource"], "auto");
    let defaultTarget = fallback($$props["defaultTarget"], "zh-CN");
    let inputText = "";
    let outputText = "";
    let outputRomanization = "";
    let isTranslating = false;
    let sourceLang = defaultSource;
    let targetLang = defaultTarget;
    let recentSources = [defaultSource, "en", defaultTarget];
    let recentTargets = ["en", defaultTarget, "ja"];
    let showSourceDropdown = false;
    let showTargetDropdown = false;
    let initialTargetSet = false;
    let placeholderText = "";
    let previousModel;
    let showOutput = true;
    let thinkText = "";
    let showThinkingDetails = false;
    let thinkDurationSeconds = 0;
    function ensureInitialTargetSelected() {
      if (!languages || languages.length === 0) return;
      const validTargets = languages.filter((l) => l.code !== "auto");
      if (!validTargets.length) return;
      const validCodes = validTargets.map((l) => l.code);
      const firstRecent = recentTargets.find((code) => validCodes.includes(code));
      const desired = firstRecent ?? validCodes[0];
      if (!desired) return;
      if (!validCodes.includes(targetLang) || targetLang !== desired) {
        targetLang = desired;
      }
      const filtered = recentTargets.filter((code) => code !== desired && validCodes.includes(code));
      const newRecentsBase = [desired, ...filtered];
      if (newRecentsBase.length < 3) {
        for (const code of validCodes) {
          if (!newRecentsBase.includes(code)) {
            newRecentsBase.push(code);
          }
          if (newRecentsBase.length >= 3) break;
        }
      }
      const newRecents = newRecentsBase.slice(0, 3);
      const arraysDiffer = newRecents.length !== recentTargets.length || newRecents.some((code, index) => code !== recentTargets[index]);
      if (arraysDiffer) {
        recentTargets = newRecents;
      }
    }
    async function translate() {
      if (!inputText.trim()) {
        outputText = "";
        outputRomanization = "";
        isTranslating = false;
        thinkText = "";
        showThinkingDetails = false;
        thinkDurationSeconds = 0;
        return;
      }
      if (!model) {
        outputText = "Select a model to translate.";
        outputRomanization = "";
        isTranslating = false;
        thinkText = "";
        showThinkingDetails = false;
        thinkDurationSeconds = 0;
        return;
      }
      const translationStartedAt = Date.now();
      isTranslating = true;
      outputText = "Translating…";
      outputRomanization = "";
      thinkText = "";
      showThinkingDetails = false;
      thinkDurationSeconds = 0;
      try {
        const targetMeta = languages.find((l) => l.code === targetLang);
        const romanizeClause = targetMeta?.romanize ? targetMeta.prompt || `Also include a 'romanization' string that reflects the pronunciation of the translated output text (never the source text).` : "Do not include romanization.";
        const response = await fetch(`/api/proxy/v1/chat/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            temperature,
            messages: [
              {
                role: "system",
                content: `
You are a professional translator. Preserve tone, punctuation, spacing, and line breaks.
Return ONLY strict JSON (no code fences, no extra text) in this exact shape:
{"output": "translated text", "romanization": "if applicable, otherwise empty string"}.
${romanizeClause}
`
              },
              {
                role: "user",
                content: `Translate the following text from ${sourceLang} to ${targetLang}.
Text: ${inputText}`
              }
            ]
          })
        });
        const data = await response.json();
        let raw = data?.choices?.[0]?.message?.content ?? "";
        let extractedThinking = "";
        const thinkMatch = raw.match(/<think>([\s\S]*?)<\/think>/i);
        if (thinkMatch) {
          extractedThinking = thinkMatch[1].trim();
          raw = raw.replace(thinkMatch[0], "").trim();
        }
        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch {
          const start = raw.indexOf("{");
          const end = raw.lastIndexOf("}");
          if (start !== -1 && end !== -1 && end > start) {
            try {
              parsed = JSON.parse(raw.slice(start, end + 1));
            } catch {
              parsed = { output: raw, romanization: "" };
            }
          } else {
            parsed = { output: raw, romanization: "" };
          }
        }
        outputText = parsed.output || parsed.translation || "";
        outputRomanization = targetMeta?.romanize ? parsed.romanization || "" : "";
        if (extractedThinking) {
          thinkText = extractedThinking;
          const elapsedMs = Date.now() - translationStartedAt;
          thinkDurationSeconds = Math.max(0.1, Math.round(elapsedMs / 1e3 * 10) / 10);
          showThinkingDetails = false;
        }
        if (!outputText) {
          outputText = "⚠️ Translation error (empty output)";
        }
      } catch (err) {
        console.error(err);
        outputText = "⚠️ Translation error";
        outputRomanization = "";
        thinkText = "";
        showThinkingDetails = false;
        thinkDurationSeconds = 0;
      } finally {
        isTranslating = false;
      }
    }
    function formatSecondsDisplay(seconds) {
      if (!seconds || Number.isNaN(seconds)) return "0";
      if (seconds >= 10) return Math.round(seconds).toString();
      return seconds.toFixed(1);
    }
    onDestroy(() => {
      return;
    });
    previousModel = model;
    if (previousModel !== void 0 && model !== previousModel && inputText.trim() && model) {
      translate();
    }
    if (!initialTargetSet && languages.length) {
      ensureInitialTargetSelected();
      initialTargetSet = true;
    }
    if (initialTargetSet && languages.length && !languages.some((l) => l.code === targetLang && l.code !== "auto")) {
      ensureInitialTargetSelected();
    }
    showOutput = true;
    $$renderer2.push(`<div class="grid grid-cols-1 lg:grid-cols-2 min-h-[200px] gap-6 relative z-0"><div class="flex flex-col gap-2"><div class="flex gap-2 flex-wrap relative w-full">`);
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(recentSources);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let code = each_array[$$index];
        if (languages.find((l) => l.code === code)) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<button type="button"${attr_class(`px-3 py-1 rounded text-sm transition-colors ${stringify(sourceLang === code ? "bg-zinc-800/80 text-white" : "bg-transparent text-zinc-300 hover:bg-zinc-800/70 hover:text-white")}`)}>${escape_html(languages.find((l) => l.code === code)?.name)}</button>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--> <div class="relative"><button type="button" class="px-3 py-1 rounded-md text-sm text-zinc-300 flex items-center gap-1 bg-transparent transition-colors hover:bg-zinc-800/70 hover:text-white" aria-haspopup="listbox"${attr("aria-expanded", showSourceDropdown)}><span>More</span> <svg class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clip-rule="evenodd"></path></svg></button> `);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="relative flex-1 w-full min-h-[14rem]"><textarea class="flex-1 rounded-xl bg-zinc-800 p-3 pr-10 h-full resize-none focus:outline-none w-full min-h-[14rem]"${attr("placeholder", placeholderText)} aria-label="Input text">`);
    const $$body = escape_html(inputText);
    if ($$body) {
      $$renderer2.push(`${$$body}`);
    }
    $$renderer2.push(`</textarea> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="absolute inset-0 px-3 py-2 text-zinc-500 pointer-events-none flex gap-2"><span>Type</span> <img src="/images/slash.svg" alt="Slash key" class="mt-1 h-4 w-4"/> <span>to input</span></div>`);
    }
    $$renderer2.push(`<!--]--></div></div> `);
    if (showOutput) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex flex-col gap-2 h-full"><div class="flex gap-2 flex-wrap items-center relative w-full">`);
      {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<button type="button" class="px-3 py-1 rounded bg-zinc-700 hover:bg-zinc-600 text-sm" title="Switch languages">⇄</button>`);
      }
      $$renderer2.push(`<!--]--> `);
      {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<!--[-->`);
        const each_array_2 = ensure_array_like(recentTargets);
        for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
          let code = each_array_2[$$index_2];
          if (languages.find((l) => l.code === code && l.code !== "auto")) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<button type="button"${attr_class(`px-3 py-1 rounded text-sm transition-colors ${stringify(targetLang === code ? "bg-zinc-800/80 text-white" : "bg-transparent text-zinc-300 hover:bg-zinc-800/70 hover:text-white")}`)}>${escape_html(languages.find((l) => l.code === code)?.name ?? code)}</button>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]--> <div class="relative"><button type="button" class="px-3 py-1 rounded-md text-sm text-zinc-300 flex items-center gap-1 bg-transparent transition-colors hover:bg-zinc-800/70 hover:text-white" aria-haspopup="listbox"${attr("aria-expanded", showTargetDropdown)}><span>More</span> <svg class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clip-rule="evenodd"></path></svg></button> `);
        {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div>`);
      }
      $$renderer2.push(`<!--]--></div> <div class="relative flex-1 rounded-xl bg-zinc-800 h-full p-3 flex flex-col gap-3 min-h-[14rem]"><div${attr_class(`flex-1 whitespace-pre-wrap ${isTranslating ? "text-zinc-400 italic" : "text-zinc-100"}`)}>${escape_html(outputText)}</div> `);
      if (outputRomanization) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="text-zinc-400 italic whitespace-pre-wrap">${escape_html(outputRomanization)}</div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (!isTranslating && outputText) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="mt-auto space-y-2"><div class="flex items-center gap-2">`);
        if (thinkText) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<button type="button" class="flex items-center gap-2 rounded-md py-1 text-sm text-zinc-300 transition-colors hover:text-zinc-100"${attr("aria-expanded", showThinkingDetails)}><span>${escape_html(showThinkingDetails ? "Hide thinking" : `Thought for ${formatSecondsDisplay(thinkDurationSeconds)} seconds`)}</span> <svg${attr_class(`h-4 w-4 transition-transform ${showThinkingDetails ? "rotate-180" : ""}`)} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z" clip-rule="evenodd"></path></svg></button>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> <button type="button" class="ml-auto p-2 rounded-md text-zinc-300 bg-transparent transition-colors hover:bg-zinc-700/70" aria-label="Copy translation"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button></div> `);
        if (thinkText && showThinkingDetails) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<pre class="whitespace-pre-wrap rounded-md bg-zinc-900/70 px-3 py-2 text-xs leading-relaxed text-zinc-400">${escape_html(thinkText)}</pre>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (isTranslating) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="absolute bottom-3 right-3"><svg class="h-5 w-5 animate-spin text-zinc-400" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"></path></svg></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { model, temperature, languages, defaultSource, defaultTarget });
  });
}
function SplashScreen($$renderer, $$props) {
  let visible = fallback($$props["visible"], false);
  if (visible) {
    $$renderer.push("<!--[-->");
    $$renderer.push(`<div class="fixed inset-0 z-[1002] flex items-center justify-center bg-black"><!--[-->`);
    slot($$renderer, $$props, "default", {}, () => {
      $$renderer.push(`<img src="/images/openlang.svg" alt="OpenLang" class="w-32 h-32"/>`);
    });
    $$renderer.push(`<!--]--></div>`);
  } else {
    $$renderer.push("<!--[!-->");
  }
  $$renderer.push(`<!--]-->`);
  bind_props($$props, { visible });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let data = $$props["data"];
    let languages = data.languages;
    let defaultSource = data.defaultSource;
    let defaultTarget = data.defaultTarget;
    data.connections.base_url;
    data.connections.api_key;
    let model = "";
    let temperature = data.connections.temperature ?? 0.2;
    let models = [];
    let modelsLoading = false;
    let modelsError = "";
    let showSplash = true;
    onDestroy(() => {
      return;
    });
    languages = data.languages;
    defaultSource = data.defaultSource;
    defaultTarget = data.defaultTarget;
    data.connections.base_url;
    data.connections.api_key;
    temperature = data.connections.temperature ?? 0.2;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      head($$renderer3, ($$renderer4) => {
        $$renderer4.push(`<link rel="icon" href="/favicon.ico" sizes="any"/> <link rel="icon" type="image/svg+xml" href="/images/openlang.svg"/> <link rel="apple-touch-icon" href="/apple-touch-icon.png"/>`);
      });
      $$renderer3.push(`<div class="min-h-screen bg-zinc-900 text-zinc-100 flex flex-col">`);
      HeaderBar($$renderer3, {
        models,
        modelsLoading,
        modelsError,
        get model() {
          return model;
        },
        set model($$value) {
          model = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <main class="flex-1 max-w-7xl mx-auto p-6 w-full">`);
      TranslatorWorkspace($$renderer3, { model, temperature, languages, defaultSource, defaultTarget });
      $$renderer3.push(`<!----></main> `);
      {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--></div> `);
      SplashScreen($$renderer3, { visible: showSplash });
      $$renderer3.push(`<!---->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { data });
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CAWcV3Xb.js.map
