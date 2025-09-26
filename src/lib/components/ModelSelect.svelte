<script>
  import { onMount, onDestroy } from "svelte";
  import { fade } from "svelte/transition";

  export let model = "";
  export let models = [];
  export let modelsLoading = false;
  export let modelsError = "";
  export let onModelChange = () => {};

  let isOpen = false;
  let highlightedIndex = -1;  let listboxRef = null;  let containerRef = null;  let searchInput = null;

  const optionHeight = 32;
  let searchTerm = "";
  let label = "";
  let filteredModels = [];
  let displayLabel = "";
  let isMobile = false;
  let mobileQuery = null;
  let mobileQueryListener = null;

  $: label = modelsLoading
    ? "Loading models…"
    : model || models[0] || modelsError || "No models available";

  $: filteredModels = searchTerm
    ? models.filter((item) => item.toLowerCase().includes(searchTerm.toLowerCase()))
    : models;

  $: displayLabel =
    label.length > 20 ? `${label.slice(0, 19)}…` : label;

  function toggleDropdown() {
    if (modelsLoading || models.length === 0) return;
    isOpen = !isOpen;
    if (isOpen) syncHighlight();
  }

  function closeDropdown() {
    isOpen = false;
    highlightedIndex = -1;
  }

  function selectModel(value) {
    if (!value || value === model) {
      closeDropdown();
      return;
    }
    model = value;
    onModelChange(value);
    closeDropdown();
  }

  function syncHighlight() {
    if (!filteredModels.length) {
      highlightedIndex = -1;
      return;
    }
    const currentIndex = filteredModels.indexOf(model);
    highlightedIndex = currentIndex === -1 ? 0 : currentIndex;
    scrollIntoView(true);
    queueMicrotask(() => searchInput && searchInput.focus());
  }

  function handleTriggerKeydown(event) {
    if (!models.length) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleDropdown();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        isOpen = true;
        highlightedIndex = event.key === "ArrowDown" ? 0 : filteredModels.length - 1;
        scrollIntoView(true);
      } else {
        moveHighlight(event.key === "ArrowDown" ? 1 : -1);
      }
    } else if (event.key === "Escape") {
      closeDropdown();
    }
  }

  function handleListKeydown(event) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      moveHighlight(event.key === "ArrowDown" ? 1 : -1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (highlightedIndex !== -1) selectModel(filteredModels[highlightedIndex]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeDropdown();
    }
  }

  function moveHighlight(delta) {
    if (!filteredModels.length) return;
    highlightedIndex = (highlightedIndex + delta + filteredModels.length) % filteredModels.length;
    scrollIntoView();
  }

  function scrollIntoView(force = false) {
    if (!listboxRef || highlightedIndex < 0) return;
    const top = highlightedIndex * optionHeight;
    const bottom = top + optionHeight;
    const viewTop = listboxRef.scrollTop;
    const viewBottom = viewTop + listboxRef.clientHeight;

    if (force || top < viewTop) {
      listboxRef.scrollTop = top;
    } else if (bottom > viewBottom) {
      listboxRef.scrollTop = bottom - listboxRef.clientHeight;
    }
  }

  function handleDocumentClick(event) {
    if (isMobile) return;
    if (!containerRef) return;
    const target = event.target;
    if (!(target instanceof Node) || !containerRef.contains(target)) {
      closeDropdown();
    }
  }

  function handleOverlayKeydown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      closeDropdown();
    }
  }

  function handleWindowKeydown(event) {
    if (!isOpen) return;
    if (event.key === "Escape") {
      closeDropdown();
    }
  }

  function updateIsMobile(event) {
    isMobile = event.matches;
  }

  onMount(() => {
    if (typeof document === "undefined") return;
    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("focusin", handleDocumentClick);

    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      mobileQuery = window.matchMedia("(max-width: 640px)");
      updateIsMobile(mobileQuery);
      mobileQueryListener = (event) => updateIsMobile(event);
      if (typeof mobileQuery.addEventListener === "function") {
        mobileQuery.addEventListener("change", mobileQueryListener);
      } else if (typeof mobileQuery.addListener === "function") {
        mobileQuery.addListener(mobileQueryListener);
      }
    }
  });

  onDestroy(() => {
    if (typeof document === "undefined") return;
    document.removeEventListener("mousedown", handleDocumentClick);
    document.removeEventListener("focusin", handleDocumentClick);

    if (mobileQuery && mobileQueryListener) {
      if (typeof mobileQuery.removeEventListener === "function") {
        mobileQuery.removeEventListener("change", mobileQueryListener);
      } else if (typeof mobileQuery.removeListener === "function") {
        mobileQuery.removeListener(mobileQueryListener);
      }
    }
  });

  function handleSearchInput(event) {
    const target = event.target;
    searchTerm = target instanceof HTMLInputElement ? target.value : "";
    highlightedIndex = filteredModels.length ? 0 : -1;
    scrollIntoView(true);
  }

  $: if (!isOpen) {
    searchTerm = "";
  }
