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

    return { 
        wrapper: mount(GameKeyboard, { 
            global: { plugins: [pinia] },
            attachTo: document.body, // Dla testów interakcji 
        }),
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

    it("does not call enterLetter again when Enter is pressed after focusing a letter button", async () => {
        const { wrapper, guesses } = factoryMount();
    
        const enterLetterSpy = vi.spyOn(guesses, "enterLetter");
        const handleEnterSpy = vi.fn();
        guesses.handleEnter = handleEnterSpy;
    
        const letterButton = wrapper.find('[data-key="a"]');
    
        // 🔍 Ręcznie ustawiamy DOM-owy focus
        letterButton.element.focus();
    
        // ✅ Klik — enterLetter się wywoła
        await letterButton.trigger("click");
    
        // ❗️ Naciśnięcie Enter (ale my symulujemy DOM-owe zachowanie: click przez Enter)
        // UWAGA: normalnie przeglądarka sama robi `click()` na `document.activeElement`, tu musimy to wymusić
        document.activeElement?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    
        // 🧠 Dodatkowo: keydown dla obsługi handleEnter
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    
        await nextTick();
    
        // 👉 enterLetter powinno się wywołać tylko raz (tylko przy kliknięciu)
        expect(enterLetterSpy).toHaveBeenCalledTimes(1);
    
        // 👉 handleEnter powinno się odpalić na Enter
        expect(handleEnterSpy).toHaveBeenCalled();
    });

    it("does not call handleEnter when Enter is pressed while a key is focused", async () => {
        const { wrapper, guesses } = factoryMount();
      
        const handleEnterSpy = vi.fn();
        guesses.handleEnter = handleEnterSpy;
      
        const letterButton = wrapper.find('[data-key="a"]');
      
        // ręczne ustawienie activeElement
        Object.defineProperty(document, 'activeElement', {
          configurable: true,
          get: () => letterButton.element,
        });
      
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        await nextTick();
      
        expect(handleEnterSpy).not.toHaveBeenCalled();
    });

    it('calls preventDefault on mousedown to preserve focus', async () => {
        const { wrapper } = factoryMount();
        const button = wrapper.find('[data-key="a"]');
      
        const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
        const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      
        button.element.dispatchEvent(event);
      
        expect(preventDefaultSpy).toHaveBeenCalled();
    });
});
