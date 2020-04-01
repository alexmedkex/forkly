<script>
  import { fade } from "svelte/transition";
  export let buttonStyle;
  export let onImageLoad;

  function addImage(event) {
    if (!event.target.files[0]) return;

    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
      onImageLoad(e.target.result);
    };
    reader.readAsDataURL(file);
  }
</script>

<style src="./ImageButton.scss" lang="scss">

</style>

<div>
  <label
    for="image-upload"
    transition:fade
    class="imageBtn"
    style={buttonStyle}>
    <i class="fa fa-image fa-2x imageIcon" />
  </label>
  <input
    id="image-upload"
    accept="image/*"
    type="file"
    on:change={addImage}
    hidden />
</div>
