<script>
  import Editor from "../Editor/Editor.svelte";
  import Ingredients from "../Ingredients/Ingredients.svelte";
  import NewSectionButton from "./NewSectionButton/NewSectionButton.svelte";
</script>

<style src="./NewRecipe.scss">

</style>

<input class="title" type="text" placeholder="Title" />
<div class="ingredients">
  <Ingredients />
</div>

<NewSectionButton />

<Editor />
