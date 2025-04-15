<script setup lang="ts">
import AppKey from './AppKey.vue';
import { useGuesses } from '../stores/guessesStore';
import { onMounted, onBeforeUnmount } from 'vue';
import { useLocalStorage } from '@vueuse/core';

const guesses = useGuesses()
const wordleOnscreenInputOnly = useLocalStorage('wordle-onscreen-input-only', false);

let lastInputWasKeyboard = false;

const handleGlobalKeydown = () => {
  lastInputWasKeyboard = true;
};

const handleGlobalMousedown = () => {
  lastInputWasKeyboard = false;
};

const handleKeydown = (e: KeyboardEvent) => {
  if (wordleOnscreenInputOnly.value || guesses.ended) return;

  const key = e.key;

  // 🛑 Blokuj Enter, jeśli focus jest na przycisku klawiatury
  if (
    key === 'Enter' &&
    document.activeElement instanceof HTMLElement &&
    document.activeElement.closest('.keyboard')
  ) {
    return; // ⛔ zignoruj Enter
  }

  if (/^[a-zA-Z]$/.test(key)) {
    guesses.enterLetter(key.toUpperCase());
  } else if (key === 'Enter') {
    guesses.handleEnter();
  } else if (key === 'Backspace') {
    guesses.handleBackspace();
  }
};

const handleEnterLetter = (event: MouseEvent | KeyboardEvent, letter: string) => {
  if (!guesses.ended) guesses.enterLetter(letter);

  // Po kliknięciu myszką — zdejmij focus, ale tylko jeśli nie był z klawiatury
  if (
    !lastInputWasKeyboard &&
    event &&
    'currentTarget' in event &&
    event.currentTarget instanceof HTMLElement
  ) {
    event.currentTarget.blur();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('keydown', handleGlobalKeydown, true);
  window.addEventListener('mousedown', handleGlobalMousedown, true);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('keydown', handleGlobalKeydown, true);
  window.removeEventListener('mousedown', handleGlobalMousedown, true);
});

const getKeyProps = (key: string): { ariaLabel: string, dataState?: string } => {
  const letter = key.toUpperCase();
  let status: 'correct' | 'present' | 'absent' | undefined;

  // Przeszukujemy wszystkie wyniki sprawdzenia
  for (let row = 0; row < guesses.checkResults.length; row++) {
    for (let col = 0; col < guesses.checkResults[row].length; col++) {
      const result = guesses.checkResults[row][col];
      const guessedLetter = guesses.guesses[row]?.[col];

      if (guessedLetter === letter) {
        if (result === 'correct') {
          status = 'correct';
          break; // Najwyższy priorytet
        } else if (result === 'present' && status !== 'correct') {
          status = 'present';
        } else if (result === 'absent' && !status) {
          status = 'absent';
        }
      }
    }

    if (status === 'correct') break;
  }

  return status ? { ariaLabel: `${key} ${status}`, dataState: status } : { ariaLabel: `add ${key}`, dataState: undefined };
};
</script>

