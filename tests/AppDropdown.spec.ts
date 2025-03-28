import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import { createTestingPinia } from "@pinia/testing";
import AppDropdown from '../src/components/AppDropdown.vue';

// 📌 Factory do montowania komponentu AppDropdown
const factoryMount = () => {
    const pinia = createTestingPinia(); // Tworzymy testową Pinia
  
    return mount(AppDropdown, {
        global: {
            plugins: [pinia], // Przekazujemy Pinia
        },
        props: { leftPosition: 200 }
    });
};

describe('AppDropdown.vue', () => {
    it('sets correct left style based on prop', () => {
        const wrapper = factoryMount()

        expect(wrapper.find('ul').attributes('style')).toContain('left: 200px');
    });

    it("renders the correct href in menu links", () => {
        const wrapper = factoryMount();

        const links = wrapper.findAll("a"); // Pobieramy wszystkie linki w dropdownie
        expect(links.length).toBe(2); // Powinny być dokładnie 2 linki
    
        // Przykład sprawdzenia pierwszego linka
        expect(links[0].attributes("href")).toBe("https://www.nytimes.com/2022/02/10/crosswords/best-wordle-tips.html");
        expect(links[1].attributes("href")).toBe("https://www.nytimes.com/2023/08/01/crosswords/how-to-talk-about-wordle.html");
    });
});
