<script>
  export let inputValue = '';
</script>

<input
  type="text"
  class=" border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
  autocomplete="off"
  placeholder="Rechercher..."
  id="searchInput"
  bind:value={inputValue}
  on:input
/>

<style>
  /* The search field */
  #searchInput {
    box-sizing: border-box;
  }
  #searchInput:focus {
    outline: 1px solid #ddd !important;
  }
</style>
