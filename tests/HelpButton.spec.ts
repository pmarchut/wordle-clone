import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import { nextTick } from "vue";
import { createTestingPinia } from "@pinia/testing";
import HelpButton from "../src/components/HelpButton.vue";

const left = 1000
const width = 100
const dropdownWidth = 178;

vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    left, // Symulujemy pozycję przycisku
    right: 200,
    width,
    top: 0,
    bottom: 0,
    height: 0,
    x: 100,
    y: 0,
    toJSON: () => {},
})

vi.useFakeTimers(); // 🔥 Mockujemy setTimeout dla Vitest

// 📌 Factory do montowania komponentu HelpButton
const factoryMount = () => {
    const pinia = createTestingPinia(); // Tworzymy testową Pinia
  
    return mount(HelpButton, {
        global: {
            plugins: [pinia], // Przekazujemy Pinia
        }, 
        attachTo: document.body 
    })
};

describe("HelpButton.vue", () => {
    it('has icon that matches snapshot', () => {
        const wrapper = factoryMount()
        const svgIcon = wrapper.find('[data-testid="help-button"]')

        expect(svgIcon.html()).toMatchSnapshot()
    })

    it('shows menu when clicked and passes correct leftPosition prop', async () => {
        const wrapper = factoryMount()
        const helpButton = wrapper.find('[data-testid="help-button"]')
    
        expect(wrapper.find('[role="menu"]').exists()).toBe(false)
        expect(helpButton.attributes('aria-expanded')).toBe('false')
    
        await helpButton.trigger('click')
        await nextTick() // Upewniamy się, że Vue przetworzy zmiany w DOM
    
        expect(wrapper.find('[role="menu"]').exists()).toBe(true)
        expect(helpButton.attributes('aria-expanded')).toBe('true')
    
        // Pobranie wartości leftPosition
        const dropdown = wrapper.findComponent({ name: 'AppDropdown' })
        const leftValue = dropdown.props('leftPosition')
    
        // Sprawdzamy, czy leftPosition jest poprawnie ustawione
        expect(leftValue).toBe(left + width - dropdownWidth)
    })

    it("renders only How to Play, Tips and Tricks and Glossary list items", async () => {
        const wrapper = factoryMount()
        const helpButton = wrapper.find('[data-testid="help-button"]')

        await helpButton.trigger('click')
      
        // Pobranie wszystkich elementów listy
        const listItems = wrapper.findAll("li");
      
        // Powinny być dokładnie 3 elementy
        expect(listItems.length).toBe(3);
      
        // Sprawdzenie czy są poprawne elementy
        expect(listItems[0].html()).toContain("How to Play");
        expect(listItems[1].html()).toContain("Tips and Tricks");
        expect(listItems[2].html()).toContain("Glossary");
    });

    it("closes AppDropdown when clicking on button again", async () => {
        const wrapper = factoryMount();
      
        const helpButton = wrapper.find('[data-testid="help-button"]');
        await helpButton.trigger("click");
    
        vi.runAllTimers();
        await nextTick();
      
        expect(wrapper.findComponent({ name: "AppDropdown" }).exists()).toBe(true);
    
        // Kliknięcie drugi raz w przycisk
        await helpButton.trigger("click");
        await nextTick();
    
        expect(wrapper.findComponent({ name: "AppDropdown" }).exists()).toBe(false);
    });
});
