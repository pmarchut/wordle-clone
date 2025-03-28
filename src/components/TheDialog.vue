<script setup lang="ts">
import AppHelp from './AppHelp.vue';
import type { dialogProps } from '../stores/dialogStore';
import AppSettings from './AppSettings.vue';

defineProps<{ dialog: dialogProps }>()

const emit = defineEmits<{
  (e: "closeDialog", payload: null): void;
}>()

const closeDialog = (event: MouseEvent) => {
    const dialogElement = event.target as HTMLDialogElement;
    
    // Sprawdzamy, czy kliknięto dokładnie w <dialog>, a nie w jego zawartość
    if (dialogElement.tagName === "DIALOG") {
        emit("closeDialog", null);
    }
};
</script>

<template>
    <dialog 
        open 
        class="modalOverlay paddingTop" 
        data-testid="modal-overlay"
        :aria-label="dialog.type"
        aria-modal="true" 
        :id="dialog.id"
        @click="closeDialog"
    >
        <div 
          class="content testExtraWidth"
          :class="{ 'extraPadding': dialog.type === 'help Dialog' }"
          data-testid="modal-content"
        >
            <div 
              class="topWrapper"
              :class="{ 'newHeading': dialog.type === 'help Dialog' }"
              data-testid="modal-heading"
            >
                <h2 class="heading">{{ dialog.heading }}</h2>
                <button 
                    class="closeIcon" 
                    type="button" 
                    aria-label="Close"
                    @click="emit('closeDialog', null)"
                >
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" class="game-icon" data-testid="icon-close"><path fill="var(--color-tone-1)" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
                </button>
                <AppHelp v-if="dialog.type === 'help Dialog'" />
                <AppSettings v-else-if="dialog.type === 'settings Dialog'" />
            </div>
        </div>
    </dialog>
</template>

<style scoped lang="scss">
@use '../shared/scss-helpers/mixins.scss';
@use '../shared/scss-helpers/fonts.scss';

.modalOverlay {
  display: flex;
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  padding: 0;
  border: none;
  justify-content: center;
  align-items: center;
  background-color: var(--opacity-50);
  z-index: var(--modal-z-index);

  &.aboveNav {
    z-index: calc(var(--modal-z-index) + 1);
  }
}

.content {
  position: relative;
  border-radius: 8px;
  border: 1px solid var(--color-tone-6);
  background-color: var(--modal-content-bg);
  color: var(--color-tone-1);
  box-shadow: 0 4px 23px 0 rgba(0, 0, 0, 0.2);
  width: 90%;
  max-height: 100%;
  overflow-y: auto;
  animation: SlideIn 200ms;
  max-width: var(--game-max-width);
  box-sizing: border-box;

  &:focus {
    outline: none;
  }

  // XWD-18275
  &.testExtraWidth {
    max-width: 520px;

    &.fullscreenStats {
      height: 100%;
      max-width: 100%;
      width: 100%;
    }
  }

  &.awareness {
    border-radius: 0;
    max-width: 440px;

    .topWrapper {
      padding: 0;
    }

    .closeIcon {
      z-index: 1;
    }

    @media (max-width: 500px) {
      width: 90%;
      height: auto;
      min-height: unset;
      align-self: center;
    }
  }
}

.topWrapper {
  padding: 16px; // TODO: NONDIRECTIONAL SPACING TOKEN REQUIRED
  width: 100%;
  box-sizing: border-box;
}

.archiveCongrats {
  display: flex;
  flex-direction: column;

  &.withoutStats {
    height: 100%;
  }

  @media (max-width: 500px) {
    padding: 32px; // TODO: NONDIRECTIONAL SPACING TOKEN REQUIRED
  }
}

.paddingTop {
  padding-top: calc(var(--vertical-spacing-0-5) * 7.5);
  height: calc(100% - 30px);
}

.extraPadding {
  padding: 32px; // TODO: NONDIRECTIONAL SPACING TOKEN REQUIRED
}

.content.closing {
  animation: SlideOut 200ms;
}

