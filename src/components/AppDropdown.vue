<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useDialogs } from '../stores/dialogStore';

defineProps<{ leftPosition: number }>()

const emit = defineEmits<{
  (e: "closeDropdown", payload: null): void;
}>()

const dialogs = useDialogs();
const dropdownRef = ref<HTMLElement | null>(null);
let isOpened = false;

function onHowToPlayClick() {
  dialogs.showHelpDialog();
  emit('closeDropdown', null);
}

function onClickOutside(event: MouseEvent) {
  if (!isOpened) return; // Zabezpieczenie przed natychmiastowym zamknięciem
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    emit("closeDropdown", null);
  }
}

onMounted(() => {
  setTimeout(() => (isOpened = true), 100); // Opóźnienie, aby nie zamknęło się od razu
  document.addEventListener("click", onClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", onClickOutside);
});
</script>

<template>
    <ul
      ref="dropdownRef" 
      role="menu" 
      class="dropdown__menu wordle"
      :style="{ left: `${leftPosition}px`, right: 'unset' }"
    >
      <li 
        role="none" 
        class="dropdown__menuItem"
      >
          <button 
            type="button" 
            role="menuitem" 
            aria-haspopup="dialog"
            @click="onHowToPlayClick"
          >
            How to Play
          </button>
      </li>
      <li 
        role="none" 
        class="dropdown__menuItem"
      >
        <a 
          role="menuitem" 
          href="https://www.nytimes.com/2022/02/10/crosswords/best-wordle-tips.html" 
          target="_blank" 
          rel="noreferrer"
        >
          Tips and Tricks<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 16 16" width="16" class="game-icon" data-testid="icon-arrow"><path fill="var(--color-tone-1)" d="M11.3301 4.06982H4.73006V5.26982H9.88006L3.81006 11.3398L4.66006 12.1898L10.7301 6.11982V11.2698H11.9301V4.66982C11.9301 4.33982 11.6601 4.06982 11.3301 4.06982Z"></path></svg>
        </a>
      </li>
      <li 
        role="none" 
        class="dropdown__menuItem"
      >
        <a 
          role="menuitem" 
          href="https://www.nytimes.com/2023/08/01/crosswords/how-to-talk-about-wordle.html" 
          target="_blank" 
          rel="noreferrer"
        >
          Glossary<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 16 16" width="16" class="game-icon" data-testid="icon-arrow"><path fill="var(--color-tone-1)" d="M11.3301 4.06982H4.73006V5.26982H9.88006L3.81006 11.3398L4.66006 12.1898L10.7301 6.11982V11.2698H11.9301V4.66982C11.9301 4.33982 11.6601 4.06982 11.3301 4.06982Z"></path></svg>
        </a>
      </li>
    </ul>
</template>

<style scoped lang="scss">
@use '../shared/scss-helpers/fonts.scss';
@use '../shared/scss-helpers/variables.scss';
@use '../shared/Toolbar/index.scss';
@use "sass:map";

.dropdown__menu {
  font-family: fonts.$franklin;
  display: block;
  position: absolute;
  z-index: 5;
  top: variables.$nav-height-mobile;
  right: 0;
  text-wrap: nowrap;

  &Item {
    @extend .toolbarColors_border;

    a,
    button {
      @extend .toolbarColors !optional;
      border: none;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      width: 152px;
      padding: var(--spacing-1-5);
      text-decoration: none;
    }

    button {
      width: 100%;
    }

    [target='_blank']::after {
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      content: '. opens in a new tab';
      height: 1px;
      overflow: hidden;
      position: absolute;
      white-space: nowrap;
      width: 1px;
    }
  }
}

/* Responsive styles */
@media (min-width: map.get(variables.$grid-breakpoints, lg)) {
  .dropdown__menu {
    &.noTitleBannerIsPresent {
      // if game title banner is present, it should stay 48px
      top: 52px;
    }
  }
}

@media (min-width: 1024px) {
  .dropdown__menu {
    &.wordle {
      top: variables.$nav-height-desktop;
    }
  }
}
</style>
