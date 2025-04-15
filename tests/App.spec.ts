import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { useLocalStorage } from "@vueuse/core";
import { ref, nextTick } from "vue";
import App from "../src/App.vue";
import { createTestingPinia } from "@pinia/testing";
import { setActivePinia } from "pinia";
import { useDialogs } from "../src/stores/dialogStore";
import { useGuesses } from "../src/stores/guessesStore";
import { useToasts } from "../src/stores/toastStore";
import type { dialogProps } from "../src/stores/dialogStore";
import { delay } from "../src/utils";

// Mockujemy `useLocalStorage`
vi.mock("@vueuse/core", () => ({
  useLocalStorage: vi.fn(),
}));

vi.useFakeTimers(); // 🔥 Mockujemy setTimeout dla Vitest

function checkGuess(guess: string) {
  const guessLetters = guess.toUpperCase().split('');
  const targetLetters = "HAZEL".split('');
  const result: Array<'correct' | 'present' | 'absent'> = Array(5).fill('absent');
  
  const used = Array(5).fill(false);
  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      result[i] = 'correct';
      used[i] = true;
    }
  }
  
  for (let i = 0; i < 5; i++) {
    if (result[i] !== 'correct') {
      const idx = targetLetters.findIndex((l, j) => l === guessLetters[i] && !used[j]);
      if (idx !== -1) {
        result[i] = 'present';
        used[idx] = true;
      }
    }
  }
  
  return result;
}

const wordList = ["audio", "raven", "lapse", "hazel", "javel", "camel", "label", "belts", "psych"];

function checkIfInWordList(wordList: string[], guess: string) {
  return wordList.includes(guess.toLowerCase());
}

const nextLetterReavealed = async () => {
  vi.advanceTimersByTime(400);
  await nextTick();
}

// 📌 Factory do montowania komponentu App
const factoryMount = (dialogsState: dialogProps | null = null, hardmode = false) => {
  const pinia = createTestingPinia({ createSpy: vi.fn }); // Tworzymy testową Pinia

  setActivePinia(pinia);
  const dialogs = useDialogs(); // Pobieramy store
  const guesses = useGuesses()
  const toasts = useToasts()

  dialogs.dialog = dialogsState; // Ustawiamy stan dialogu

  // Mockujemy `hideDialog()` tak, aby resetowało stan
  dialogs.hideDialog = vi.fn(() => {
    dialogs.dialog = null;
  });

  dialogs.showHelpDialog = vi.fn(() => {
    dialogs.dialog = {
      type: "help Dialog",
      id: "help-dialog",
      heading: "How to Play",
    }
  });
  dialogs.showSettingsDialog = vi.fn(() => {
    dialogs.dialog = {
      type: "settings Dialog",
      id: "settings-dialog",
      heading: "Settings",
    }
  });

  toasts.toasts = []

  toasts.showToast = vi.fn((message: string, keep: boolean = false) => {
    const id = toasts.toasts.length

    toasts.toasts.push({ id, message })

    if (keep) return

    setTimeout(() => toasts.closeToast(id), 3000)
  })

  toasts.closeToast = vi.fn((id: number) => {
    toasts.toasts = toasts.toasts.filter((toast) => toast.id !== id)
  })

  guesses.guesses = ['', '', '', '', '', '']
  guesses.checkResults = [['', '', '', '', ''], ['', '', '', '', ''], ['', '', '', '', ''], ['', '', '', '', ''], ['', '', '', '', ''], ['', '', '', '', '']]
  guesses.invalid = false
  guesses.ended = false

  guesses.enterLetter = vi.fn((letter: string) => {
    if (guesses.guessIndex === -1) return;

    if (guesses.guesses[guesses.guessIndex].length < 5) {
        guesses.guesses = guesses.guesses.map((guess, index) =>
        index === guesses.guessIndex ? guess + letter : guess
    )}
  });
  guesses.handleBackspace = vi.fn(() => {
    if (!guesses.canBackspace) return; // Używamy getter zamiast sprawdzać w akcji

    guesses.guesses = guesses.guesses.map((guess, index) =>
      index === guesses.guessIndex ? guess.slice(0, -1) : guess
    );
  });
  guesses.handleEnter = vi.fn(async () => {
    if (!guesses.canSubmit) {
      guesses.invalid = true
      toasts.showToast("Not enough letters");
      setTimeout(() => {
        guesses.invalid = false
      }, 600)
    } else {
      if (!checkIfInWordList(wordList, guesses.guesses[guesses.guessIndex])) {
        const toasts = useToasts();
        toasts.showToast("Not in word list")
        guesses.invalid = true
        setTimeout(() => {
          guesses.invalid = false
        }, 600)
        return
      }

      if (hardmode) {
        const currentGuess = guesses.guesses[guesses.guessIndex]
        const correctLetters = guesses.correctLetters
        const presentLetters = guesses.presentLetters
      
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
            guesses.invalid = true
            setTimeout(() => {
              guesses.invalid = false
            }, 600)
            return
          }
        }
      
        // Sprawdzenie: każda litera oznaczona jako present musi być zawarta gdziekolwiek w guess
        for (const letter of presentLetters) {
          if (!currentGuess.includes(letter)) {
            const toasts = useToasts();
  
            toasts.showToast(`Guess must contain ${letter}`)
            guesses.invalid = true
            setTimeout(() => {
              guesses.invalid = false
            }, 600)
            return
          }
        }
      }

      const guessIndex = guesses.guessIndex;
      const result = checkGuess(guesses.guesses[guessIndex])

      // Odsłaniamy litery pojedynczo z opóźnieniem
      for (let i = 0; i < result.length; i++) {
        guesses.checkResults[guessIndex][i] = result[i];
        await delay(400); // animacja - 400ms odstępu
      }
      
      if (result.every((check) => check === 'correct')) {
        toasts.showToast("Splendid!");
        guesses.ended = true; // Ustawiamy flagę ended na true
      } else if (guessIndex === 5) {
        const toasts = useToasts();
        toasts.showToast('HAZEL', true); // Wyświetlamy hasło
        guesses.ended = true; // Ustawiamy flagę ended na true
      }
    }
  })

  return {
    wrapper: mount(App, {
      global: {
        plugins: [pinia], // Przekazujemy Pinia
      },
      attachTo: document.body, // Dla testów interakcji
    }),
    dialogs,
    guesses,
    toasts,
  };
};

