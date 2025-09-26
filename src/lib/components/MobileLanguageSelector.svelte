<script>
  import { createEventDispatcher } from 'svelte';

  export let label = '';
  export let languages = [];
  export let selectedCode = null;

  const dispatch = createEventDispatcher();

  let open = false;
  let search = '';
  let selectedLanguage;
  let filteredLanguages = [];

  $: selectedLanguage = languages.find((lang) => lang.code === selectedCode);
  $: filteredLanguages = !search
    ? languages
    : languages.filter((lang) => {
        const term = search.toLowerCase();
        return lang.name.toLowerCase().includes(term) || lang.code.toLowerCase().includes(term);
      });

  function selectLanguage(code) {
    dispatch('select', code);
    open = false;
    search = '';
  }

  function openSelector() {
    open = true;
  }

  function closeSelector() {
    open = false;
    search = '';
  }
</script>

<div class="flex flex-col gap-1">
  {#if label}
    <span class="text-xs uppercase tracking-wide text-zinc-400">{label}</span>
  {/if}
  <button
    type="button"
    class="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-zinc-800 text-left text-sm text-zinc-100 border border-zinc-700 hover:bg-zinc-700/80 transition-colors"
    on:click={openSelector}
  >
    <span class="truncate">{selectedLanguage ? `${selectedLanguage.name}` : 'Select language'}</span>
    <svg class="w-4 h-4 text-zinc-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fill-rule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
        clip-rule="evenodd"
      />
    </svg>
  </button>
</div>

{#if open}
  <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col" role="dialog" aria-modal="true">
    <div class="mt-8 p-4 bg-zinc-900 border-b border-zinc-800 space-y-3">
      <h2 class="text-sm font-medium text-zinc-100">{label || 'Select Language'}</h2>
      <div class="flex items-center gap-2">
        <input
          type="text"
          class="flex-1 px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500/40"
          placeholder="Search languages"
          bind:value={search}
        />
        <button
          type="button"
          class="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-sm text-zinc-200"
          on:click={closeSelector}
        >
          Close
        </button>
      </div>
      </div> 

    <div class="flex-1 overflow-auto bg-zinc-950">
      {#if filteredLanguages.length === 0}
        <p class="p-4 text-sm text-zinc-400">No languages found.</p>
      {:else}
        <ul class="divide-y divide-zinc-900">
          {#each filteredLanguages as lang (lang.code)}
            <li>
              <button
                type="button"
                class={`w-full px-4 py-3 text-left text-sm flex items-center justify-between ${
                  lang.code === selectedCode ? 'bg-zinc-600/20 text-zinc-100' : 'text-zinc-200 hover:bg-zinc-900'
                }`}
                on:click={() => selectLanguage(lang.code)}
              >
                <div>
                  <div class="font-medium">{lang.name}</div>
                  <div class="text-xs uppercase tracking-wide text-zinc-500">{lang.code}</div>
                </div>
                {#if lang.code === selectedCode}
                  <svg class="w-4 h-4 text-zinc-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fill-rule="evenodd"
                      d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 011.414-1.42L8.5 11.086l6.793-6.794a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                {/if}
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
{/if}
