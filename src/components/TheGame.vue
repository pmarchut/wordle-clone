<script setup lang="ts">
import GameBoard from "./GameBoard.vue";
import GameKeyboard from "./GameKeyboard.vue";
</script>

<template>
    <main 
      class="game withToolbar"
      id="wordle-app-game"
      style="max-height: calc(100% - 210px - var(--header-height));"
    >
      <GameBoard />
      <GameKeyboard />
    </main>
</template>

<style scoped lang="scss">
.game {
  width: 100%;
  max-width: var(--game-max-width);
  margin: 0 auto;
  /*
  We use a different element for the header in app which is
   */
  height: calc(100% - var(--header-height));

  display: flex;
  flex-direction: column;

  &.withToolbar {
    height: calc(100% - var(--header-toolbar-height));
  }
}
</style>
