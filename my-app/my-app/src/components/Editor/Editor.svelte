<script context="module">

</script>

<script>
  import { onMount } from "svelte";
  import ImageButton from "./ImageButton/ImageButton.svelte";

  let editor;
  let isOnNewLine = false;
  let bounds;
  let buttonStyle;

  onMount(async () => {
    const module = await import("quill");
    const Quill = module.default;
    editor = new Quill("#editor", {
      modules: { toolbar: "#toolbar" },
      theme: "bubble",
      placeholder: "Describe your recipe..."
    });

    editor.on("text-change", function(delta, oldDelta, source) {
      if (source !== "user" || !delta.ops[1]) return;

      if (delta.ops[1].insert == "\r" || delta.ops[1].insert == "\n") {
        isOnNewLine = true;
        bounds = editor.getBounds(editor.getLength());
        buttonStyle = `
          transform: translate(-60px, ${bounds.top - 17}px);
        `;
      } else {
        isOnNewLine = false;
      }
    });
  });

  function onImageLoad(image) {
    editor.insertEmbed(editor.getLength(), "image", image);
  }
</script>

<style src="./Editor.scss" lang="scss">

</style>

{#if isOnNewLine}
  <ImageButton {buttonStyle} {onImageLoad} />
{/if}

<div id="toolbar">
  <button class="ql-bold">Bold</button>
  <button class="ql-italic">Italic</button>
</div>
<div id="editor" />
