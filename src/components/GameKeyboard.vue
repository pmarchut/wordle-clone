<script setup lang="ts">
import AppKey from './AppKey.vue';
import { useGuesses } from '../stores/guessesStore';
import { onMounted, onBeforeUnmount } from 'vue';
import { useLocalStorage } from '@vueuse/core';

const guesses = useGuesses()
const wordleOnscreenInputOnly = useLocalStorage('wordle-onscreen-input-only', false);

const handleKeydown = (e: KeyboardEvent) => {
  if (wordleOnscreenInputOnly.value) return; // 🔒 Blokada

  const key = e.key;

  if (/^[a-zA-Z]$/.test(key)) {
    guesses.enterLetter(key.toUpperCase());
  } else if (key === 'Enter') {
    guesses.handleEnter();
  } else if (key === 'Backspace') {
    guesses.handleBackspace();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
    <div class="keyboard" role="group" aria-label="Keyboard">
        <div class="row">
            <AppKey dataKey="q" ariaLabel="add q" :ariaDisabled="false" @click="guesses.enterLetter('Q')">q</AppKey>
            <AppKey dataKey="w" ariaLabel="add w" :ariaDisabled="false" @click="guesses.enterLetter('W')">w</AppKey>
            <AppKey dataKey="e" ariaLabel="add e" :ariaDisabled="false" @click="guesses.enterLetter('E')">e</AppKey>
            <AppKey dataKey="r" ariaLabel="add r" :ariaDisabled="false" @click="guesses.enterLetter('R')">r</AppKey>
            <AppKey dataKey="t" ariaLabel="add t" :ariaDisabled="false" @click="guesses.enterLetter('T')">t</AppKey>
            <AppKey dataKey="y" ariaLabel="add y" :ariaDisabled="false" @click="guesses.enterLetter('Y')">y</AppKey>
            <AppKey dataKey="u" ariaLabel="add u" :ariaDisabled="false" @click="guesses.enterLetter('U')">u</AppKey>
            <AppKey dataKey="i" ariaLabel="add i" :ariaDisabled="false" @click="guesses.enterLetter('I')">i</AppKey>
            <AppKey dataKey="o" ariaLabel="add o" :ariaDisabled="false" @click="guesses.enterLetter('O')">o</AppKey>
            <AppKey dataKey="p" ariaLabel="add p" :ariaDisabled="false" @click="guesses.enterLetter('P')">p</AppKey>
        </div>
        <div class="row">
            <AppKey dataKey="a" ariaLabel="add a" :ariaDisabled="false" spacerBefore @click="guesses.enterLetter('A')">a</AppKey>
            <AppKey dataKey="s" ariaLabel="add s" :ariaDisabled="false" @click="guesses.enterLetter('S')">s</AppKey>
            <AppKey dataKey="d" ariaLabel="add d" :ariaDisabled="false" @click="guesses.enterLetter('D')">d</AppKey>
            <AppKey dataKey="f" ariaLabel="add f" :ariaDisabled="false" @click="guesses.enterLetter('F')">f</AppKey>
            <AppKey dataKey="g" ariaLabel="add g" :ariaDisabled="false" @click="guesses.enterLetter('G')">g</AppKey>
            <AppKey dataKey="h" ariaLabel="add h" :ariaDisabled="false" @click="guesses.enterLetter('H')">h</AppKey>
            <AppKey dataKey="j" ariaLabel="add j" :ariaDisabled="false" @click="guesses.enterLetter('J')">j</AppKey>
            <AppKey dataKey="k" ariaLabel="add k" :ariaDisabled="false" @click="guesses.enterLetter('K')">k</AppKey>
            <AppKey dataKey="l" ariaLabel="add l" :ariaDisabled="false" spacerAfter @click="guesses.enterLetter('L')">l</AppKey>
        </div>
        <div class="row">
            <AppKey dataKey="↵" ariaLabel="enter" :ariaDisabled="!guesses.canSubmit" class="oneAndAHalf" @click="guesses.handleEnter">enter</AppKey>
            <AppKey dataKey="z" ariaLabel="add z" :ariaDisabled="false" @click="guesses.enterLetter('Z')">z</AppKey>
            <AppKey dataKey="x" ariaLabel="add x" :ariaDisabled="false" @click="guesses.enterLetter('X')">x</AppKey>
            <AppKey dataKey="c" ariaLabel="add c" :ariaDisabled="false" @click="guesses.enterLetter('C')">c</AppKey>
            <AppKey dataKey="v" ariaLabel="add v" :ariaDisabled="false" @click="guesses.enterLetter('V')">v</AppKey>
            <AppKey dataKey="b" ariaLabel="add b" :ariaDisabled="false" @click="guesses.enterLetter('B')">b</AppKey>
            <AppKey dataKey="n" ariaLabel="add n" :ariaDisabled="false" @click="guesses.enterLetter('N')">n</AppKey>
            <AppKey dataKey="m" ariaLabel="add m" :ariaDisabled="false" @click="guesses.enterLetter('M')">m</AppKey>
            <AppKey dataKey="←" ariaLabel="backspace" :ariaDisabled="!guesses.canBackspace" class="oneAndAHalf" @click="guesses.handleBackspace"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" class="game-icon" data-testid="icon-backspace"><path fill="var(--color-tone-1)" d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"></path></svg></AppKey>
        </div>
    </div>
</template>

<style scoped lang="scss">
.keyboard {
  height: var(--keyboard-height);
  margin: 0 var(--horizontal-spacing-1);
  user-select: none;
}

.row {
  display: flex;
  width: 100%;
  margin: 0 auto var(--vertical-spacing-1);
  /* https://stackoverflow.com/questions/46167604/ios-html-disable-double-tap-to-zoom */
  touch-action: manipulation;
}
</style>
