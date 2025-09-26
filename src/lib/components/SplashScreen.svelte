<script>
  export let visible = false;
</script>

{#if visible}
  <div class="fixed inset-0 z-[1002] flex items-center justify-center bg-black">
    <slot>
      <img src="/images/openlang.svg" alt="OpenLang" class="w-32 h-32" />
    </slot>
  </div>
{/if}