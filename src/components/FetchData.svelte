<script lang="ts">
  import Papa from "papaparse";
  import { dataStore } from "../lib/dataStore"; // Importe le magasin

  const file =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSGDmlwNMcXwsL8qD4yHrLdmZFvBTYhsguNNFedK7ysi3Tf_jO7vgfr9MccVzJYn-N8t41nBuLiqGCy/pub?gid=1430480319&single=true&output=tsv";

  Papa.parse(file, {
    download: false,
    delimiter: "	",
    header: true,
    dynamicTyping: true,
    complete: function (results) {
      // Met à jour le magasin avec les données
      dataStore.set(results.data);
    },
  });

  export dataStore
</script>

// FetchData.svelte
