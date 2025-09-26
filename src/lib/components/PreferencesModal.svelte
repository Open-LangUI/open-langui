<script>
  import { createEventDispatcher } from 'svelte';

  export let baseUrl = '';
  export let apiKey = '';
  export let temperature = 0.2;
  export let languages = [];

  const dispatch = createEventDispatcher();

  let activeTab = 'connections';
  let selectedLanguage = null;
  let originalLanguageCode = '';
  let languageForm = { name: '', code: '', romanize: false, prompt: '' };
  let languageError = '';
  let languageSaving = false;
  let addable = [];
  let loadingAddable = false;
  let addError = '';
  let showCustomForm = false;
  let customName = '';
  let customCode = '';
  let customRomanize = false;
  let customPrompt = '';
  let customError = '';
  let customSaving = false;
  let connectionsError = '';
  let connectionsSaving = false;

  function close() {
    dispatch('close');
  }

  async function saveConnections() {
    connectionsError = '';

    const normalizedBaseUrl = baseUrl.trim();
    const numericTemperature = typeof temperature === 'number' ? temperature : Number(temperature);

    if (!normalizedBaseUrl) {
      connectionsError = 'Base URL is required.';
      return;
    }

    if (!Number.isFinite(numericTemperature)) {
      connectionsError = 'Temperature must be a number.';
      return;
    }

    baseUrl = normalizedBaseUrl;
    temperature = numericTemperature;

    connectionsSaving = true;

    try {
      const response = await fetch('/api/connections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_url: normalizedBaseUrl,
          api_key: apiKey,
          temperature: numericTemperature
        })
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || response.statusText);
      }

      dispatch('save');
    } catch (error) {
      connectionsError = error instanceof Error ? error.message : 'Failed to save connections.';
    } finally {
      connectionsSaving = false;
    }
  }

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      close();
    }
  }

  function handleOverlayKeydown(event) {
    if (event.key === 'Escape') {
      close();
      return;
    }

    if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
      close();
    }
  }

  function handleWindowKeydown(event) {
    if (event.key === 'Escape') {
      close();
    }
  }

  function resetCustomForm() {
    customName = '';
    customCode = '';
    customRomanize = false;
    customPrompt = '';
    customError = '';
    customSaving = false;
  }

  function setTab(tab) {
    activeTab = tab;
    if (tab !== 'language-edit') {
      selectedLanguage = null;
      languageError = '';
    }
    if (tab !== 'languages-add') {
      showCustomForm = false;
      resetCustomForm();
    }
    if (tab === 'languages-add') {
      loadAddable();
    }
  }

  function openLanguageEditor(language) {
    selectedLanguage = language;
    originalLanguageCode = language.code;
    languageForm = { ...language };
    languageError = '';
    activeTab = 'language-edit';
  }

  function toggleRomanize() {
    languageForm = { ...languageForm, romanize: !languageForm.romanize };
  }

  function backToLanguageList() {
    selectedLanguage = null;
    languageError = '';
    activeTab = 'languages';
  }

  async function saveLanguage() {
    if (!selectedLanguage) return;

    languageError = '';
    languageSaving = true;

    try {
      const response = await fetch(`/api/languages/${encodeURIComponent(originalLanguageCode)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: languageForm.name.trim(),
          code: languageForm.code.trim(),
          romanize: languageForm.romanize,
          prompt: languageForm.prompt
        })
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || response.statusText);
      }

      dispatch('languagesUpdated');
      backToLanguageList();
    } catch (error) {
      languageError = error instanceof Error ? error.message : 'Failed to update language.';
    } finally {
      languageSaving = false;
    }
  }

  async function loadAddable() {
    if (loadingAddable) return;
    loadingAddable = true;
    addError = '';
    try {
      const res = await fetch('/api/languages/addable');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load languages');
      addable = json.languages || [];
    } catch (e) {
      addError = e instanceof Error ? e.message : 'Failed to load languages';
    } finally {
      loadingAddable = false;
    }
  }

  function openAddLanguages() {
    setTab('languages-add');
  }

  function startCustomLanguage() {
    resetCustomForm();
    showCustomForm = true;
  }

  function cancelCustomLanguage() {
    resetCustomForm();
    showCustomForm = false;
  }

  function toggleCustomRomanize() {
    customRomanize = !customRomanize;
  }

  function sanitizeLanguageInput(value) {
    return value.replace(/[^A-Za-z0-9-]/g, '');
  }

  function handleCustomNameInput(event) {
    const input = /** @type {HTMLInputElement} */ (event.currentTarget);
    const sanitized = sanitizeLanguageInput(input.value);
    if (input.value !== sanitized) {
      input.value = sanitized;
    }
    customName = sanitized;
  }

  function handleCustomCodeInput(event) {
    const input = /** @type {HTMLInputElement} */ (event.currentTarget);
    const sanitized = sanitizeLanguageInput(input.value);
    if (input.value !== sanitized) {
      input.value = sanitized;
    }
    customCode = sanitized;
  }

  async function saveCustomLanguage() {
    const sanitizedName = sanitizeLanguageInput(customName);
    const sanitizedCode = sanitizeLanguageInput(customCode);

    if (sanitizedName !== customName) {
      customName = sanitizedName;
    }

    if (sanitizedCode !== customCode) {
      customCode = sanitizedCode;
    }

    const name = customName.trim();
    const code = customCode.trim();
    const prompt = customPrompt;

    if (!name || !code) {
      customError = 'Name and code are required.';
      return;
    }

    customError = '';
    customSaving = true;

    try {
      const response = await fetch('/api/languages/add-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          code,
          romanize: customRomanize,
          prompt
        })
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || 'Failed to add language.');
      }

      dispatch('languagesUpdated');
      await loadAddable();
      resetCustomForm();
      showCustomForm = false;
    } catch (e) {
      customError = e instanceof Error ? e.message : 'Failed to add language.';
    } finally {
      customSaving = false;
    }
  }

  async function addLanguage(code) {
    try {
      const res = await fetch(`/api/languages/add/${encodeURIComponent(code)}`, { method: 'POST' });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Failed to add language');
      }
      dispatch('languagesUpdated');
      addable = addable.filter((l) => l.code !== code);
      if (activeTab === 'languages-add') {
        loadAddable();
      }
    } catch (e) {
      addError = e instanceof Error ? e.message : 'Failed to add language';
    }
  }

  async function removeLanguage(code) {
    if (!code) return;
    try {
      const res = await fetch(`/api/languages/${encodeURIComponent(code)}`, { method: 'DELETE' });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Failed to remove language');
      }
      dispatch('languagesUpdated');
      if (activeTab === 'languages-add') {
        loadAddable();
      }
    } catch (e) {
      languageError = e instanceof Error ? e.message : 'Failed to remove language';
    }
  }
</script>

<svelte:window on:keydown={handleWindowKeydown} />

<div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start md:items-center justify-center" role="button"
  tabindex="0" aria-label="Close preferences" on:click={handleOverlayClick} on:keydown={handleOverlayKeydown}>
  <div
    class="bg-zinc-900 text-zinc-100 w-full h-full md:h-auto md:max-w-3xl md:rounded-xl shadow-xl md:p-6 p-4 overflow-hidden flex flex-col"
    role="dialog" aria-modal="true" tabindex="0" on:pointerdown|stopPropagation>
    <h2 class="text-xl font-semibold mb-4 md:mb-6">Preferences</h2>

    <div class="mt-3 flex flex-col md:flex-row gap-6 overflow-y-auto flex-1">
      <nav class="flex md:flex-col gap-2 md:w-48 md:sticky md:top-0 bg-zinc-900 md:bg-transparent pb-4 md:pb-0">
        <button type="button" class={ activeTab==='connections'
          ? 'px-3 py-2 rounded-lg bg-zinc-800 text-white text-left'
          : 'px-3 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800/60 text-left' } on:click={()=> setTab('connections')}
          >
          Connections
        </button>
        <button type="button" class={ activeTab==='languages' || activeTab==='languages-add'
          ? 'px-3 py-2 rounded-lg bg-zinc-800 text-white text-left'
          : 'px-3 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800/60 text-left' } on:click={()=> setTab('languages')}
          >
          Languages
        </button>

      </nav>

      <section class="flex-1 min-h-[18rem] pb-20 md:pb-0">
        {#if activeTab === 'connections'}
        <div class="flex flex-col gap-4 flex-1 overflow-y-auto md:max-h-80 md:min-h-60 md:pr-1">
          <label class="flex flex-col gap-1" for="prefBaseUrl">
            <span class="text-sm text-zinc-300">LM Studio Base URL</span>
            <input id="prefBaseUrl" type="text" bind:value={baseUrl}
              class="w-full p-2 bg-zinc-800 rounded border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              placeholder="http://localhost:1234" />
          </label>

          <label class="flex flex-col gap-1" for="prefApiKey">
            <span class="text-sm text-zinc-300">API Key (optional)</span>
            <input id="prefApiKey" type="text" bind:value={apiKey}
              class="w-full p-2 bg-zinc-800 rounded border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              placeholder="Bearer token" />
          </label>

          <label class="flex flex-col gap-1" for="prefTemp">
            <span class="text-sm text-zinc-300">Temperature</span>
            <input id="prefTemp" type="number" step="0.1" min="0" max="2" bind:value={temperature}
              class="w-full p-2 bg-zinc-800 rounded border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
          </label>

          {#if connectionsError}
          <div class="text-sm text-red-400">{connectionsError}</div>
          {/if}
        </div>
        {:else if activeTab === 'languages'}
        <div class="flex flex-col gap-4 flex-1 overflow-y-auto md:max-h-80 md:min-h-60 md:pr-1">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium text-zinc-100">Manage Languages</h3>
              <p class="text-xs text-zinc-400">Edit, add or remove languages.</p>
            </div>
            <button type="button"
              class="flex items-center gap-2 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-sm cursor-pointer"
              on:click={openAddLanguages} aria-label="Add languages">
              <span class="text-lg leading-none">+</span>
              <span>Add</span>
            </button>
          </div>

          <div class="flex flex-col gap-2">
            {#each languages as language}
            <div
              class="flex items-center justify-between bg-zinc-900/60 rounded-lg px-3 py-2 transition-colors cursor-pointer hover:bg-zinc-800"
              role="button" tabindex="0" on:click={()=> openLanguageEditor(language)}
              on:keydown={(event) =>
              (event.key === 'Enter' || event.key === ' ') && openLanguageEditor(language)}
              >
              <div>
                <div class="text-sm font-medium text-zinc-100">{language.name}</div>
                <div class="text-xs uppercase tracking-wide text-zinc-500">{language.code}</div>
              </div>
              <div class="flex items-center gap-3">
                {#if language.romanize}
                <span class="text-xs text-emerald-400 uppercase">Romanization</span>
                {/if}
                <button type="button"
                  class="p-2 rounded-md text-zinc-300 hover:bg-zinc-700/70 transition-colors cursor-pointer"
                  aria-label={`Edit ${language.name}`} on:click={()=> openLanguageEditor(language)}
                  >
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </button>
                {#if language.code !== 'auto'}
                <button type="button"
                  class="p-2 rounded-md text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  aria-label={`Remove ${language.name}`} on:click|stopPropagation={()=> removeLanguage(language.code)}
                  >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4 h-4" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
                {/if}
              </div>
            </div>
            {/each}
          </div>
        </div>
        {:else if activeTab === 'languages-add'}
        <div class="flex flex-col gap-4 flex-1 overflow-y-auto md:max-h-80 md:min-h-60 md:pr-1">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="text-sm font-medium text-zinc-100">Add Languages</h3>
              <p class="text-xs text-zinc-400">Choose additional languages from the library or create your own.</p>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" class="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-sm cursor-pointer"
                on:click={startCustomLanguage}>
                Add Custom
              </button>
            </div>
          </div>

          {#if showCustomForm}
          <div class="border border-zinc-800 bg-zinc-900/70 rounded-lg p-4 flex flex-col gap-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label class="flex flex-col gap-1">
                <span class="text-sm text-zinc-300">Language Name</span>
                <input type="text" bind:value={customName}
                  class="w-full p-2 bg-zinc-800 rounded border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  placeholder="e.g. Klingon" autocomplete="off" on:input={handleCustomNameInput} />
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-sm text-zinc-300">Language Code</span>
                <input type="text" bind:value={customCode}
                  class="w-full p-2 bg-zinc-800 rounded border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  placeholder="e.g. tlh" autocomplete="off" on:input={handleCustomCodeInput} />
              </label>
            </div>

            <div class="flex items-center justify-between bg-zinc-900 px-3 py-2 rounded-lg border border-zinc-800">
              <div>
                <div class="text-sm font-medium text-zinc-100">Romanization</div>
                <div class="text-xs text-zinc-500">Toggle if transliteration output is desired.</div>
              </div>
              <button type="button" class={`px-3 py-1 rounded-full text-sm transition-colors ${ customRomanize
                ? 'bg-emerald-500 text-white' : 'bg-zinc-700 text-zinc-300' }`} on:click={toggleCustomRomanize}>
                {customRomanize ? 'On' : 'Off'}
              </button>
            </div>

            <label class="flex flex-col gap-1">
              <span class="text-sm text-zinc-300">Custom Prompt (optional)</span>
              <textarea rows="3" bind:value={customPrompt}
                class="w-full p-3 bg-zinc-800 rounded border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
                placeholder="Add any instructions for this language"></textarea>
            </label>

            {#if customError}
            <div class="text-sm text-red-400">{customError}</div>
            {/if}

            <div class="flex justify-end gap-2">
              <button type="button"
                class="px-3 py-1 rounded bg-zinc-700 hover:bg-zinc-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                on:click={cancelCustomLanguage} disabled={customSaving}>
                Cancel
              </button>
              <button type="button"
                class="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                on:click={saveCustomLanguage} disabled={customSaving || !customName.trim() || !customCode.trim()}>
                {customSaving ? 'Saving…' : 'Save Language'}
              </button>
            </div>
          </div>
          {/if}

          {#if addError}
          <div class="text-sm text-red-400">{addError}</div>
          {/if}

          {#if loadingAddable}
          <div class="text-sm text-zinc-400">Loading…</div>
          {:else if addable.length}
          <div class="flex flex-col gap-2">
            {#each addable as lang (lang.code)}
            <div class="flex items-center justify-between bg-zinc-900/60 rounded-lg px-3 py-2">
              <div>
                <div class="text-sm font-medium text-zinc-100">{lang.name}</div>
                <div class="text-xs uppercase tracking-wide text-zinc-500">{lang.code}</div>
              </div>
              <button type="button"
                class="p-2 rounded-md text-emerald-400 hover:bg-zinc-800/70 transition-colors cursor-pointer"
                aria-label={`Add ${lang.name}`} on:click={()=> addLanguage(lang.code)}
                >
                <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </button>
            </div>
            {/each}
          </div>
          {:else}
          <div class="text-sm text-zinc-400">All available languages are already added.</div>
          {/if}
        </div>
        {:else if activeTab === 'language-edit'}
        {#if selectedLanguage}
        <div class="flex flex-col gap-5">
          <div class="space-y-4">
            <label class="flex flex-col gap-1">
              <span class="text-sm text-zinc-300">Language Name</span>
              <input type="text" bind:value={languageForm.name}
                class="w-full p-2 bg-zinc-800 rounded border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={originalLanguageCode==='auto' } />
            </label>

            <label class="flex flex-col gap-1">
              <span class="text-sm text-zinc-300">Language Code</span>
              <input type="text" bind:value={languageForm.code}
                class="w-full p-2 bg-zinc-800 rounded border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={originalLanguageCode==='auto' } />
            </label>

            <div class="flex items-center justify-between bg-zinc-900/60 px-3 py-2 rounded-lg">
              <div>
                <div class="text-sm font-medium text-zinc-100">Romanization</div>
                <div class="text-xs text-zinc-500">Enable if you want transliteration output.</div>
              </div>
              <button type="button" class={`px-3 py-1 rounded-full text-sm transition-colors ${ languageForm.romanize
                ? 'bg-emerald-500 text-white' : 'bg-zinc-700 text-zinc-300' }`} on:click={toggleRomanize}>
                {languageForm.romanize ? 'On' : 'Off'}
              </button>
            </div>

            <label class="flex flex-col gap-1">
              <span class="text-sm text-zinc-300">Custom Prompt</span>
              <textarea rows="4" bind:value={languageForm.prompt}
                class="w-full p-3 bg-zinc-800 rounded border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"></textarea>
            </label>

            {#if languageError}
            <div class="text-sm text-red-400">{languageError}</div>
            {/if}
          </div>
        </div>
        {:else}
        <p class="text-sm text-zinc-400">Select a language to edit.</p>
        {/if}
        {/if}
      </section>
    </div>

    <div class="mt-4 md:mt-6 flex justify-end gap-2">
      {#if activeTab === 'connections'}
      <button type="button" on:click={close} class="px-3 py-1 rounded bg-zinc-700 hover:bg-zinc-600 cursor-pointer">
        Cancel
      </button>
      <button type="button" on:click={saveConnections}
        class="px-3 py-1 rounded border border-blue-500 text-blue-400 hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={connectionsSaving}>
        {connectionsSaving ? 'Saving…' : 'Save'}
      </button>
      {:else if activeTab === 'languages'}
      <button type="button" on:click={close} class="px-3 py-1 rounded bg-zinc-700 hover:bg-zinc-600">
        Close
      </button>
      {:else if activeTab === 'languages-add'}
      <button type="button" on:click={()=> setTab('languages')}
        class="px-3 py-1 border border-zinc-700 rounded text-zinc-200 hover:bg-zinc-800/60 cursor-pointer"
        >
        Back to list
      </button>
      <button type="button" on:click={close} class="px-3 py-1 rounded bg-zinc-700 hover:bg-zinc-600">
        Close
      </button>
      {:else if activeTab === 'language-edit'}
      <button type="button" on:click={backToLanguageList}
        class="px-3 py-1 border border-zinc-700 rounded text-zinc-200 hover:bg-zinc-800/60 cursor-pointer">
        Back
      </button>
      <button type="button"
        class="flex items-center gap-2 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        on:click={saveLanguage} disabled={languageSaving}>
        {languageSaving ? 'Saving…' : 'Save Changes'}
      </button>
      {/if}
    </div>
  </div>
</div>