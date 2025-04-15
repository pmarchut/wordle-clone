import { defineStore } from "pinia";
import { useToasts } from "./toastStore";
import { useWords } from "./wordsStore";
import { checkGuess, getCachedWord, checkIfInWordList } from "../services/wordService";
import { delay } from "../utils";

export const useGuesses = defineStore("guesses", {
  state: () => ({
    guesses: ['', '', '', '', '', ''],
    checkResults: [['', '', '', '', ''], ['', '', '', '', ''], ['', '', '', '', ''], ['', '', '', '', ''], ['', '', '', '', ''], ['', '', '', '', '']],
    invalid: false,
    ended: false,
  }),

  getters: {
    guessIndex(state) {
      return state.checkResults.findIndex((checkResults) => checkResults.every((result) => result === ''));
    },

    canBackspace(state): boolean {
      return this.guessIndex !== -1 && state.guesses[this.guessIndex].length > 0;
    },

    canSubmit(state): boolean {
      if (this.guessIndex === -1) return false; // Jeśli nie ma dostępnego indeksu, nie można wysłać

      return state.guesses[this.guessIndex].length === 5;
    },

    correctLetters(state) {
      const letters: { [index: number]: string } = {}
      state.checkResults.forEach((results, guessIndex) => {
        results.forEach((result, letterIndex) => {
          if (result === 'correct') {
            letters[letterIndex] = state.guesses[guessIndex][letterIndex]
          }
        })
      })
      return letters
    },

    presentLetters(state) {
      const letters = new Set<string>()
      state.checkResults.forEach((results, guessIndex) => {
        results.forEach((result, letterIndex) => {
          if (result === 'present') {
            letters.add(state.guesses[guessIndex][letterIndex])
          }
        })
      })
      return Array.from(letters)
    },
  },

  actions: {
    enterLetter(letter: string) {
      if (this.guessIndex === -1) return;

      if (this.guesses[this.guessIndex].length < 5) {
        this.guesses = this.guesses.map((guess, index) =>
          index === this.guessIndex ? guess + letter : guess
        );
      }
    },
    
    handleBackspace() {
      if (!this.canBackspace) return; // Używamy getter zamiast sprawdzać w akcji

      this.guesses = this.guesses.map((guess, index) =>
        index === this.guessIndex ? guess.slice(0, -1) : guess
      );
    },

    async handleEnter() {
      const hardmode = localStorage.getItem('wordle-hardmode') === 'true'

      if (!this.canSubmit) {
        this.invalid = true

        // Pobieramy instancję store'a toasts i wywołujemy akcję showToast
        const toasts = useToasts();
        toasts.showToast("Not enough letters");
        setTimeout(() => {
          this.invalid = false
        }, 600)
      } else {
        const wordList = useWords().wordList

        if (!checkIfInWordList(wordList, this.guesses[this.guessIndex])) {
          const toasts = useToasts();
          toasts.showToast("Not in word list")
          this.invalid = true
          setTimeout(() => {
            this.invalid = false
          }, 600)
          return
        }

        if (hardmode) {
          const currentGuess = this.guesses[this.guessIndex]
          const correctLetters = this.correctLetters
          const presentLetters = this.presentLetters
        
          // Sprawdzenie: każda litera oznaczona jako correct musi być w tej samej pozycji
          for (const index in correctLetters) {
            if (currentGuess[index] !== correctLetters[index]) {
              const toasts = useToasts();
              let indexText = '1st'
  
              switch (parseInt(index)) {
                case 0:
                  indexText = '1st'
                  break
                case 1:
                  indexText = '2nd'
                  break
                case 2:
                  indexText = '3rd'
                  break
                case 3:
                  indexText = '4th'
                  break
                case 4:
                  indexText = '5th'
                  break
              }
  
              toasts.showToast(`${indexText} letter must be ${correctLetters[index]}`)
              this.invalid = true
              setTimeout(() => {
                this.invalid = false
              }, 600)
              return
            }
          }
        
          // Sprawdzenie: każda litera oznaczona jako present musi być zawarta gdziekolwiek w guess
          for (const letter of presentLetters) {
            if (!currentGuess.includes(letter)) {
              const toasts = useToasts();
  
              toasts.showToast(`Guess must contain ${letter}`)
              this.invalid = true
              setTimeout(() => {
                this.invalid = false
              }, 600)
              return
            }
          }
        }

        const guessIndex = this.guessIndex;
        const result = checkGuess(this.guesses[guessIndex])

        // Odsłaniamy litery pojedynczo z opóźnieniem
        for (let i = 0; i < result.length; i++) {
          this.checkResults[guessIndex][i] = result[i];
          await delay(400); // animacja - 400ms odstępu
        }

        if (result.every((check) => check === 'correct')) {
          const toasts = useToasts();
          toasts.showToast("Splendid!");
          this.ended = true; // Ustawiamy flagę ended na true
        } else if (guessIndex === 5) {
          const toasts = useToasts();
          toasts.showToast(getCachedWord() as string, true); // Wyświetlamy hasło
          this.ended = true; // Ustawiamy flagę ended na true
        }
      }
    },
  },
});