</script>

{#if isOpen && !isMobile}
  <div
    class="fixed inset-0 bg-black/40 z-[900]"
    role="button"
    tabindex="0"
    aria-label="Close model selection"
    on:click={closeDropdown}
    on:keydown={handleOverlayKeydown}
    transition:fade={{ duration: 150 }}
  ></div>
{/if}

<svelte:window on:keydown={handleWindowKeydown} />

<div class="flex items-center gap-3 w-full sm:w-full sm:max-w-[50vw] relative z-[950]" bind:this={containerRef}>
  <div class="relative flex-1 min-w-0">
    <button
      type="button"
      class="flex w-full items-center gap-2 text-lg text-zinc-100 focus:outline-none bg-transparent border-0 p-0 cursor-pointer"
      on:click={toggleDropdown}
      on:keydown={handleTriggerKeydown}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      aria-controls="model-select-menu"
      disabled={modelsLoading || (!models.length && !modelsError)}
    >
      <span class={`truncate ${modelsError ? "text-red-300" : ""}`}>{displayLabel}</span>
      <svg
        class="w-5 h-5 text-zinc-400 flex-shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    {#if isOpen && !isMobile}
      <div
        class="absolute left-0 right-0 mt-1 bg-zinc-800 border border-none rounded shadow-lg z-[960] max-h-60 flex flex-col"
        id="model-select-menu"
        transition:fade={{ duration: 120 }}
      >
        <div class="p-2">
          <div class="flex items-center gap-2 bg-zinc-850 border-none border-zinc-700 px-2 py-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2.5"
              stroke="currentColor"
              aria-hidden="true"
              class="w-4 h-4 text-zinc-400"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>

            <input
              type="text"
              class="w-full bg-transparent border-none text-sm text-zinc-100 focus:outline-none"
              placeholder="Search models…"
              value={searchTerm}
              on:input={handleSearchInput}
              bind:this={searchInput}
            />
          </div>
        </div>

        <div
          class="max-h-48 overflow-auto px-4 pb-1"
          role="listbox"
          tabindex="-1"
          bind:this={listboxRef}
          on:keydown={handleListKeydown}
        >
          {#if filteredModels.length === 0}
            <div class="px-3 py-2 text-sm text-zinc-400">No matches</div>
          {:else}
            {#each filteredModels as option, index}
              <button
                type="button"
                class={`w-full text-left px-3 py-2 text-sm bg-transparent border-0 cursor-pointer rounded-md transition-colors ${
                  highlightedIndex === index
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-100 hover:bg-zinc-800/80 hover:text-white"
                }`}
                on:mouseenter={() => (highlightedIndex = index)}
                on:click={() => selectModel(option)}
                role="option"
                aria-selected={model === option}
              >
                {option}
              </button>
            {/each}
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>

{#if isOpen && isMobile}
  <div class="fixed inset-0 z-[960] bg-black/70 backdrop-blur-sm flex flex-col" role="dialog" aria-modal="true">
    <div class="mt-8 p-4 bg-zinc-900 border-b border-zinc-800 space-y-3 shadow-lg">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-medium text-zinc-100">Select Model</h2>
        <button
          type="button"
          class="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-sm text-zinc-200"
          on:click={closeDropdown}
        >
          Close
        </button>
      </div>
      <div class="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2.5"
          stroke="currentColor"
          aria-hidden="true"
          class="w-4 h-4 text-zinc-400"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <input
          type="text"
          class="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500/40"
          placeholder="Search models…"
          bind:value={searchTerm}
          bind:this={searchInput}
        />
      </div>
    </div>

    <div class="flex-1 overflow-auto bg-zinc-950" bind:this={listboxRef}>
      {#if filteredModels.length === 0}
        <p class="p-4 text-sm text-zinc-400">No matches</p>
      {:else}
        <ul class="divide-y divide-zinc-900">
          {#each filteredModels as option, index}
            <li>
              <button
                type="button"
                class={`w-full px-4 py-3 text-left text-sm flex items-center justify-between ${
                  highlightedIndex === index
                    ? 'bg-zinc-700 text-white'
                    : 'text-zinc-200 hover:bg-zinc-900'
                }`}
                on:mouseenter={() => (highlightedIndex = index)}
                on:click={() => selectModel(option)}
              >
                <span class="truncate">{option}</span>
                {#if model === option}
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
