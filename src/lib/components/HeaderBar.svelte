<script>
  import { createEventDispatcher } from "svelte";
  import ModelSelect from "$lib/components/ModelSelect.svelte";

  export let model = "";
  export let models = [];
  export let modelsLoading = false;
  export let modelsError = "";
  export let onModelChange = () => {};

  const dispatch = createEventDispatcher();

  function handlePreferencesToggle() {
    dispatch("togglePrefs");
  }
</script>

<header class="sticky top-0 bg-zinc-900 p-4 flex flex-wrap items-center justify-between gap-4 z-[1000]">
  <div class="flex items-center gap-3 flex-1 min-w-0">
    <a href="/" class="flex items-center group" aria-label="OpenLang home">
      <img src="/images/openlang.svg" alt="OpenLang" class="h-7 w-auto group-hover:animate-tilt-shake" />
    </a>
    <ModelSelect
      bind:model
      {models}
      {modelsLoading}
      {modelsError}
      onModelChange={onModelChange}
    />
  </div>
  <button
    type="button"
    on:click={handlePreferencesToggle}
    class="px-2 py-2 bg-transparent rotate-90 rounded-lg flex items-center gap-2 transition-colors hover:bg-zinc-600/60"
  >
    <img src="/images/preferences.svg" alt="Open Preferences" class="h-6 w-auto" />
  </button>
</header>