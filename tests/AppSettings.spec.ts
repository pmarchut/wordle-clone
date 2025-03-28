import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from "vitest";
import AppSettings from '../src/components/AppSettings.vue';
import { useLocalStorage } from '@vueuse/core';
import { ref } from "vue";

vi.mock('@vueuse/core', async (importOriginal) => {
    const actual = (await importOriginal()) as Record<string, unknown>; // Wymuszamy typ obiektu
    return {
      ...actual,
      useLocalStorage: vi.fn(),
    };
});

// 📌 Factory do montowania komponentu AppSettings
const factoryMount = () => {
  return mount(AppSettings, {
    attachTo: document.body, // Dla testów interakcji
  });
};

describe('SettingsDialog', () => {
  it('should toggle wordle-hardmode in localStorage on switch click', async () => {
    const mockStorage = ref(false); // Symulujemy przechowywanie w localStorage
    useLocalStorage.mockReturnValue(mockStorage); // Mockujemy hook VueUse

    const wrapper = factoryMount();

    const switchElement = wrapper.find('[id="Hard Mode"]');
    const switchButton = switchElement.find('button');
    expect(mockStorage.value).toBe(false); // Domyślnie powinno być false
    expect(switchElement.classes()).not.toContain('checked'); // Klasa nie powinna zawierać 'checked'
    expect(switchButton.attributes('aria-checked')).toBe('false'); // Atrybut aria-checked powinien być false

    await switchButton.trigger('click'); // Klikamy w przełącznik

    expect(mockStorage.value).toBe(true); // Powinno zmienić się na true
    expect(switchElement.classes()).toContain('checked'); // Klasa powinna zawierać 'checked'
    expect(switchButton.attributes('aria-checked')).toBe('true'); // Atrybut aria-checked powinien być true

    await switchButton.trigger('click'); // Klikamy ponownie

    expect(mockStorage.value).toBe(false); // Powinno wrócić do false
    expect(switchElement.classes()).not.toContain('checked'); // Klasa nie powinna zawierać 'checked'
    expect(switchButton.attributes('aria-checked')).toBe('false'); // Atrybut aria-checked powinien być false
  });

  it('should toggle wordle-darkmode in body element and localStorage on switch click', async () => {
    const mockStorage = ref(true); // Symulujemy przechowywanie w localStorage
    useLocalStorage.mockReturnValue(mockStorage); // Mockujemy hook VueUse

    const toggleSpy = vi.spyOn(document.body.classList, 'toggle');

    const wrapper = factoryMount();

    const switchElement = wrapper.find('[id="Dark Mode"]');
    const switchButton = switchElement.find('button');
    expect(mockStorage.value).toBe(true); // Domyślnie powinno być true
    expect(switchElement.classes()).toContain('checked'); // Klasa powinna zawierać 'checked'
    expect(switchButton.attributes('aria-checked')).toBe('true'); // Atrybut aria-checked powinien być true

    await switchButton.trigger('click'); // Klikamy w przełącznik

    expect(mockStorage.value).toBe(false); // Powinno zmienić się na false
    expect(switchElement.classes()).not.toContain('checked'); // Klasa nie powinna zawierać 'checked'
    expect(switchButton.attributes('aria-checked')).toBe('false'); // Atrybut aria-checked powinien być false
    expect(toggleSpy).toHaveBeenNthCalledWith(1, "dark", false); // Pierwsze wywołanie

    await switchButton.trigger('click'); // Klikamy ponownie

    expect(mockStorage.value).toBe(true); // Powinno wrócić do true
    expect(switchElement.classes()).toContain('checked'); // Klasa powinna zawierać 'checked'
    expect(switchButton.attributes('aria-checked')).toBe('true'); // Atrybut aria-checked powinien być true
    expect(toggleSpy).toHaveBeenNthCalledWith(2, "dark", true); // Drugie wywołanie

    toggleSpy.mockRestore(); // Przywracamy oryginalną implementację
  });

  it('should toggle wordle-colorblind in body element and localStorage on switch click', async () => {
    const mockStorage = ref(false); // Symulujemy przechowywanie w localStorage
    useLocalStorage.mockReturnValue(mockStorage); // Mockujemy hook VueUse

    const toggleSpy = vi.spyOn(document.body.classList, 'toggle');

    const wrapper = factoryMount();

    const switchElement = wrapper.find('[id="High Contrast Mode"]');
    const switchButton = switchElement.find('button');
    expect(mockStorage.value).toBe(false); // Domyślnie powinno być false
    expect(switchElement.classes()).not.toContain('checked'); // Klasa nie powinna zawierać 'checked'
    expect(switchButton.attributes('aria-checked')).toBe('false'); // Atrybut aria-checked powinien być false

    await switchButton.trigger('click'); // Klikamy w przełącznik

    expect(mockStorage.value).toBe(true); // Powinno zmienić się na true
    expect(switchElement.classes()).toContain('checked'); // Klasa powinna zawierać 'checked'
    expect(switchButton.attributes('aria-checked')).toBe('true'); // Atrybut aria-checked powinien być true
    expect(toggleSpy).toHaveBeenNthCalledWith(1, "colorblind", true); // Pierwsze wywołanie

    await switchButton.trigger('click'); // Klikamy ponownie

    expect(mockStorage.value).toBe(false); // Powinno wrócić do false
    expect(switchElement.classes()).not.toContain('checked'); // Klasa nie powinna zawierać 'checked'
    expect(switchButton.attributes('aria-checked')).toBe('false'); // Atrybut aria-checked powinien być false
    expect(toggleSpy).toHaveBeenNthCalledWith(2, "colorblind", false); // Drugie wywołanie

    toggleSpy.mockRestore(); // Przywracamy oryginalną implementację
  });

  it('should toggle wordle-onscreen-input-only in localStorage on switch click', async () => {
    const mockStorage = ref(false); // Symulujemy przechowywanie w localStorage
    useLocalStorage.mockReturnValue(mockStorage); // Mockujemy hook VueUse

    const wrapper = factoryMount();

    const switchElement = wrapper.find('[id="Virtual Keyboard Input Only"]');
    const switchButton = switchElement.find('button');
    expect(mockStorage.value).toBe(false); // Domyślnie powinno być false
    expect(switchElement.classes()).not.toContain('checked'); // Klasa nie powinna zawierać 'checked'
    expect(switchButton.attributes('aria-checked')).toBe('false'); // Atrybut aria-checked powinien być false

    await switchButton.trigger('click'); // Klikamy w przełącznik

    expect(mockStorage.value).toBe(true); // Powinno zmienić się na true
    expect(switchElement.classes()).toContain('checked'); // Klasa powinna zawierać 'checked'
    expect(switchButton.attributes('aria-checked')).toBe('true'); // Atrybut aria-checked powinien być true

    await switchButton.trigger('click'); // Klikamy ponownie

    expect(mockStorage.value).toBe(false); // Powinno wrócić do false
    expect(switchElement.classes()).not.toContain('checked'); // Klasa nie powinna zawierać 'checked'
    expect(switchButton.attributes('aria-checked')).toBe('false'); // Atrybut aria-checked powinien być false
  });
});
