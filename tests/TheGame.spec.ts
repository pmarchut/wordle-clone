import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import TheGame from "../src/components/TheGame.vue";
import { createTestingPinia } from "@pinia/testing";
import { setActivePinia } from "pinia";
import { useGuesses } from "../src/stores/guessesStore";

// 📌 Factory do montowania komponentu TheGame
const factoryMount = () => {
    const pinia = createTestingPinia({ createSpy: vi.fn }); 
    setActivePinia(pinia);
    const guesses = useGuesses(); 

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
        wrapper: mount(TheGame, { global: { plugins: [pinia] } }),
        guesses
    };
};

describe("TheGame.vue", () => {
    it("handles animation and backspace correctly", async () => {
        const { wrapper } = factoryMount();

        // 🔹 Początkowo backspace powinien być zablokowany
        const backspaceButton = wrapper.find('[data-key="←"]');
        expect(backspaceButton.attributes("aria-disabled")).toBe("true");

        // 🔹 Wpisujemy literę "A"
        const letterButton = wrapper.find('[data-key="a"]');
        await letterButton.trigger("click");

        // 🔹 Sprawdzamy czy litera pojawiła się w AppTile
        const firstTile = wrapper.find('[data-testid="tile"]');
        
        expect(firstTile.attributes('data-animation')).toBe('pop')
        expect(firstTile.attributes('aria-live')).not.toBe('off') // Podczas animacji aria-live ≠ off

        // ✅ Symulacja zakończenia animacji (event transitionend lub animationend)
        await firstTile.trigger('animationend')
      
        // ✅ Po zakończeniu animacji `data-animation` powinno być `idle`
        expect(firstTile.attributes('data-animation')).toBe('idle')
      
        // ✅ Po zakończeniu animacji `aria-live` powinno wrócić na `off`
        expect(firstTile.attributes('aria-live')).toBe('off')

        expect(firstTile.text()).toBe("A");

        // 🔹 Backspace powinien być teraz aktywny
        expect(backspaceButton.attributes("aria-disabled")).toBe("false");

        // 🔹 Klikamy backspace
        await backspaceButton.trigger("click");

        // 🔹 Sprawdzamy, czy litera została usunięta
        expect(firstTile.text()).toBe("");

        // 🔹 Backspace powinien znów być zablokowany
        expect(backspaceButton.attributes("aria-disabled")).toBe("true");
    });

    it("enables enter when row is full", async () => {
        const { wrapper } = factoryMount();

        // 🔹 Początkowo enter powinien być zablokowany
        const enterButton = wrapper.find('[data-key="↵"]');
        expect(enterButton.attributes("aria-disabled")).toBe("true");

        // 🔹 Wpisujemy 5 liter do pierwszego rzędu
        const letters = ["a", "b", "c", "d", "e"];
        for (const letter of letters) {
            await wrapper.find(`[data-key="${letter}"]`).trigger("click");
        }

        // 🔹 Enter powinien być teraz aktywny
        expect(enterButton.attributes("aria-disabled")).toBe("false");
    });
});
