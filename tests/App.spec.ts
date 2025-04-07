import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { useLocalStorage } from "@vueuse/core";
import { ref, nextTick } from "vue";
import App from "../src/App.vue";
import { createTestingPinia } from "@pinia/testing";
import { setActivePinia } from "pinia";
import { useDialogs } from "../src/stores/dialogStore";
import { useGuesses } from "../src/stores/guessesStore";
import { useToasts } from "../src/stores/toastStore";
import type { dialogProps } from "../src/stores/dialogStore";

// Mockujemy `useLocalStorage`
vi.mock("@vueuse/core", () => ({
  useLocalStorage: vi.fn(),
}));

vi.useFakeTimers(); // 🔥 Mockujemy setTimeout dla Vitest

// 📌 Factory do montowania komponentu App
const factoryMount = (dialogsState: dialogProps | null = null) => {
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

  toasts.showToast = vi.fn((message: string) => {
    const id = toasts.toasts.length

    toasts.toasts.push({ id, message })

    setTimeout(() => toasts.closeToast(id), 3000)
  })

  toasts.closeToast = vi.fn((id: number) => {
    toasts.toasts = toasts.toasts.filter((toast) => toast.id !== id)
  })

  guesses.guesses = ['', '', '', '', '', '']
  guesses.checks = [false, false, false, false, false, false]
  guesses.invalid = false

  guesses.handleEnter = vi.fn(() => {
    if (!guesses.canSubmit) {
      guesses.invalid = true
      toasts.showToast("Not enough letters");
      setTimeout(() => {
        guesses.invalid = false
      }, 600)
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
});