<template>
    <div 
      class="keyboard" 
      role="group" 
      aria-label="Keyboard"
    >
        <div class="row">
            <AppKey dataKey="q" v-bind="getKeyProps('q')" :ariaDisabled="guesses.ended" @click="(e) => handleEnterLetter(e, 'Q')">q</AppKey>
            <AppKey dataKey="w" v-bind="getKeyProps('w')" :ariaDisabled="guesses.ended" @click="(e) => handleEnterLetter(e, 'W')">w</AppKey>
            <AppKey dataKey="e" v-bind="getKeyProps('e')" :ariaDisabled="guesses.ended" @click="(e) => handleEnterLetter(e, 'E')">e</AppKey>
            <AppKey dataKey="r" v-bind="getKeyProps('r')" :ariaDisabled="guesses.ended" @click="(e) => handleEnterLetter(e, 'R')">r</AppKey>
            <AppKey dataKey="t" v-bind="getKeyProps('t')" :ariaDisabled="guesses.ended" @click="(e) => handleEnterLetter(e, 'T')">t</AppKey>
            <AppKey dataKey="y" v-bind="getKeyProps('y')" :ariaDisabled="guesses.ended" @click="(e) => handleEnterLetter(e, 'Y')">y</AppKey>
            <AppKey dataKey="u" v-bind="getKeyProps('u')" :ariaDisabled="guesses.ended" @click="(e) => handleEnterLetter(e, 'U')">u</AppKey>
            <AppKey dataKey="i" v-bind="getKeyProps('i')" :ariaDisabled="guesses.ended" @click="(e) => handleEnterLetter(e, 'I')">i</AppKey>
            <AppKey dataKey="o" v-bind="getKeyProps('o')" :ariaDisabled="guesses.ended" @click="(e) => handleEnterLetter(e, 'O')">o</AppKey>
            <AppKey dataKey="p" v-bind="getKeyProps('p')" :ariaDisabled="guesses.ended" @click="(e) => handleEnterLetter(e, 'P')">p</AppKey>
        </div>
        <div class="row">
            <AppKey dataKey="a" v-bind="getKeyProps('a')" :ariaDisabled="guesses.ended" spacerBefore @click="(e) => handleEnterLetter(e, 'A')">a</AppKey>
            <AppKey dataKey="s" v-bind="getKeyProps('s')" :ariaDisabled="guesses.ended" @click="(e) => handleEnterLetter(e, 'S')">s</AppKey>
            <AppKey dataKey="d" v-bind="getKeyProps('d')" :ariaDisabled="guesses.ended" @click="(e) => handleEnterLetter(e, 'D')">d</AppKey>
            <AppKey dataKey="f" v-bind="getKeyProps('f')" :ariaDisabled="guesses.ended" @click="(e) => handleEnterLetter(e, 'F')">f</AppKey>
            <AppKey dataKey="g" v-bind="getKeyProps('g')" :ariaDisabled="guesses.ended" @click="(e) => handleEnterLetter(e, 'G')">g</AppKey>
            <AppKey dataKey="h" v-bind="getKeyProps('h')" :ariaDisabled="guesses.ended" @click="(e) => handleEnterLetter(e, 'H')">h</AppKey>
            <AppKey dataKey="j" v-bind="getKeyProps('j')" :ariaDisabled="guesses.ended" @click="(e) => handleEnterLetter(e, 'J')">j</AppKey>
            <AppKey dataKey="k" v-bind="getKeyProps('k')" :ariaDisabled="guesses.ended" @click="(e) => handleEnterLetter(e, 'K')">k</AppKey>
            <AppKey dataKey="l" v-bind="getKeyProps('l')" :ariaDisabled="guesses.ended" spacerAfter @click="(e) => handleEnterLetter(e, 'L')">l</AppKey>
        </div>
        <div class="row">
            <AppKey dataKey="↵" ariaLabel="enter" :ariaDisabled="!guesses.canSubmit" class="oneAndAHalf" @click="!guesses.ended ? guesses.handleEnter()  : undefined">enter</AppKey>
            <AppKey dataKey="z" v-bind="getKeyProps('z')" :ariaDisabled="guesses.ended" @click="(e) => handleEnterLetter(e, 'Z')">z</AppKey>
            <AppKey dataKey="x" v-bind="getKeyProps('x')" :ariaDisabled="guesses.ended" @click="(e) => handleEnterLetter(e, 'X')">x</AppKey>
            <AppKey dataKey="c" v-bind="getKeyProps('c')" :ariaDisabled="guesses.ended" @click="(e) => handleEnterLetter(e, 'C')">c</AppKey>
            <AppKey dataKey="v" v-bind="getKeyProps('v')" :ariaDisabled="guesses.ended" @click="(e) => handleEnterLetter(e, 'V')">v</AppKey>
            <AppKey dataKey="b" v-bind="getKeyProps('b')" :ariaDisabled="guesses.ended" @click="(e) => handleEnterLetter(e, 'B')">b</AppKey>
            <AppKey dataKey="n" v-bind="getKeyProps('n')" :ariaDisabled="guesses.ended" @click="(e) => handleEnterLetter(e, 'N')">n</AppKey>
            <AppKey dataKey="m" v-bind="getKeyProps('m')" :ariaDisabled="guesses.ended" @click="(e) => handleEnterLetter(e, 'M')">m</AppKey>
            <AppKey dataKey="←" ariaLabel="backspace" :ariaDisabled="!guesses.canBackspace" class="oneAndAHalf" @click="!guesses.ended ? guesses.handleBackspace()  : undefined"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" class="game-icon" data-testid="icon-backspace"><path fill="var(--color-tone-1)" d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"></path></svg></AppKey>
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
