<script setup lang="ts">
import AppRow from './AppRow.vue';
import { useGuesses } from '../stores/guessesStore';

const guesses = useGuesses()
</script>

<template>
  <div class="boardContainer">
    <div class="board" style="width: 350px; height: 420px;">
      <AppRow ariaLabel="Row 1" :word="guesses.guesses[0]" :class="{ 'invalid': (guesses.guessIndex === 0) && guesses.invalid }" />
      <AppRow ariaLabel="Row 2" :word="guesses.guesses[1]" :class="{ 'invalid': (guesses.guessIndex === 1) && guesses.invalid }" />
      <AppRow ariaLabel="Row 3" :word="guesses.guesses[2]" :class="{ 'invalid': (guesses.guessIndex === 2) && guesses.invalid }" />
      <AppRow ariaLabel="Row 4" :word="guesses.guesses[3]" :class="{ 'invalid': (guesses.guessIndex === 3) && guesses.invalid }" />
      <AppRow ariaLabel="Row 5" :word="guesses.guesses[4]" :class="{ 'invalid': (guesses.guessIndex === 4) && guesses.invalid }" />
      <AppRow ariaLabel="Row 6" :word="guesses.guesses[5]" :class="{ 'invalid': (guesses.guessIndex === 5) && guesses.invalid }" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.boardContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  overflow: hidden;
}

.board {
  display: grid;
  grid-template-rows: repeat(6, 1fr);
  grid-gap: 5px; // TODO: NONDIRECTIONAL SPACING TOKEN REQUIRED
  padding: 10px; // TODO: NONDIRECTIONAL SPACING TOKEN REQUIRED
  box-sizing: border-box;
}
</style>
