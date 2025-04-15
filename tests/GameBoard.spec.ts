import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import GameBoard from "../src/components/GameBoard.vue"
import { createTestingPinia } from "@pinia/testing";
import { setActivePinia } from "pinia";
import { useGuesses } from "../src/stores/guessesStore";

// 📌 Factory do montowania komponentu GameBoard
const factoryMount = (stateProp?: { guesses?: string[] }) => {
    const defaultState = { 
        guesses: ['', '', '', '', '', ''],
    };
    const state = { ...defaultState, ...stateProp }
    const pinia = createTestingPinia({ createSpy: vi.fn }); // Tworzymy testową Pinia
  
    setActivePinia(pinia);
    const guesses = useGuesses(); // Pobieramy store
  
    guesses.guesses = state.guesses
  
    return mount(GameBoard, {
      global: {
        plugins: [pinia], // Przekazujemy Pinia
      }
    });
};

describe("GameBoard.vue", () => {
    it('renders the correct number of rows and passes props from store to rows', () => {
        const wrapper = factoryMount({ guesses: ['HELLO', 'WORLD', '', '', '', ''] });
        const rows = wrapper.findAllComponents({ name: 'AppRow' })

        expect(rows).toHaveLength(6);
        expect(rows[0].props('word')).toBe('HELLO')
        expect(rows[1].props('word')).toBe('WORLD')
    });
});
