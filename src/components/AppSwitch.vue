<script setup lang="ts">
defineProps<{
  label: string;
  modelValue?: boolean;
}>();
defineEmits<{
  (e: "update:modelValue", payload: boolean): void;
}>();
</script>

<template>
  <div 
    :id="label" 
    :class="{ 'checked': modelValue }"
  >
    <button 
      aria-disabled="false" 
      :aria-checked="modelValue" 
      :aria-label="label" 
      role="switch" 
      type="button" 
      class="switch"
      @click="$emit('update:modelValue', !modelValue)"
    >
      <span class="knob"></span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.switch {
  height: 20px;
  width: 32px;
  background: var(--color-tone-3);
  border: none;
  border-radius: 999px;
  display: block;
  position: relative;
  cursor: pointer;
}

.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.knob {
  display: block;
  position: absolute;
  left: 2px;
  top: 2px;
  height: calc(100% - 4px);
  width: 50%;
  border-radius: 8px;
  background: var(--white);
  transform: translateX(0);
  transition: transform 0.3s;
}

.checked {
  .switch {
    background: var(--color-correct);
  }

  .knob {
    transform: translateX(calc(100% - 4px));
  }
}
</style>
