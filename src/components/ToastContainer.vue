<script setup lang="ts">
import { useToasts } from '../stores/toastStore';
import AppToast from './AppToast.vue';

const toasts = useToasts();
</script>

<template>
    <div class="toastContainer">
        <div 
            class="toaster" 
            id="gameToaster"
        >
            <AppToast 
                v-for="(toast) in toasts.toasts" 
                :key="toast.id" 
                :message="toast.message"
                :class="{'fade': toast.fade}"
            />
        </div>
    </div>
</template>

<style scoped lang="scss">
.toastContainer {
  position: relative;
}

.toaster {
  position: absolute;
  top: 45px;
  left: 50%;
  transform: translate(-50%, 0);
  pointer-events: none;
  width: fit-content;
}

#gameToaster {
  z-index: var(--toast-z-index);
}

#systemToaster {
  z-index: var(--system-toast-z-index);
}
</style>
