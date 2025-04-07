<script setup lang="ts">
import AppTile from './AppTile.vue';
import { computed } from 'vue';
import type { BoardLetter } from '../types';

const props = defineProps<{
  ariaLabel: string;
  word?: string;
}>();

function setLetter (previous: BoardLetter | undefined, index: number) {
  const letterAtIndex = props.word && props.word[index]

  if (letterAtIndex) {
    return {
      letter: letterAtIndex,
      ariaLabel: letterAtIndex,
      state: 'tbd',
      dataAnimation: !previous?.letter ? 'pop' : undefined
    }
  } else {
    return {
      letter: '',
      ariaLabel: 'empty',
      state: 'empty',
      dataAnimation: undefined
    }
  }
}

const firstLetter = computed((previous: BoardLetter | undefined) => {
  return setLetter(previous, 0)
})
const secondLetter = computed((previous: BoardLetter | undefined) => {
  return setLetter(previous, 1)
})
const thirdLetter = computed((previous: BoardLetter | undefined) => {
  return setLetter(previous, 2)
})
const fourthLetter = computed((previous: BoardLetter | undefined) => {
  return setLetter(previous, 3)
})
const fifthLetter = computed((previous: BoardLetter | undefined) => {
  return setLetter(previous, 4)
})
</script>

<template>
  <div 
    class="row" 
    role="group" 
    :aria-label="props.ariaLabel"
  >
    <div class="" style="animation-delay: 0ms;"><AppTile v-bind="firstLetter" :aria-label="`1st letter, ${firstLetter.ariaLabel}`">{{ firstLetter.letter }}</AppTile></div>
    <div class="" style="animation-delay: 100ms;"><AppTile v-bind="secondLetter" :aria-label="`2nd letter, ${secondLetter.ariaLabel}`">{{ secondLetter.letter }}</AppTile></div>
    <div class="" style="animation-delay: 200ms;"><AppTile v-bind="thirdLetter" :aria-label="`3rd letter, ${thirdLetter.ariaLabel}`">{{ thirdLetter.letter }}</AppTile></div>
    <div class="" style="animation-delay: 300ms;"><AppTile v-bind="fourthLetter" :aria-label="`4th letter, ${fourthLetter.ariaLabel}`">{{ fourthLetter.letter }}</AppTile></div>
    <div class="" style="animation-delay: 400ms;"><AppTile v-bind="fifthLetter" :aria-label="`5th letter, ${fifthLetter.ariaLabel}`">{{ fifthLetter.letter }}</AppTile></div>
  </div>
</template>

<style scoped lang="scss">
.row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 5px; // TODO: NONDIRECTIONAL SPACING TOKEN REQUIRED

  &.invalid {
    animation-name: Shake;
    animation-duration: 600ms;
  }
}

.win {
  animation-name: Bounce;
  animation-duration: 1000ms;
}

@keyframes Bounce {
  0%,
  20% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-30px);
  }
  50% {
    transform: translateY(5px);
  }
  60% {
    transform: translateY(-15px);
  }
  80% {
    transform: translateY(2px);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes Shake {
  10%,
  90% {
    transform: translateX(-1px);
  }

  20%,
  80% {
    transform: translateX(2px);
  }

  30%,
  50%,
  70% {
    transform: translateX(-4px);
  }

  40%,
  60% {
    transform: translateX(4px);
  }
}
</style>
