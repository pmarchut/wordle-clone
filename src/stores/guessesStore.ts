import { defineStore } from "pinia";
import { useToasts } from "./toastStore";

export const useGuesses = defineStore("guesses", {
  state: () => ({
    guesses: ['', '', '', '', '', ''],
    checks: [false, false, false, false, false, false],
    invalid: false
  }),

  getters: {
    guessIndex(state) {
      return state.checks.findIndex((check) => check === false);
    },

    canBackspace(state): boolean {
      return this.guessIndex !== -1 && state.guesses[this.guessIndex].length > 0;
    },

    canSubmit(state): boolean {
      return state.guesses[this.guessIndex].length === 5;
    }
  },

  actions: {
    enterLetter(letter: string) {
      const guessIndex = this.checks.findIndex((check) => check === false);
      if (guessIndex === -1) return;

      if (this.guesses[guessIndex].length < 5) {
        this.guesses = this.guesses.map((guess, index) =>
          index === guessIndex ? guess + letter : guess
        );
      }
    },
    
    handleBackspace() {
      if (!this.canBackspace) return; // Używamy getter zamiast sprawdzać w akcji

      const guessIndex = this.checks.findIndex((check) => check === false);
      this.guesses = this.guesses.map((guess, index) =>
        index === guessIndex ? guess.slice(0, -1) : guess
      );
    },

    handleEnter() {
      if (!this.canSubmit) {
        this.invalid = true

        // Pobieramy instancję store'a toasts i wywołujemy akcję showToast
        const toasts = useToasts();
        toasts.showToast("Not enough letters");
        setTimeout(() => {
          this.invalid = false
        }, 600)
      }
    },
  },
});
