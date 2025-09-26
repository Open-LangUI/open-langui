<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import HeaderBar from "$lib/components/HeaderBar.svelte";
  import PreferencesModal from "$lib/components/PreferencesModal.svelte";
  import TranslatorWorkspace from "$lib/components/TranslatorWorkspace.svelte";
  import { invalidateAll } from "$app/navigation";
  import SplashScreen from "$lib/components/SplashScreen.svelte";

  export let data;

  let languages = data.languages;
  let defaultSource = data.defaultSource;
  let defaultTarget = data.defaultTarget;

  $: languages = data.languages;
  $: defaultSource = data.defaultSource;
  $: defaultTarget = data.defaultTarget;

  let showPrefs = false;

  let baseUrl = data.connections.base_url;
  let apiKey = data.connections.api_key;
  let model = "";
  let temperature = data.connections.temperature ?? 0.2;

  $: baseUrl = data.connections.base_url;
  $: apiKey = data.connections.api_key;
  $: temperature = data.connections.temperature ?? 0.2;

  let models = [];
  let modelsLoading = false;
  let modelsError = "";
  let showSplash = true;
  let splashTimer;

  async function loadModels() {
    if (!browser) return;
    modelsLoading = true;
    modelsError = "";
    try {
      const res = await fetch(`/api/proxy/v1/models`);
      if (!res.ok) {
        throw new Error(`Model request failed: ${res.status}`);
      }
      const json = await res.json();
      /** @type {any[]} */
      const rawList = extractModelEntries(json);

      const normalized = rawList
        .map((item) => {
          if (typeof item === "string") return item;
          if (item && typeof item === "object") {
            return item.id || item.name || item.model_id || item.slug || item.label || null;
          }
          return null;
        })
        .filter(Boolean);

      const unique = Array.from(new Set(normalized));
      models = unique;

      if (unique.length === 0) {
        model = "";
        modelsError = "Please start LM Studio API server.";
        return;
      }

      modelsError = "";

      if (!model || !unique.includes(model)) {
        model = unique[0];
      }
    } catch (err) {
      console.error("Failed to load models:", err);
      models = [];
      model = "";
      modelsError = "Please start LM Studio API server.";
    } finally {
      modelsLoading = false;
    }
  }

  function extractModelEntries(payload, depth = 0) {
    if (!payload || depth > 5) return [];
    if (Array.isArray(payload)) return payload;
    if (payload && typeof payload === "object") {
      const record = /** @type {Record<string, unknown>} */ (payload);
      for (const key of ["data", "models", "items", "list", "result"]) {
        const bucket = record[key];
        if (Array.isArray(bucket)) return bucket;
      }

      for (const value of Object.values(record)) {
        const nested = extractModelEntries(value, depth + 1);
        if (nested.length) return nested;
      }
    }
    return [];
  }

  function handleGlobalKeydown(event) {
    if (event.key === "Escape" && showPrefs) {
      showPrefs = false;
    }
  }

  onMount(() => {
    if (!browser) return;
    window.addEventListener("keydown", handleGlobalKeydown);

    loadModels();
    splashTimer = window.setTimeout(() => {
      showSplash = false;
    }, 200);
  });

  onDestroy(() => {
    if (!browser) return;
    window.removeEventListener("keydown", handleGlobalKeydown);
    if (splashTimer) {
      clearTimeout(splashTimer);
    }
  });

  async function closePrefsAndReloadModels() {
    showPrefs = false;
    await invalidateAll();
    loadModels();
  }

  async function refreshLanguages() {
    await invalidateAll();
  }
</script>

<svelte:head>
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" type="image/svg+xml" href="/images/openlang.svg" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
</svelte:head>

<div class="min-h-screen bg-zinc-900 text-zinc-100 flex flex-col">
  <!-- Header -->
  <HeaderBar
    bind:model={model}
    {models}
    {modelsLoading}
    {modelsError}
    on:togglePrefs={() => (showPrefs = !showPrefs)}
  />

  <!-- Main -->
  <main class="flex-1 max-w-7xl mx-auto p-6 w-full">
    <TranslatorWorkspace
      {model}
      {temperature}
      {languages}
      defaultSource={defaultSource}
      defaultTarget={defaultTarget}
    />
  </main>

  <!-- Preferences Modal -->
  {#if showPrefs}
    <PreferencesModal
      bind:baseUrl
      bind:apiKey
      bind:temperature
      {languages}
      on:close={() => (showPrefs = false)}
      on:save={closePrefsAndReloadModels}
      on:languagesUpdated={refreshLanguages}
    />
  {/if}
</div>

<SplashScreen visible={showSplash} />
