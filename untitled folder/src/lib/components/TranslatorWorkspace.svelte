<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { languages, defaultSource, defaultTarget } from "$lib/languages.js";

  export let baseUrl = "http://localhost:1234";
  export let apiKey = "";
  export let model = "";
  export let temperature = 0.2;

  let inputText = "";
  let outputText = "";
  let outputRomanization = "";
  let isTranslating = false;
  let placeholderVisible = true;
  let textAreaRef;
  let sourceDropdownRef;
  let targetDropdownRef;

  let sourceLang = defaultSource;
  let targetLang = defaultTarget;

  let recentSources = [defaultSource, "en", defaultTarget];
  let recentTargets = ["en", defaultTarget, "ja"];

  let showSourceDropdown = false;
  let showTargetDropdown = false;

  let debounceId;
  let previousModel;

  function loadRecents() {
    if (!browser) return;
    const storedSources = localStorage.getItem("recentSources");
    const storedTargets = localStorage.getItem("recentTargets");

    if (storedSources) {
      try {
        const parsed = JSON.parse(storedSources);
        if (Array.isArray(parsed) && parsed.length) recentSources = parsed;
      } catch {}
    }

    if (storedTargets) {
      try {
        const parsed = JSON.parse(storedTargets);
        if (Array.isArray(parsed) && parsed.length) recentTargets = parsed;
      } catch {}
    }

    if (!recentSources.includes("auto")) {
      recentSources = ["auto", ...recentSources];
    } else {
      recentSources = ["auto", ...recentSources.filter((l) => l !== "auto")];
    }

    recentTargets = recentTargets.filter((l) => l !== "auto");
  }

  function saveRecents() {
    if (!browser) return;
    localStorage.setItem("recentSources", JSON.stringify(recentSources));
    localStorage.setItem("recentTargets", JSON.stringify(recentTargets));
  }

  function updateRecents(listName, lang, max = 3) {
    if (listName === "recentSources") {
      if (lang === "auto") {
        sourceLang = "auto";
        return;
      }

      sourceLang = lang;
      const withoutAuto = recentSources.filter((item) => item !== "auto" && item !== lang);
      recentSources = ["auto", lang, ...withoutAuto].slice(0, max);
      saveRecents();
    } else {
      if (lang === "auto") return;

      targetLang = lang;
      recentTargets = [lang, ...recentTargets.filter((item) => item !== lang)].slice(0, max);
      saveRecents();
    }
  }

  function setSource(lang) {
    updateRecents("recentSources", lang);
    showSourceDropdown = false;
    translate();
  }

  function setTarget(lang) {
    updateRecents("recentTargets", lang);
    showTargetDropdown = false;
    translate();
  }

  function switchLanguages() {
    if (sourceLang === "auto") return;
    const oldSource = sourceLang;
    sourceLang = targetLang;
    targetLang = oldSource;
    updateRecents("recentSources", sourceLang);
    updateRecents("recentTargets", targetLang);
    translate();
  }

  function handleInput() {
    clearTimeout(debounceId);
    outputText = "";
    outputRomanization = "";
    debounceId = setTimeout(() => translate(), 700);
  }

  async function translate() {
    if (!inputText.trim()) {
      outputText = "";
      outputRomanization = "";
      isTranslating = false;
      return;
    }

    if (!model) {
      outputText = "Select a model to translate.";
      outputRomanization = "";
      isTranslating = false;
      return;
    }

    isTranslating = true;
    outputText = "Translating…";
    outputRomanization = "";

    try {
      const targetMeta = languages.find((l) => l.code === targetLang);
      const romanizeClause = targetMeta?.romanize
        ? (targetMeta.prompt || "Also include a 'romanization' string appropriate for this language.")
        : "Do not include romanization.";

      const response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
        },
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
              content: `Translate the following text from ${sourceLang} to ${targetLang}.\nText: ${inputText}`
            }
          ]
        })
      });

      const data = await response.json();
      const raw = data?.choices?.[0]?.message?.content ?? "";

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
      outputRomanization = targetMeta?.romanize ? (parsed.romanization || "") : "";

      if (!outputText) {
        outputText = "⚠️ Translation error (empty output)";
      }
    } catch (err) {
      console.error(err);
      outputText = "⚠️ Translation error";
      outputRomanization = "";
    } finally {
      isTranslating = false;
    }
  }

  function handleGlobalKeydown(e) {
    if (e.key === "Escape") {
      showSourceDropdown = false;
      showTargetDropdown = false;
      return;
    }

    if (e.key === "/" && !e.defaultPrevented && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const targetTag = e.target?.tagName?.toLowerCase();
      if (targetTag === "input" || targetTag === "textarea") return;

      e.preventDefault();
      if (textAreaRef) {
        textAreaRef.focus();
        placeholderVisible = false;
      }
    }
  }

  function handleGlobalClick(event) {
    if (showSourceDropdown && sourceDropdownRef && !sourceDropdownRef.contains(event.target)) {
      showSourceDropdown = false;
    }
    if (showTargetDropdown && targetDropdownRef && !targetDropdownRef.contains(event.target)) {
      showTargetDropdown = false;
    }
  }

  onMount(() => {
    if (!browser) return;
    loadRecents();
    window.addEventListener("keydown", handleGlobalKeydown);
    window.addEventListener("click", handleGlobalClick);
  });

  onDestroy(() => {
    if (!browser) return;
    clearTimeout(debounceId);
    window.removeEventListener("keydown", handleGlobalKeydown);
    window.removeEventListener("click", handleGlobalClick);
  });

  $: if (previousModel !== undefined && model !== previousModel && inputText.trim() && model) {
    translate();
  }

  $: previousModel = model;
