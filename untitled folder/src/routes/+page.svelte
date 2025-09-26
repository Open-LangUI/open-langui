<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import HeaderBar from "$lib/components/HeaderBar.svelte";
  import PreferencesModal from "$lib/components/PreferencesModal.svelte";
  import TranslatorWorkspace from "$lib/components/TranslatorWorkspace.svelte";

  let showPrefs = false;

  let baseUrl = "http://localhost:1234";
  let apiKey = "";
  let model = "";
  let temperature = 0.2;

  let models = [];
  let modelsLoading = false;
  let modelsError = "";

  async function loadModels() {
    if (!browser) return;
    modelsLoading = true;
    modelsError = "";
    try {
      const res = await fetch(`${baseUrl}/v1/models`, {
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
        }
      });
      const json = await res.json();
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
    if (typeof payload === "object") {
      for (const key of ["data", "models", "items", "list", "result"])
        if (Array.isArray(payload[key])) return payload[key];

      for (const value of Object.values(payload)) {
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
  });

  onDestroy(() => {
    if (!browser) return;
    window.removeEventListener("keydown", handleGlobalKeydown);
  });

  function closePrefsAndReloadModels() {
    showPrefs = false;
    loadModels();
  }
</script>

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
      {baseUrl}
      {apiKey}
      {model}
      {temperature}
    />
  </main>

  <!-- Preferences Modal -->
  {#if showPrefs}
    <PreferencesModal
      bind:baseUrl
      bind:apiKey
      bind:model
      bind:temperature
      on:close={() => (showPrefs = false)}
      on:save={closePrefsAndReloadModels}
    />
  {/if}
</div>
