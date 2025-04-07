import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import GameKeyboard from "../src/components/GameKeyboard.vue";
import { createTestingPinia } from "@pinia/testing";
import { setActivePinia } from "pinia";
import { useGuesses } from "../src/stores/guessesStore";
import { nextTick, ref } from "vue";
import { useLocalStorage } from '@vueuse/core';

// Mockujemy `useLocalStorage`
vi.mock("@vueuse/core", () => ({
    useLocalStorage: vi.fn(),
}));

// 📌 Factory do montowania komponentu GameKeyboard
const factoryMount = () => {
    const pinia = createTestingPinia({ createSpy: vi.fn }); // Tworzymy testową Pinia
    setActivePinia(pinia);
    const guesses = useGuesses(); // Pobieramy store

    guesses.guesses = ['', '', '', '', '', '']
    guesses.checks = [false, false, false, false, false, false]

    guesses.enterLetter = vi.fn((letter: string) => {
        const guessIndex = guesses.checks.findIndex((check) => check === false);
        if (guessIndex === -1) return;

        if (guesses.guesses[guessIndex].length < 5) {
            guesses.guesses = guesses.guesses.map((guess, index) =>
            index === guessIndex ? guess + letter : guess
        )}
    });
    guesses.handleBackspace = vi.fn(() => {
        if (!guesses.canBackspace) return; // Używamy getter zamiast sprawdzać w akcji

        const guessIndex = guesses.checks.findIndex((check) => check === false);
        guesses.guesses = guesses.guesses.map((guess, index) =>
            index === guessIndex ? guess.slice(0, -1) : guess
        );
    });

    return { 
        wrapper: mount(GameKeyboard, { global: { plugins: [pinia] } }),
        guesses
    };
};

describe("GameKeyboard.vue", () => {
    beforeEach(() => {
        useLocalStorage.mockReturnValue(ref(false)); // Ustawiamy domyślną wartość na false
    });

    it("renders all keyboard buttons", () => {
        const { wrapper } = factoryMount();
        expect(wrapper.findAll("button")).toHaveLength(28); // 26 liter + Enter + Backspace
    });

    it("calls enterLetter when a letter key is clicked and calls handleBackspace when the backspace key is clicked", async () => {
        const { wrapper, guesses } = factoryMount();
        const enterLetterSpy = vi.spyOn(guesses, "enterLetter"); // Podsłuchujemy akcję
        const handleBackspaceSpy = vi.spyOn(guesses, "handleBackspace"); // Podsłuchujemy akcję

        const letterButton = wrapper.find('[data-key="a"]');
        await letterButton.trigger("click");

        const backspaceButton = wrapper.find('[data-key="←"]');
        await backspaceButton.trigger("click");

        expect(enterLetterSpy).toHaveBeenCalledWith("A");
        expect(handleBackspaceSpy).toHaveBeenCalled();
    });

    it("handles physical keyboard input correctly", async () => {
        const { wrapper, guesses } = factoryMount();
      
        const enterLetterSpy = vi.spyOn(guesses, "enterLetter");
        const handleBackspaceSpy = vi.spyOn(guesses, "handleBackspace");
      
        // 🔤 Symulacja naciśnięcia litery A
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
        await nextTick();
      
        expect(enterLetterSpy).toHaveBeenCalledWith("A");
      
        // ⌫ Symulacja naciśnięcia Backspace
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace" }));
        await nextTick();
      
        expect(handleBackspaceSpy).toHaveBeenCalled();
    });

    it("blocks physical keyboard input when wordleOnscreenInputOnly is true", async () => {
        useLocalStorage.mockReturnValue(ref(true)); // 🔒 Aktywuj blokadę
      
        const { guesses } = factoryMount();
      
        const enterLetterSpy = vi.spyOn(guesses, "enterLetter");
        const handleBackspaceSpy = vi.spyOn(guesses, "handleBackspace");
      
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace" }));
        await nextTick();
      
        expect(enterLetterSpy).not.toHaveBeenCalled();
        expect(handleBackspaceSpy).not.toHaveBeenCalled();
    });
});
