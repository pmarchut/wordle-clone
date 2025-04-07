<script setup lang="ts">
const props = defineProps<{
  ariaLabel: string,
  dataKey: string,
  ariaDisabled: boolean,
  spacerBefore?: boolean,
  spacerAfter?: boolean,
}>();
</script>

<template>
  <div
    v-if="spacerBefore" 
    data-testid="spacer" 
    class="half"
  ></div>
  <button 
    type="button" 
    class="key"
    v-bind="$attrs"
    :aria-label="props.ariaLabel"
    :data-key="props.dataKey"
    :aria-disabled="props.ariaDisabled"
  >
    <slot></slot>
  </button>
  <div
    v-if="spacerAfter" 
    data-testid="spacer" 
    class="half"
  ></div>
</template>

<style scoped lang="scss">
.key {
  font-family: 'nyt-franklin';
  font-size: 1.25em;
  font-weight: bold;
  border: 0;
  padding: 0;
  margin: 0 calc(var(--horizontal-spacing-0-5) * 1.5) 0 0;
  height: 58px;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  background-color: var(--key-bg);
  color: var(--key-text-color);
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.3);

  &:last-of-type {
    margin: 0;
  }

  &[data-state='correct'] {
    background-color: var(--key-bg-correct);
    color: var(--key-evaluated-text-color);
  }

  &[data-state='present'] {
    background-color: var(--key-bg-present);
    color: var(--key-evaluated-text-color);
  }

  &[data-state='absent'] {
    background-color: var(--key-bg-absent);
    color: var(--key-evaluated-text-color-absent);
  }

  &.fade {
    transition:
      background-color 0.1s ease,
      color 0.1s ease;
  }
}

.half {
  flex: 0.5;
}

.one {
  flex: 1;
}

.oneAndAHalf {
  flex: 1.5;
  font-size: 12px;
}
</style>
