<script>
  import Item from "./Item/Item.svelte";
  import { lastId } from "./stores";

  let items = [{ id: 0 }];

  function addItem(event) {
    if (items[items.length - 1].id === event.detail.id) {
      const newId = event.detail.id + 1;
      items = [...items, { id: newId }];
      lastId.update(id => newId);
    }
  }

  function removeItem(event) {
    items = items.filter(item => {
      return item.id !== event.detail.id;
    });
    lastId.update(id => items[items.length - 1].id);
  }
</script>

<style src="./Ingredients.scss">

</style>

<Item />
{#each items as item (item.id)}
  <Item id={item.id} on:input={addItem} on:clear={removeItem} />
{/each}
