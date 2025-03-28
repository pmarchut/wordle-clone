<script setup lang="ts">
import HelpButton from './HelpButton.vue';
import SettingsButtons from './SettingsButton.vue';
</script>

<template>
    <header>
        <section 
            data-testid="toolbar"
            class="toolbar wordle"
        >
            <HelpButton />
            <SettingsButtons />
        </section>
    </header>
</template>

<style scoped lang="scss">
@use '../shared/scss-helpers/mixins.scss';
@use '../shared/scss-helpers/variables.scss';
@use '../shared/scss-helpers/colors.scss';
@use '../shared/Toolbar/index.scss';

.header {
  width: 100%;
}

.toolbar {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  height: variables.$nav-height-mobile;

  div {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 100%;
  }
}

/* Game Specific styles*/
.wordle {
  height: variables.$nav-height-mobile;

  @extend .toolbarColors_borderBottom;
  justify-content: end;
  padding: 0 var(--horizontal-spacing-2) 0 0;

  /* Responsive styles */
  @media (min-width: 768px) {
    padding: 0 var(--horizontal-spacing-2);
  }

  @media (min-width: 1024px) {
    padding: 0 var(--horizontal-spacing-3);
    height: variables.$nav-height-desktop;
  }
}

/* Dark Theme Colors */
.dark {
  color: colors.$newsDarkContentPrimary;
  border-bottom: 1px solid colors.$gray26;
}
</style>
<style lang="scss">
@use '../shared/Toolbar/index.scss';
@use '../shared/scss-helpers/colors.scss';

.toolbar {
  button,
  a {
    align-items: center;
    cursor: pointer !important;
    &:focus-visible {
      outline: 2px solid colors.$outlineBlue;
      outline-offset: -1px;
    }
  }
}

.hamburger {
  @media (min-width: 768px) {
    margin: 0 0 0 calc(var(--horizontal-spacing-0-5) * -2.5);
  }

  @media (min-width: 1024px) {
    margin: 0 0 0 calc(var(--horizontal-spacing-0-5) * -3);
  }
}

.toolbar_item {
  @extend .toolbarColors;
  font-size: 1.125em;
  padding: 0 calc(var(--horizontal-spacing-0-5) * 2.5);
  border: none;
  display: flex;
  height: 100%;

  @media (min-width: 1024px) {
    padding: 0 var(--horizontal-spacing-1-5);
  }

  &:hover {
    cursor: pointer;
  }
}

.icon {
  height: 20px;
  width: 24px;
  background-repeat: no-repeat;
  vertical-align: middle;
  background-size: contain;
  display: inline-block;
}
</style>
