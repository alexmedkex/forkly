<script lang="ts">
  let className = "";
  export let label = "label";
  export { className as class };
  export let onclick;
  export let style;

  const classNames = ["mdc-button", className];
</script>

<style src="./Button.scss" lang="scss">

</style>

<scipt context="module" />

<button on:click={onclick} class={classNames.join(' ')} style={style}>
  <div class="mdc-button__ripple" />
  <span class="mdc-button__label">{label}</span>
</button>
