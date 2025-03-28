<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import AppSwitch from "./AppSwitch.vue";

const wordleHardmode = useLocalStorage("wordle-hardmode", false);
const wordleDarkmode = useLocalStorage("wordle-darkmode", true);
const wordleColorblind = useLocalStorage("wordle-colorblind", false);
const wordleOnscreenInputOnly = useLocalStorage("wordle-onscreen-input-only", false);

function toggleDarkmode(value: boolean) {
  wordleDarkmode.value = value;
  document.body.classList.toggle("dark", value);
}

function toggleColorblindMode(value: boolean) {
  wordleColorblind.value = value;
  document.body.classList.toggle("colorblind", value);
}
</script>

<template>
  <div class="container">
    <section>
      <div class="setting">
        <div class="text">
          <h3 class="title">Hard Mode</h3>
          <p class="description">Any revealed hints must be used in subsequent guesses</p>
        </div>
        <AppSwitch 
          label="Hard Mode" 
          v-model="wordleHardmode" 
        />
      </div>
      <div class="setting">
        <div class="text">
          <h3 class="title">Dark Theme</h3>
        </div>
        <AppSwitch 
          label="Dark Mode"
          :model-value="wordleDarkmode" 
          @update:model-value="toggleDarkmode" 
        />
      </div>
      <div class="setting">
        <div class="text">
          <h3 class="title">High Contrast Mode</h3>
          <p class="description">Contrast and colorblindness improvements</p>
        </div>
        <AppSwitch 
          label="High Contrast Mode" 
          :model-value="wordleColorblind"
          @update:model-value="toggleColorblindMode" 
        />
      </div>
      <div class="setting">
        <div class="text">
          <h3 class="title">Onscreen Keyboard Input Only</h3>
          <p class="description">Ignore key input except from the onscreen keyboard. Most helpful for users using speech recognition or other assistive devices.</p>
        </div>
        <AppSwitch 
          label="Virtual Keyboard Input Only"
          v-model="wordleOnscreenInputOnly"
        />
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.container {
  display: flex;
  justify-content: space-between;
}

.setting {
  font-family: 'nyt-franklin';
  font-weight: '500';
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-tone-4);
  padding: var(--vertical-spacing-2) 0;

  a,
  a:visited {
    color: var(--color-tone-8);
    text-decoration: underline;
  }
}

.title {
  font-size: 18px;
}

.text {
  padding-right: var(--horizontal-spacing-1);
}

a.feedbackLink {
  text-decoration: underline;
}

.description {
  font-size: 12px;
  color: var(--color-tone-12);
}

.footnote {
  padding-top: var(--vertical-spacing-2);
  color: var(--color-tone-12);
  font-size: 12px;
  text-align: right;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.container {
  flex: 1;
}

@media (min-width: 501px) {
  .footnote {
    padding-bottom: var(--vertical-spacing-2);
  }
}

@media only screen and (min-device-width: 320px) and (max-device-width: 480px) {
  .setting {
    padding: 16px; // TODO: NONDIRECTIONAL SPACING TOKEN REQUIRED
  }
}
</style>
