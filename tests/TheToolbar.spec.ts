import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import { createTestingPinia } from "@pinia/testing";
import { nextTick } from "vue";
import TheToolbar from "../src/components/TheToolbar.vue";

vi.useFakeTimers(); // 🔥 Mockujemy setTimeout dla Vitest

// 📌 Factory do montowania komponentu TheToolbar
const factoryMount = () => {
    const pinia = createTestingPinia(); // Tworzymy testową Pinia
  
    return mount(TheToolbar, {
        global: {
            plugins: [pinia], // Przekazujemy Pinia
        }, 
        attachTo: document.body 
    })
};

describe("TheToolbar.vue", () => {
  it("renders Toolbar component", () => {
    const wrapper = factoryMount();

    // Sprawdzenie, czy istnieje element z atrybutem data-testid="toolbar"
    const toolbarElement = wrapper.find('[data-testid="toolbar"]');
    expect(toolbarElement.exists()).toBe(true);
  });

  it("renders only Help and Settings buttons", () => {
    const wrapper = factoryMount();
  
    // Pobranie wszystkich przycisków
    const buttons = wrapper.findAll("button");
  
    // Powinny być dokładnie 2 przyciski
    expect(buttons.length).toBe(2);
  
    // Sprawdzenie czy są poprawne przyciski
    expect(buttons[0].attributes("aria-label")).toBe("Help");
    expect(buttons[1].attributes("aria-label")).toBe("Settings");
  });

  it("closes AppDropdown when clicking outside", async () => {
    const wrapper = factoryMount();
  
    const helpButton = wrapper.find('[data-testid="help-button"]');
    await helpButton.trigger("click");

    vi.runAllTimers(); // 🔥 Symulujemy zakończenie `setTimeout`
    await nextTick();
  
    expect(wrapper.findComponent({ name: "AppDropdown" }).exists()).toBe(true);

    // Kliknięcie poza dropdownem
    await wrapper.trigger("click");
    await nextTick();

    expect(wrapper.findComponent({ name: "AppDropdown" }).exists()).toBe(false);
  });
});
