<script lang="ts">
  import { CheckMill } from "@check-mill/core";
  import { onMount } from "svelte";

  let rootEl: HTMLElement;

  onMount(() => CheckMill(rootEl));
</script>

<svelte:head>
  <style>
    @import "@check-mill/core/core.css";
  </style>
</svelte:head>

<div bind:this={rootEl} class="check-mill-root"></div>

<style lang="scss">
  .check-mill-root {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
</style>
