<script>
  import { createEventDispatcher } from "svelte";

  export let baseUrl = "";
  export let apiKey = "";
  export let model = "";
  export let temperature = 0.2;

  const dispatch = createEventDispatcher();

  function close() {
    dispatch("close");
  }

  function save() {
    dispatch("save");
  }

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      close();
    }
  }

  function handleOverlayKeydown(event) {
    if (event.key === "Escape") {
      close();
      return;
    }

    if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
      close();
    }
  }

  function handleManualModelChange() {
    dispatch("manualModelChange");
  }

  function handleWindowKeydown(event) {
    if (event.key === "Escape") {
      close();
    }
  }
</script>

<svelte:window on:keydown={handleWindowKeydown} />

<div
  class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20"
  role="button"
  tabindex="0"
  aria-label="Close preferences"
  on:click={handleOverlayClick}
  on:keydown={handleOverlayKeydown}
>
  <div
    class="bg-gray-800 p-6 rounded shadow-lg max-w-md w-full"
    role="dialog"
    aria-modal="true"
    tabindex="0"
    on:pointerdown|stopPropagation
  >
    <h2 class="text-lg font-bold mb-4">Preferences</h2>

    <div class="flex flex-col gap-3">
      <label class="flex flex-col gap-1" for="prefBaseUrl">
        <span class="text-sm text-gray-300">LM Studio Base URL</span>
        <input
          id="prefBaseUrl"
          type="text"
          bind:value={baseUrl}
          class="w-full p-2 bg-gray-900 border border-gray-700 rounded"
          placeholder="http://localhost:1234"
        />
      </label>

      <label class="flex flex-col gap-1" for="prefApiKey">
        <span class="text-sm text-gray-300">API Key (optional)</span>
        <input
          id="prefApiKey"
          type="text"
          bind:value={apiKey}
          class="w-full p-2 bg-gray-900 border border-gray-700 rounded"
          placeholder="Bearer token"
        />
      </label>

      <label class="flex flex-col gap-1" for="prefModel">
        <span class="text-sm text-gray-300">Model (manual override)</span>
        <input
          id="prefModel"
          type="text"
          bind:value={model}
          class="w-full p-2 bg-gray-900 border border-gray-700 rounded"
          placeholder="llama-3.1-8b-instruct"
          on:change={handleManualModelChange}
        />
      </label>

      <label class="flex flex-col gap-1" for="prefTemp">
        <span class="text-sm text-gray-300">Temperature</span>
        <input
          id="prefTemp"
          type="number"
          step="0.1"
          min="0"
          max="2"
          bind:value={temperature}
          class="w-full p-2 bg-gray-900 border border-gray-700 rounded"
        />
      </label>
    </div>

    <div class="mt-4 flex justify-end gap-2">
      <button
        type="button"
        on:click={close}
        class="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 border border-gray-600"
      >
        Cancel
      </button>
      <button
        type="button"
        on:click={save}
        class="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white"
      >
        Save
      </button>
    </div>
  </div>
</div>
