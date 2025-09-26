<script>
  import { onMount, onDestroy } from "svelte";
  import { fade } from "svelte/transition";

  export let model = "";
  export let models = [];
  export let modelsLoading = false;
  export let modelsError = "";
  export let onModelChange = () => {};

  let isOpen = false;
  let highlightedIndex = -1;
  let listboxRef;
  let containerRef;
  let searchInput;

  const optionHeight = 32;
  let searchTerm = "";

  $: label = modelsLoading
    ? "Loading models…"
    : model || models[0] || modelsError || "No models available";

  $: filteredModels = searchTerm
    ? models.filter((item) => item.toLowerCase().includes(searchTerm.toLowerCase()))
    : models;

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
    onModelChange({ target: { value } });
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
    if (!containerRef) return;
    if (!containerRef.contains(event.target)) closeDropdown();
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

  onMount(() => {
    if (typeof document === "undefined") return;
    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("focusin", handleDocumentClick);
  });

  onDestroy(() => {
    if (typeof document === "undefined") return;
    document.removeEventListener("mousedown", handleDocumentClick);
    document.removeEventListener("focusin", handleDocumentClick);
  });

  function handleSearchInput(event) {
    searchTerm = event.target.value;
    highlightedIndex = filteredModels.length ? 0 : -1;
    scrollIntoView(true);
  }

  $: if (!isOpen) {
    searchTerm = "";
  }
</script>

{#if isOpen}
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
      <span class={`truncate ${modelsError ? "text-red-300" : ""}`}>{label}</span>
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

    {#if isOpen}
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
