<script setup lang="ts">
import { watch } from "vue";
import { useLocalStorage } from "@vueuse/core";
import TheToolbar from './components/TheToolbar.vue';
import TheDialog from "./components/TheDialog.vue";
import TheGame from "./components/TheGame.vue";
import ToastContainer from "./components/ToastContainer.vue";
import { useDialogs } from "./stores/dialogStore";
import { useWords } from "./stores/wordsStore";
import { onMounted } from "vue";

// Pobieramy wartość z localStorage
const wordleDarkmode = useLocalStorage("wordle-darkmode", true);
const wordleColorblind = useLocalStorage("wordle-colorblind", false);
const dialogs = useDialogs();
const words = useWords();

onMounted(async () => {
    await words.init(); // Ładujemy listę i wybieramy hasło
});

// Obserwujemy zmiany i aktualizujemy klasę body
watch(wordleDarkmode, (isDark) => {
  document.body.classList.toggle("dark", isDark);
}, { immediate: true });
watch(wordleColorblind, (isColorblind) => {
  document.body.classList.toggle("colorblind", isColorblind);
}, { immediate: true });
</script>

<template>
  <ToastContainer />
  <div 
    class="gameContainer"
    data-testid="game-wrapper"
  >
    <TheToolbar />
    <TheGame />
  </div>
  <TheDialog 
    v-if="dialogs.dialog"
    :dialog="dialogs.dialog"
    @closeDialog="dialogs.hideDialog()"
  />
</template>

<style scoped lang="scss">
.gameContainer {
  position: relative;
  height: 100%;
}

:global(.pz-offline-ticker) {
  position: absolute;
  left: 0;
  width: 100%;
  z-index: 2;
  font-weight: bold;

  svg {
    path {
      fill: var(--white);
    }
  }
}

:global(.portal-content) {
  position: relative;
  top: calc(var(--header-height) + 5px);
}
</style>