describe("App.vue", () => {
  beforeEach(() => {
    useLocalStorage.mockReturnValue(ref(true));
  });

  it("adds 'dark' class to body if wordle-darkmode is true", () => {
    factoryMount(); // Używamy factory function
    expect(document.body.classList.contains("dark")).toBe(true);
  });

  it("does not add 'dark' class if wordle-darkmode is false", () => {
    useLocalStorage.mockReturnValue(ref(false));
    factoryMount();
    expect(document.body.classList.contains("dark")).toBe(false);
  });

  it("adds 'colorblind' class to body if wordle-colorblind is true", () => {
    factoryMount(); // Używamy factory function
    expect(document.body.classList.contains("colorblind")).toBe(true);
  });

  it("does not add 'colorblind' class if wordle-colorblind is false", () => {
    useLocalStorage.mockReturnValue(ref(false));
    factoryMount();
    expect(document.body.classList.contains("colorblind")).toBe(false);
  });

  it('shows the "How to Play" dialog on initial load and hides the dialog when clicking outside of it', async () => {
    const { wrapper } = factoryMount({ 
      type: "help Dialog", 
      id: "help-dialog",
      heading: "How to Play", 
    });

    let dialog = wrapper.find('[data-testid="modal-overlay"]');
    expect(dialog.exists()).toBe(true);
    expect(dialog.attributes("aria-label")).toBe("help Dialog");
    expect(dialog.find('[class="heading"]').html()).toContain("How to Play");
    expect(dialog.findComponent({ name: "AppHelp" }).exists()).toBe(true);
    expect(dialog.find('[data-testid="modal-content"]').classes()).toContain("extraPadding");
    expect(dialog.find('[data-testid="modal-heading"]').classes()).toContain("newHeading");

    // Klikamy poza modalem
    await dialog.trigger("click");

    dialog = wrapper.find('[data-testid="modal-overlay"]');
    expect(dialog.exists()).toBe(false);
  });

  it('shows the "How to Play" dialog on initial load and hides the dialog when clicking on close button', async () => {
    const { wrapper } = factoryMount({ 
      type: "help Dialog", 
      id: "help-dialog",
      heading: "How to Play",
    });

    let dialog = wrapper.find('[data-testid="modal-overlay"]');
    expect(dialog.exists()).toBe(true);

    const closeButton = dialog.find('[aria-label="Close"]');
    await closeButton.trigger("click");

    dialog = wrapper.find('[data-testid="modal-overlay"]');
    expect(dialog.exists()).toBe(false);
  });

  it('opens "How to Play" dialog and closes dropdown', async () => {
    const { wrapper } = factoryMount();
    const helpButton = wrapper.find('[data-testid="help-button"]');

    let dialog = wrapper.find('[data-testid="modal-overlay"]');
    expect(dialog.exists()).toBe(false);
  
    await helpButton.trigger('click');
        
    // Pobranie wszystkich przycisków listy
    const listItems = wrapper.findAll('[role="menuitem"]');
        
    await listItems[0].trigger('click');
  
    dialog = wrapper.find('[data-testid="modal-overlay"]');
    expect(dialog.exists()).toBe(true);
    expect(dialog.attributes("aria-label")).toBe("help Dialog");
    expect(dialog.find('[class="heading"]').html()).toContain("How to Play");
    expect(dialog.findComponent({ name: "AppHelp" }).exists()).toBe(true);

    const menu = wrapper.find('[role="menu"]');
    expect(menu.exists()).toBe(false);
  });

  it('opens "Settings" dialog', async () => {
    const { wrapper } = factoryMount();
    const settingsButton = wrapper.find('[data-testid="settings-button"]');

    let dialog = wrapper.find('[data-testid="modal-overlay"]');
    expect(dialog.exists()).toBe(false);
  
    await settingsButton.trigger('click');
  
    dialog = wrapper.find('[data-testid="modal-overlay"]');
    expect(dialog.exists()).toBe(true);
    expect(dialog.attributes("aria-label")).toBe("settings Dialog");
    expect(dialog.find('[class="heading"]').html()).toContain("Settings");
    expect(dialog.findComponent({ name: "AppSettings" }).exists()).toBe(true);
    expect(dialog.find('[data-testid="modal-content"]').classes()).not.toContain("extraPadding");
    expect(dialog.find('[data-testid="modal-heading"]').classes()).not.toContain("newHeading");
  });

  it('shows animation and toast when not enough letters', async () => {
    const { wrapper } = factoryMount();
    const enterButton = wrapper.find('[data-key="↵"]')

    await enterButton.trigger('click')

    expect(wrapper.find('[aria-label="Row 1"]').classes()).toContain('invalid')

    const toastContainer = wrapper.find('[id="gameToaster"]')

    expect(toastContainer.find('[aria-live="polite"]').text()).toBe('Not enough letters')

    vi.runAllTimers();
    await nextTick();

    expect(wrapper.find('[aria-label="Row 1"]').classes()).not.toContain('invalid')
    expect(toastContainer.find('[aria-live="polite"]').exists()).toBe(false)

    await enterButton.trigger('click')

    expect(wrapper.find('[aria-label="Row 1"]').classes()).toContain('invalid')

    expect(toastContainer.find('[aria-live="polite"]').text()).toBe('Not enough letters')

    vi.runAllTimers();
    await nextTick();

    expect(wrapper.find('[aria-label="Row 1"]').classes()).not.toContain('invalid')
    expect(toastContainer.find('[aria-live="polite"]').exists()).toBe(false)
  });

  it("guesses the word HAZEL with some correct and some wrong letters", async () => {
    useLocalStorage.mockReturnValue(ref(false));
    const { wrapper } = factoryMount();

    const firstInputLetters = "AUDIO".split("");

    // Wpisujemy litery
    for (const letter of firstInputLetters) {
        await wrapper.find(`[data-key="${letter.toLowerCase()}"]`).trigger("click");
    }

    // Klikamy Enter
    await wrapper.find('[data-key="↵"]').trigger("click");

    // Sprawdzamy stan kafelków
    const firstRow = wrapper.find('[aria-label="Row 1"]');
    const firstTiles = firstRow.findAll('[data-testid="tile"]');
    
    expect(firstTiles[0].attributes('data-state')).toBe('present');
    expect(firstTiles[0].attributes('data-animation')).toBe('flip-in')
    await firstTiles[0].trigger('animationend')
    expect(firstTiles[0].attributes('data-animation')).toBe('flip-out')
    await firstTiles[0].trigger('animationend')
    expect(firstTiles[0].attributes('data-animation')).toBe('idle')
    expect(firstTiles[0].attributes('aria-label')).toBe('1st letter, A, present')

    await nextLetterReavealed()

    expect(firstTiles[1].attributes('data-state')).toBe('absent');
    expect(firstTiles[1].attributes('data-animation')).toBe('flip-in')
    await firstTiles[1].trigger('animationend')
    expect(firstTiles[1].attributes('data-animation')).toBe('flip-out')
    await firstTiles[1].trigger('animationend')
    expect(firstTiles[1].attributes('data-animation')).toBe('idle')
    expect(firstTiles[1].attributes('aria-label')).toBe('2nd letter, U, absent')

    await nextLetterReavealed()

    expect(firstTiles[2].attributes('data-state')).toBe('absent');
    expect(firstTiles[2].attributes('data-animation')).toBe('flip-in')
    await firstTiles[2].trigger('animationend')
    expect(firstTiles[2].attributes('data-animation')).toBe('flip-out')
    await firstTiles[2].trigger('animationend')
    expect(firstTiles[2].attributes('data-animation')).toBe('idle')
    expect(firstTiles[2].attributes('aria-label')).toBe('3rd letter, D, absent')

    await nextLetterReavealed()

    expect(firstTiles[3].attributes('data-state')).toBe('absent');
    expect(firstTiles[3].attributes('data-animation')).toBe('flip-in')
    await firstTiles[3].trigger('animationend')
    expect(firstTiles[3].attributes('data-animation')).toBe('flip-out')
    await firstTiles[3].trigger('animationend')
    expect(firstTiles[3].attributes('data-animation')).toBe('idle')
    expect(firstTiles[3].attributes('aria-label')).toBe('4th letter, I, absent')

    await nextLetterReavealed()

    expect(firstTiles[4].attributes('data-state')).toBe('absent');
    expect(firstTiles[4].attributes('data-animation')).toBe('flip-in')
    await firstTiles[4].trigger('animationend')
    expect(firstTiles[4].attributes('data-animation')).toBe('flip-out')
    await firstTiles[4].trigger('animationend')
    expect(firstTiles[4].attributes('data-animation')).toBe('idle')
    expect(firstTiles[4].attributes('aria-label')).toBe('5th letter, O, absent')

    await nextLetterReavealed()

    expect(wrapper.find('[aria-label="a present"]').attributes('data-state')).toBe('present')
    expect(wrapper.find('[aria-label="u absent"]').attributes('data-state')).toBe('absent')
    expect(wrapper.find('[aria-label="d absent"]').attributes('data-state')).toBe('absent')
    expect(wrapper.find('[aria-label="i absent"]').attributes('data-state')).toBe('absent')
    expect(wrapper.find('[aria-label="o absent"]').attributes('data-state')).toBe('absent')

    const secondInputLetters = "RAVEN".split("");

    // Wpisujemy litery
    for (const letter of secondInputLetters) {
        await wrapper.find(`[data-key="${letter.toLowerCase()}"]`).trigger("click");
    }

    // Klikamy Enter
    await wrapper.find('[data-key="↵"]').trigger("click");

    // Sprawdzamy stan kafelków
    const secondRow = wrapper.find('[aria-label="Row 2"]');
    const secondTiles = secondRow.findAll('[data-testid="tile"]');

    expect(secondTiles[0].attributes('data-state')).toBe('absent');
    expect(secondTiles[0].attributes('aria-label')).toBe('1st letter, R, absent')

    await nextLetterReavealed()

    expect(secondTiles[1].attributes('data-state')).toBe('correct');
    expect(secondTiles[1].attributes('aria-label')).toBe('2nd letter, A, correct')

    await nextLetterReavealed()

    expect(secondTiles[2].attributes('data-state')).toBe('absent');
    expect(secondTiles[2].attributes('aria-label')).toBe('3rd letter, V, absent')

    await nextLetterReavealed()

    expect(secondTiles[3].attributes('data-state')).toBe('correct');
    expect(secondTiles[3].attributes('aria-label')).toBe('4th letter, E, correct')

    await nextLetterReavealed()

    expect(secondTiles[4].attributes('data-state')).toBe('absent');
    expect(secondTiles[4].attributes('aria-label')).toBe('5th letter, N, absent')

    await nextLetterReavealed()

    expect(wrapper.find('[aria-label="r absent"]').attributes('data-state')).toBe('absent')
    expect(wrapper.find('[aria-label="a correct"]').attributes('data-state')).toBe('correct')
    expect(wrapper.find('[aria-label="v absent"]').attributes('data-state')).toBe('absent')
    expect(wrapper.find('[aria-label="e correct"]').attributes('data-state')).toBe('correct')
    expect(wrapper.find('[aria-label="n absent"]').attributes('data-state')).toBe('absent')

    const thirdInputLetters = "LAPSE".split("");

    // Wpisujemy litery
    for (const letter of thirdInputLetters) {
        await wrapper.find(`[data-key="${letter.toLowerCase()}"]`).trigger("click");
    }

    // Klikamy Enter
    await wrapper.find('[data-key="↵"]').trigger("click");

    // Sprawdzamy stan kafelków
    const thirdRow = wrapper.find('[aria-label="Row 3"]');
    const thirdTiles = thirdRow.findAll('[data-testid="tile"]');

    expect(thirdTiles[0].attributes('data-state')).toBe('present');
    expect(thirdTiles[0].attributes('aria-label')).toBe('1st letter, L, present')

    await nextLetterReavealed()

    expect(thirdTiles[1].attributes('data-state')).toBe('correct');
    expect(thirdTiles[1].attributes('aria-label')).toBe('2nd letter, A, correct')

    await nextLetterReavealed()

    expect(thirdTiles[2].attributes('data-state')).toBe('absent');
    expect(thirdTiles[2].attributes('aria-label')).toBe('3rd letter, P, absent')

    await nextLetterReavealed()

    expect(thirdTiles[3].attributes('data-state')).toBe('absent');
    expect(thirdTiles[3].attributes('aria-label')).toBe('4th letter, S, absent')

    await nextLetterReavealed()

    expect(thirdTiles[4].attributes('data-state')).toBe('present');
    expect(thirdTiles[4].attributes('aria-label')).toBe('5th letter, E, present')

    await nextLetterReavealed()

    expect(wrapper.find('[aria-label="l present"]').attributes('data-state')).toBe('present')
    expect(wrapper.find('[aria-label="a correct"]').attributes('data-state')).toBe('correct')
    expect(wrapper.find('[aria-label="p absent"]').attributes('data-state')).toBe('absent')
    expect(wrapper.find('[aria-label="s absent"]').attributes('data-state')).toBe('absent')
    expect(wrapper.find('[aria-label="e correct"]').attributes('data-state')).toBe('correct')

    const fourthInputLetters = "HAZEL".split("");

    // Wpisujemy litery
    for (const letter of fourthInputLetters) {
        await wrapper.find(`[data-key="${letter.toLowerCase()}"]`).trigger("click");
    }

    // Klikamy Enter
    await wrapper.find('[data-key="↵"]').trigger("click");

    // Sprawdzamy stan kafelków
    const fourthRow = wrapper.find('[aria-label="Row 4"]');
    const fourthTiles = fourthRow.findAll('[data-testid="tile"]');

    expect(fourthTiles[0].attributes('data-state')).toBe('correct');
    expect(fourthTiles[0].attributes('aria-label')).toBe('1st letter, H, correct')

    await nextLetterReavealed()

    expect(fourthTiles[1].attributes('data-state')).toBe('correct');
    expect(fourthTiles[1].attributes('aria-label')).toBe('2nd letter, A, correct')

    await nextLetterReavealed()

    expect(fourthTiles[2].attributes('data-state')).toBe('correct');
    expect(fourthTiles[2].attributes('aria-label')).toBe('3rd letter, Z, correct')

    await nextLetterReavealed()

    expect(fourthTiles[3].attributes('data-state')).toBe('correct');
    expect(fourthTiles[3].attributes('aria-label')).toBe('4th letter, E, correct')

    await nextLetterReavealed()

    expect(fourthTiles[4].attributes('data-state')).toBe('correct');
    expect(fourthTiles[4].attributes('aria-label')).toBe('5th letter, L, correct')

    await nextLetterReavealed()

    expect(wrapper.find('[aria-label="h correct"]').attributes('data-state')).toBe('correct')
    expect(wrapper.find('[aria-label="a correct"]').attributes('data-state')).toBe('correct')
    expect(wrapper.find('[aria-label="z correct"]').attributes('data-state')).toBe('correct')
    expect(wrapper.find('[aria-label="e correct"]').attributes('data-state')).toBe('correct')
    expect(wrapper.find('[aria-label="l correct"]').attributes('data-state')).toBe('correct')

    const toastContainer = wrapper.find('[id="gameToaster"]')

    expect(toastContainer.find('[aria-live="polite"]').text()).toBe('Splendid!')

    vi.runAllTimers();
    await nextTick();

    expect(toastContainer.find('[aria-live="polite"]').exists()).toBe(false)

    // Sprawdzamy, że nie można już nic wpisać
    const aKey = wrapper.find('[data-key="a"]');
    await aKey.trigger("click");
    // 🔤 Symulacja naciśnięcia litery A
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    await nextTick();

    const allTiles = wrapper.findAll('[data-testid="tile"]');
    const filledTiles = allTiles.filter(tile => tile.text() !== "");
    expect(filledTiles.length).toBe(20); // 4 wiersze × 5 liter

    // Gra powinna być zablokowana
    expect(wrapper.find('[data-key="↵"]').attributes("aria-disabled")).toBe("true");
  });

  it("doesn't guess the word HAZEL in 6 tries", async () => {
    const { wrapper } = factoryMount();

    const firstInputLetters = "AUDIO".split("");

    // Wpisujemy litery
    for (const letter of firstInputLetters) {
        await wrapper.find(`[data-key="${letter.toLowerCase()}"]`).trigger("click");
    }

    // Klikamy Enter
    await wrapper.find('[data-key="↵"]').trigger("click");

    // Sprawdzamy stan kafelków
    const firstRow = wrapper.find('[aria-label="Row 1"]');
    const firstTiles = firstRow.findAll('[data-testid="tile"]');
    
    expect(firstTiles[0].attributes('data-state')).toBe('present');
    expect(firstTiles[0].attributes('aria-label')).toBe('1st letter, A, present')

    await nextLetterReavealed()

    expect(firstTiles[1].attributes('data-state')).toBe('absent');
    expect(firstTiles[1].attributes('aria-label')).toBe('2nd letter, U, absent')

    await nextLetterReavealed()

    expect(firstTiles[2].attributes('data-state')).toBe('absent');
    expect(firstTiles[2].attributes('aria-label')).toBe('3rd letter, D, absent')

    await nextLetterReavealed()

    expect(firstTiles[3].attributes('data-state')).toBe('absent');
    expect(firstTiles[3].attributes('aria-label')).toBe('4th letter, I, absent')

    await nextLetterReavealed()

    expect(firstTiles[4].attributes('data-state')).toBe('absent');
    expect(firstTiles[4].attributes('aria-label')).toBe('5th letter, O, absent')

    await nextLetterReavealed()

    expect(wrapper.find('[aria-label="a present"]').attributes('data-state')).toBe('present')
    expect(wrapper.find('[aria-label="u absent"]').attributes('data-state')).toBe('absent')
    expect(wrapper.find('[aria-label="d absent"]').attributes('data-state')).toBe('absent')
    expect(wrapper.find('[aria-label="i absent"]').attributes('data-state')).toBe('absent')
    expect(wrapper.find('[aria-label="o absent"]').attributes('data-state')).toBe('absent')

    const secondInputLetters = "RAVEN".split("");

    // Wpisujemy litery
    for (const letter of secondInputLetters) {
        await wrapper.find(`[data-key="${letter.toLowerCase()}"]`).trigger("click");
    }

    // Klikamy Enter
    await wrapper.find('[data-key="↵"]').trigger("click");

    // Sprawdzamy stan kafelków
    const secondRow = wrapper.find('[aria-label="Row 2"]');
    const secondTiles = secondRow.findAll('[data-testid="tile"]');

    expect(secondTiles[0].attributes('data-state')).toBe('absent');
    expect(secondTiles[0].attributes('aria-label')).toBe('1st letter, R, absent')

    await nextLetterReavealed()

    expect(secondTiles[1].attributes('data-state')).toBe('correct');
    expect(secondTiles[1].attributes('aria-label')).toBe('2nd letter, A, correct')

    await nextLetterReavealed()

    expect(secondTiles[2].attributes('data-state')).toBe('absent');
    expect(secondTiles[2].attributes('aria-label')).toBe('3rd letter, V, absent')

    await nextLetterReavealed()

    expect(secondTiles[3].attributes('data-state')).toBe('correct');
    expect(secondTiles[3].attributes('aria-label')).toBe('4th letter, E, correct')

    await nextLetterReavealed()

    expect(secondTiles[4].attributes('data-state')).toBe('absent');
    expect(secondTiles[4].attributes('aria-label')).toBe('5th letter, N, absent')

    await nextLetterReavealed()

    expect(wrapper.find('[aria-label="r absent"]').attributes('data-state')).toBe('absent')
    expect(wrapper.find('[aria-label="a correct"]').attributes('data-state')).toBe('correct')
    expect(wrapper.find('[aria-label="v absent"]').attributes('data-state')).toBe('absent')
    expect(wrapper.find('[aria-label="e correct"]').attributes('data-state')).toBe('correct')
    expect(wrapper.find('[aria-label="n absent"]').attributes('data-state')).toBe('absent')

    const thirdInputLetters = "LAPSE".split("");

    // Wpisujemy litery
    for (const letter of thirdInputLetters) {
        await wrapper.find(`[data-key="${letter.toLowerCase()}"]`).trigger("click");
    }

    // Klikamy Enter
    await wrapper.find('[data-key="↵"]').trigger("click");

    // Sprawdzamy stan kafelków
    const thirdRow = wrapper.find('[aria-label="Row 3"]');
    const thirdTiles = thirdRow.findAll('[data-testid="tile"]');

    expect(thirdTiles[0].attributes('data-state')).toBe('present');
    expect(thirdTiles[0].attributes('aria-label')).toBe('1st letter, L, present')

    await nextLetterReavealed()

    expect(thirdTiles[1].attributes('data-state')).toBe('correct');
    expect(thirdTiles[1].attributes('aria-label')).toBe('2nd letter, A, correct')

    await nextLetterReavealed()

    expect(thirdTiles[2].attributes('data-state')).toBe('absent');
    expect(thirdTiles[2].attributes('aria-label')).toBe('3rd letter, P, absent')

    await nextLetterReavealed()

    expect(thirdTiles[3].attributes('data-state')).toBe('absent');
    expect(thirdTiles[3].attributes('aria-label')).toBe('4th letter, S, absent')

    await nextLetterReavealed()

    expect(thirdTiles[4].attributes('data-state')).toBe('present');
    expect(thirdTiles[4].attributes('aria-label')).toBe('5th letter, E, present')

    await nextLetterReavealed()

    expect(wrapper.find('[aria-label="l present"]').attributes('data-state')).toBe('present')
    expect(wrapper.find('[aria-label="a correct"]').attributes('data-state')).toBe('correct')
    expect(wrapper.find('[aria-label="p absent"]').attributes('data-state')).toBe('absent')
    expect(wrapper.find('[aria-label="s absent"]').attributes('data-state')).toBe('absent')
    expect(wrapper.find('[aria-label="e correct"]').attributes('data-state')).toBe('correct')

    const fourthInputLetters = "JAVEL".split("");

    // Wpisujemy litery
    for (const letter of fourthInputLetters) {
        await wrapper.find(`[data-key="${letter.toLowerCase()}"]`).trigger("click");
    }

    // Klikamy Enter
    await wrapper.find('[data-key="↵"]').trigger("click");

    // Sprawdzamy stan kafelków
    const fourthRow = wrapper.find('[aria-label="Row 4"]');
    const fourthTiles = fourthRow.findAll('[data-testid="tile"]');

    expect(fourthTiles[0].attributes('data-state')).toBe('absent');
    expect(fourthTiles[0].attributes('aria-label')).toBe('1st letter, J, absent')

    await nextLetterReavealed()

    expect(fourthTiles[1].attributes('data-state')).toBe('correct');
    expect(fourthTiles[1].attributes('aria-label')).toBe('2nd letter, A, correct')

    await nextLetterReavealed()

    expect(fourthTiles[2].attributes('data-state')).toBe('absent');
    expect(fourthTiles[2].attributes('aria-label')).toBe('3rd letter, V, absent')

    await nextLetterReavealed()

    expect(fourthTiles[3].attributes('data-state')).toBe('correct');
    expect(fourthTiles[3].attributes('aria-label')).toBe('4th letter, E, correct')

    await nextLetterReavealed()

    expect(fourthTiles[4].attributes('data-state')).toBe('correct');
    expect(fourthTiles[4].attributes('aria-label')).toBe('5th letter, L, correct')

    await nextLetterReavealed()

    expect(wrapper.find('[aria-label="j absent"]').attributes('data-state')).toBe('absent')
    expect(wrapper.find('[aria-label="a correct"]').attributes('data-state')).toBe('correct')
    expect(wrapper.find('[aria-label="v absent"]').attributes('data-state')).toBe('absent')
    expect(wrapper.find('[aria-label="e correct"]').attributes('data-state')).toBe('correct')
    expect(wrapper.find('[aria-label="l correct"]').attributes('data-state')).toBe('correct')

    const fifthInputLetters = "CAMEL".split("");

    // Wpisujemy litery
    for (const letter of fifthInputLetters) {
        await wrapper.find(`[data-key="${letter.toLowerCase()}"]`).trigger("click");
    }

    // Klikamy Enter
    await wrapper.find('[data-key="↵"]').trigger("click");

    // Sprawdzamy stan kafelków
    const fifthRow = wrapper.find('[aria-label="Row 5"]');
    const fifthTiles = fifthRow.findAll('[data-testid="tile"]');

    expect(fifthTiles[0].attributes('data-state')).toBe('absent');
    expect(fifthTiles[0].attributes('aria-label')).toBe('1st letter, C, absent')

    await nextLetterReavealed()

    expect(fifthTiles[1].attributes('data-state')).toBe('correct');
    expect(fifthTiles[1].attributes('aria-label')).toBe('2nd letter, A, correct')

    await nextLetterReavealed()

    expect(fifthTiles[2].attributes('data-state')).toBe('absent');
    expect(fifthTiles[2].attributes('aria-label')).toBe('3rd letter, M, absent')

    await nextLetterReavealed()

    expect(fifthTiles[3].attributes('data-state')).toBe('correct');
    expect(fifthTiles[3].attributes('aria-label')).toBe('4th letter, E, correct')

    await nextLetterReavealed()

    expect(fifthTiles[4].attributes('data-state')).toBe('correct');
    expect(fifthTiles[4].attributes('aria-label')).toBe('5th letter, L, correct')

    await nextLetterReavealed()

    expect(wrapper.find('[aria-label="c absent"]').attributes('data-state')).toBe('absent')
    expect(wrapper.find('[aria-label="a correct"]').attributes('data-state')).toBe('correct')
    expect(wrapper.find('[aria-label="m absent"]').attributes('data-state')).toBe('absent')
    expect(wrapper.find('[aria-label="e correct"]').attributes('data-state')).toBe('correct')
    expect(wrapper.find('[aria-label="l correct"]').attributes('data-state')).toBe('correct')

    const sixthInputLetters = "LABEL".split("");

    // Wpisujemy litery
    for (const letter of sixthInputLetters) {
        await wrapper.find(`[data-key="${letter.toLowerCase()}"]`).trigger("click");
    }

    // Klikamy Enter
    await wrapper.find('[data-key="↵"]').trigger("click");

    // Sprawdzamy stan kafelków
    const sixthRow = wrapper.find('[aria-label="Row 6"]');
    const sixthTiles = sixthRow.findAll('[data-testid="tile"]');

    expect(sixthTiles[0].attributes('data-state')).toBe('absent');
    expect(sixthTiles[0].attributes('aria-label')).toBe('1st letter, L, absent')

    await nextLetterReavealed()

    expect(sixthTiles[1].attributes('data-state')).toBe('correct');
    expect(sixthTiles[1].attributes('aria-label')).toBe('2nd letter, A, correct')

    await nextLetterReavealed()

    expect(sixthTiles[2].attributes('data-state')).toBe('absent');
    expect(sixthTiles[2].attributes('aria-label')).toBe('3rd letter, B, absent')

    await nextLetterReavealed()

    expect(sixthTiles[3].attributes('data-state')).toBe('correct');
    expect(sixthTiles[3].attributes('aria-label')).toBe('4th letter, E, correct')

    await nextLetterReavealed()

    expect(sixthTiles[4].attributes('data-state')).toBe('correct');
    expect(sixthTiles[4].attributes('aria-label')).toBe('5th letter, L, correct')

    await nextLetterReavealed()

    expect(wrapper.find('[aria-label="a correct"]').attributes('data-state')).toBe('correct')
    expect(wrapper.find('[aria-label="b absent"]').attributes('data-state')).toBe('absent')
    expect(wrapper.find('[aria-label="e correct"]').attributes('data-state')).toBe('correct')
    expect(wrapper.find('[aria-label="l correct"]').attributes('data-state')).toBe('correct')

    const toastContainer = wrapper.find('[id="gameToaster"]')

    expect(toastContainer.find('[aria-live="polite"]').text()).toBe('HAZEL')

    vi.runAllTimers();
    await nextTick();

    expect(toastContainer.find('[aria-live="polite"]').text()).toBe('HAZEL')

    // Gra powinna być zablokowana
    expect(wrapper.find('[data-key="↵"]').attributes("aria-disabled")).toBe("true");
  });

  it("shows hardmode toasts and sets row invalid", async () => {
    const { wrapper } = factoryMount(null, true);

    const firstInputLetters = "AUDIO".split("");

    // Wpisujemy litery
    for (const letter of firstInputLetters) {
        await wrapper.find(`[data-key="${letter.toLowerCase()}"]`).trigger("click");
    }

    // Klikamy Enter
    await wrapper.find('[data-key="↵"]').trigger("click");

    // Sprawdzamy stan kafelków
    const firstRow = wrapper.find('[aria-label="Row 1"]');
    const firstTiles = firstRow.findAll('[data-testid="tile"]');
    
    expect(firstTiles[0].attributes('data-state')).toBe('present');
    expect(firstTiles[0].attributes('aria-label')).toBe('1st letter, A, present')

    await nextLetterReavealed()

    expect(firstTiles[1].attributes('data-state')).toBe('absent');
    expect(firstTiles[1].attributes('aria-label')).toBe('2nd letter, U, absent')

    await nextLetterReavealed()

    expect(firstTiles[2].attributes('data-state')).toBe('absent');
    expect(firstTiles[2].attributes('aria-label')).toBe('3rd letter, D, absent')

    await nextLetterReavealed()

    expect(firstTiles[3].attributes('data-state')).toBe('absent');
    expect(firstTiles[3].attributes('aria-label')).toBe('4th letter, I, absent')

    await nextLetterReavealed()

    expect(firstTiles[4].attributes('data-state')).toBe('absent');
    expect(firstTiles[4].attributes('aria-label')).toBe('5th letter, O, absent')

    await nextLetterReavealed()

    expect(wrapper.find('[aria-label="a present"]').attributes('data-state')).toBe('present')
    expect(wrapper.find('[aria-label="u absent"]').attributes('data-state')).toBe('absent')
    expect(wrapper.find('[aria-label="d absent"]').attributes('data-state')).toBe('absent')
    expect(wrapper.find('[aria-label="i absent"]').attributes('data-state')).toBe('absent')
    expect(wrapper.find('[aria-label="o absent"]').attributes('data-state')).toBe('absent')

    const secondInputLettersWrong = "BELTS".split("");

    // Wpisujemy litery
    for (const letter of secondInputLettersWrong) {
        await wrapper.find(`[data-key="${letter.toLowerCase()}"]`).trigger("click");
    }

    // Klikamy Enter
    await wrapper.find('[data-key="↵"]').trigger("click");

    expect(wrapper.find('[aria-label="Row 2"]').classes()).toContain('invalid')

    const toastContainer = wrapper.find('[id="gameToaster"]')

    expect(toastContainer.find('[aria-live="polite"]').text()).toBe('Guess must contain A')

    vi.runAllTimers();
    await nextTick();

    expect(wrapper.find('[aria-label="Row 2"]').classes()).not.toContain('invalid')
    expect(toastContainer.find('[aria-live="polite"]').exists()).toBe(false)

    await wrapper.find('[data-key="←"]').trigger("click");
    await wrapper.find('[data-key="←"]').trigger("click");
    await wrapper.find('[data-key="←"]').trigger("click");
    await wrapper.find('[data-key="←"]').trigger("click");
    await wrapper.find('[data-key="←"]').trigger("click");

    const secondInputLetters = "RAVEN".split("");

    // Wpisujemy litery
    for (const letter of secondInputLetters) {
        await wrapper.find(`[data-key="${letter.toLowerCase()}"]`).trigger("click");
    }

    // Klikamy Enter
    await wrapper.find('[data-key="↵"]').trigger("click");

    // Sprawdzamy stan kafelków
    const secondRow = wrapper.find('[aria-label="Row 2"]');
    const secondTiles = secondRow.findAll('[data-testid="tile"]');

    expect(secondTiles[0].attributes('data-state')).toBe('absent');
    expect(secondTiles[0].attributes('aria-label')).toBe('1st letter, R, absent')

    await nextLetterReavealed()

    expect(secondTiles[1].attributes('data-state')).toBe('correct');
    expect(secondTiles[1].attributes('aria-label')).toBe('2nd letter, A, correct')

    await nextLetterReavealed()

    expect(secondTiles[2].attributes('data-state')).toBe('absent');
    expect(secondTiles[2].attributes('aria-label')).toBe('3rd letter, V, absent')

    await nextLetterReavealed()

    expect(secondTiles[3].attributes('data-state')).toBe('correct');
    expect(secondTiles[3].attributes('aria-label')).toBe('4th letter, E, correct')

    await nextLetterReavealed()

    expect(secondTiles[4].attributes('data-state')).toBe('absent');
    expect(secondTiles[4].attributes('aria-label')).toBe('5th letter, N, absent')

    await nextLetterReavealed()

    expect(wrapper.find('[aria-label="r absent"]').attributes('data-state')).toBe('absent')
    expect(wrapper.find('[aria-label="a correct"]').attributes('data-state')).toBe('correct')
    expect(wrapper.find('[aria-label="v absent"]').attributes('data-state')).toBe('absent')
    expect(wrapper.find('[aria-label="e correct"]').attributes('data-state')).toBe('correct')
    expect(wrapper.find('[aria-label="n absent"]').attributes('data-state')).toBe('absent')

    const thirdInputLettersWrong = "PSYCH".split("");

    // Wpisujemy litery
    for (const letter of thirdInputLettersWrong) {
        await wrapper.find(`[data-key="${letter.toLowerCase()}"]`).trigger("click");
    }

    // Klikamy Enter
    await wrapper.find('[data-key="↵"]').trigger("click");

    expect(wrapper.find('[aria-label="Row 3"]').classes()).toContain('invalid')

    expect(toastContainer.find('[aria-live="polite"]').text()).toBe('2nd letter must be A')

    vi.runAllTimers();
    await nextTick();

    expect(wrapper.find('[aria-label="Row 2"]').classes()).not.toContain('invalid')
    expect(toastContainer.find('[aria-live="polite"]').exists()).toBe(false)
  });

  it("shows Not in word list toast and sets row invalid", async () => {
    const { wrapper } = factoryMount();

    const firstInputLetters = "AAAAA".split("");

    // Wpisujemy litery
    for (const letter of firstInputLetters) {
        await wrapper.find(`[data-key="${letter.toLowerCase()}"]`).trigger("click");
    }

    // Klikamy Enter
    await wrapper.find('[data-key="↵"]').trigger("click");

    expect(wrapper.find('[aria-label="Row 1"]').classes()).toContain('invalid')

    const toastContainer = wrapper.find('[id="gameToaster"]')

    expect(toastContainer.find('[aria-live="polite"]').text()).toBe('Not in word list')

    vi.runAllTimers();
    await nextTick();

    expect(wrapper.find('[aria-label="Row 2"]').classes()).not.toContain('invalid')
    expect(toastContainer.find('[aria-live="polite"]').exists()).toBe(false)
  });
});
