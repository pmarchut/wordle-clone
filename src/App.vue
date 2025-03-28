<script setup lang="ts">
import { watch } from "vue";
import { useLocalStorage } from "@vueuse/core";
import TheToolbar from './components/TheToolbar.vue';
import TheDialog from "./components/TheDialog.vue";
import { useDialogs } from "./stores/dialogStore";

// Pobieramy wartość z localStorage
const wordleDarkmode = useLocalStorage("wordle-darkmode", true);
const wordleColorblind = useLocalStorage("wordle-colorblind", false);
const dialogs = useDialogs();

// Obserwujemy zmiany i aktualizujemy klasę body
watch(wordleDarkmode, (isDark) => {
  document.body.classList.toggle("dark", isDark);
}, { immediate: true });
watch(wordleColorblind, (isColorblind) => {
  document.body.classList.toggle("colorblind", isColorblind);
}, { immediate: true });
</script>

<template>
  <TheToolbar />
  <TheDialog 
    v-if="dialogs.dialog"
    :dialog="dialogs.dialog"
    @closeDialog="dialogs.hideDialog()"
  />
</template>