</script>

<div class="grid grid-cols-1 lg:grid-cols-2 min-h-[200px] gap-6 relative z-0">
  <div class="flex flex-col gap-2">
    <div class="flex gap-2 flex-wrap relative">
      {#each recentSources as code}
        {#if languages.find((l) => l.code === code)}
          <button
            type="button"
            class="px-3 py-1 rounded text-sm transition-colors {sourceLang === code
              ? 'bg-zinc-800/80 text-white'
              : 'bg-transparent text-zinc-300 hover:bg-zinc-800/70 hover:text-white'}"
            on:click={() => setSource(code)}
          >
            {languages.find((l) => l.code === code)?.name}
          </button>
        {/if}
      {/each}

      <div class="relative" bind:this={sourceDropdownRef}>
        <button
          type="button"
          class="px-3 py-1 rounded-md text-sm text-zinc-300 flex items-center gap-1 bg-transparent transition-colors hover:bg-zinc-800/70 hover:text-white"
          on:click={() => (showSourceDropdown = !showSourceDropdown)}
          aria-haspopup="listbox"
          aria-expanded={showSourceDropdown}
        >
          <span>More</span>
          <svg class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fill-rule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clip-rule="evenodd"
            />
          </svg>
        </button>

        {#if showSourceDropdown}
          <div
            class="absolute left-0 mt-2 min-w-[200px] bg-zinc-900 rounded shadow-lg z-40 max-h-60 overflow-auto p-2"
            role="listbox"
          >
            {#each languages.filter((l) => !recentSources.includes(l.code)) as lang}
              <button
                type="button"
                class="w-full text-left px-3 py-2 text-sm text-zinc-200 bg-transparent cursor-pointer rounded-md transition-colors duration-150 hover:bg-zinc-700/70 hover:text-white"
                on:click={() => setSource(lang.code)}
              >
                {lang.name}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <div class="relative flex-1 w-full">
      <textarea
        bind:value={inputText}
        on:input={handleInput}
        class="flex-1 rounded-xl bg-zinc-800 p-3 pr-10 h-full resize-none focus:outline-none w-full"
        placeholder=""
        aria-label="Input text"
        on:focus={() => (placeholderVisible = false)}
        on:blur={() => (placeholderVisible = !inputText)}
        bind:this={textAreaRef}
      ></textarea>

      {#if inputText}
        <button
          type="button"
          class="absolute top-2 right-2 h-6 w-6 rounded-full bg-zinc-700/70 text-zinc-200 flex items-center justify-center text-xs hover:bg-zinc-600 transition-colors"
          aria-label="Clear input"
          on:click={() => {
            inputText = "";
            outputText = "";
            outputRomanization = "";
            placeholderVisible = true;
            textAreaRef?.focus();
          }}
        >
          ✕
        </button>
      {/if}

      {#if placeholderVisible && !inputText}
        <div class="absolute inset-0 px-3 py-2 text-zinc-500 pointer-events-none flex gap-2">
          <span>Type</span>
          <img src="/images/slash.svg" alt="Slash key" class="mt-1 h-4 w-4" />
          <span>to input</span>
        </div>
      {/if}
    </div>
  </div>

  <div class="flex flex-col gap-2 h-full">
    <div class="flex gap-2 flex-wrap items-center relative">
      <button
        type="button"
        on:click={switchLanguages}
        class="px-3 py-1 rounded bg-zinc-700 hover:bg-zinc-600 text-sm"
        title="Switch languages"
      >
        ⇄
      </button>

      {#each recentTargets as code}
        {#if languages.find((l) => l.code === code && l.code !== "auto")}
          <button
            type="button"
            class="px-3 py-1 rounded text-sm transition-colors {targetLang === code
              ? 'bg-zinc-800/80 text-white'
              : 'bg-transparent text-zinc-300 hover:bg-zinc-800/70 hover:text-white'}"
            on:click={() => setTarget(code)}
          >
            {languages.find((l) => l.code === code).name}
          </button>
        {/if}
      {/each}

      <div class="relative" bind:this={targetDropdownRef}>
        <button
          type="button"
          class="px-3 py-1 rounded-md text-sm text-zinc-300 flex items-center gap-1 bg-transparent transition-colors hover:bg-zinc-800/70 hover:text-white"
          on:click={() => (showTargetDropdown = !showTargetDropdown)}
          aria-haspopup="listbox"
          aria-expanded={showTargetDropdown}
        >
          <span>More</span>
          <svg class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fill-rule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clip-rule="evenodd"
            />
          </svg>
        </button>

        {#if showTargetDropdown}
          <div
            class="absolute left-0 mt-2 min-w-[200px] bg-zinc-900 rounded shadow-lg z-40 max-h-60 overflow-auto p-2"
            role="listbox"
          >
            {#each languages.filter((l) => !recentTargets.includes(l.code) && l.code !== "auto") as lang}
              <button
                type="button"
                class="w-full text-left px-3 py-2 text-sm text-zinc-200 bg-transparent cursor-pointer rounded-md transition-colors duration-150 hover:bg-zinc-700/70 hover:text-white"
                on:click={() => setTarget(lang.code)}
              >
                {lang.name}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <div class="relative flex-1 rounded-xl bg-zinc-800 h-full p-3 flex flex-col gap-3">
      <div class={`flex-1 whitespace-pre-wrap ${isTranslating ? "text-zinc-400 italic" : "text-zinc-100"}`}>
        {outputText}
      </div>

      {#if outputRomanization}
        <div class="text-zinc-400 italic whitespace-pre-wrap">{outputRomanization}</div>
      {/if}

      {#if !isTranslating && outputText}
        <div class="mt-auto flex items-center justify-end gap-2">
          <button
            type="button"
            class="p-2 rounded-md text-zinc-300 bg-transparent transition-colors hover:bg-zinc-700/70"
            on:click={() => navigator.clipboard.writeText(outputText || "")}
            aria-label="Copy translation"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>
      {/if}

      {#if isTranslating}
        <div class="absolute bottom-3 right-3">
          <svg class="h-5 w-5 animate-spin text-zinc-400" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"></path>
          </svg>
        </div>
      {/if}
    </div>
  </div>
</div>