.fullscreenStatsExit {
  width: 100%;
  display: flex;
  justify-content: center;

  .buttonContainer {
    display: flex;
    justify-content: flex-end;
    width: 100%;
    padding-top: var(--vertical-spacing-2);
    padding-right: var(--horizontal-spacing-2);

    @media (min-width: 500px) {
      padding-top: calc(var(--vertical-spacing-0-5) * 9);
      padding-right: calc(var(--horizontal-spacing-0-5) * 9);
    }

    @media (min-width: 770px) {
      max-width: 520px;
      padding-right: 0;
    }

    :global(.pz-desktop) & {
      padding-top: calc(var(--vertical-spacing-0-5) * 18.75);
    }

    .closeIconButton {
      background: none;
      border: none;
      position: relative;
      padding: 0;
      cursor: pointer;
      display: flex;
      animation: AntiSlideIn 200ms;

      svg {
        width: 100%;
        height: auto;
      }
    }

    .closeIconWrapper {
      width: 27px;
      height: 27px;
      animation: AntiSlideIn 200ms;

      @media (min-width: 500px) {
        width: 30px;
        height: 30px;
      }
    }
  }

  .condensedClose {
    margin-bottom: var(--vertical-spacing-2-5);

    @media (max-width: 500px) {
      padding-right: 0px;
    }
  }
}

.closeIcon {
  background: none;
  border: none;
  padding: 0;
  width: 27px;
  height: 27px;
  position: absolute;
  top: 16px;
  right: 16px;
  user-select: none;
  cursor: pointer;
  animation: AntiSlideIn 200ms;

  @media (min-width: 500px) {
    width: 30px;
    height: 30px;
  }

  svg {
    width: 100%;
    height: auto;
  }
}

.heading {
  font-family: 'nyt-franklin';
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  text-align: center;
  margin-bottom: calc(var(--vertical-spacing-0-5) * 3.75);
  margin-top: 0px;
  display: block;
}

.newHeading {
  h2 {
    font-family: 'nyt-karnakcondensed';
    font-weight: 700;
    font-size: 28px;
    letter-spacing: 0;
    line-height: 30px;
    text-transform: none;
    text-align: left;
    margin-bottom: var(--vertical-spacing-0-5);
    margin-top: calc(var(--vertical-spacing-0-5) * 7.25);
    display: block;
  }
}

.flexContainer {
  display: flex;
  flex-direction: column;
}

// can't use (max-width: var(--game-max-width)) here because media
// queries don't support css variables. if we end up having more cases
// like this we can use a scss variable.
@media (max-width: 500px) {
  .modalOverlay {
    align-items: flex-end;
  }

  .content {
    min-height: 70%;
    width: 100%;

    // NSO-2385 - remove min height on mobile to remove extra space on bottom of modal
    &.testNoMinHeight {
      min-height: initial;
    }
  }
  .content.shortStatsModal {
    min-height: unset;
    width: 100%;
    padding-bottom: var(--vertical-spacing-2-5);
  }

  .paddingTop {
    .content {
      height: 100%;
    }
  }
}

@keyframes SlideIn {
  0% {
    transform: translateY(30px);
    opacity: 0;
  }
  100% {
    transform: translateY(0px);
    opacity: 1;
  }
}

// Used for elements that should not be animated (e.g. close button)
@keyframes AntiSlideIn {
  0% {
    transform: translateY(-30px);
  }
  100% {
    transform: translateY(0px);
    opacity: 1;
  }
}

@keyframes SlideOut {
  0% {
    transform: translateY(0px);
    opacity: 1;
  }
  90% {
    opacity: 0;
  }
  100% {
    opacity: 0;
    transform: translateY(60px);
  }
}

.content.noPadding {
  padding: 0;
}

.closeButtonText {
  font: fonts.$weight-bold 16px/18px fonts.$franklin;
  white-space: nowrap;
  display: flex;
  align-items: center;
  padding-right: 0.5rem;
  color: var(--color-tone-1);
}
</style>
