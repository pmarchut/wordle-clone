import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import { createTestingPinia } from "@pinia/testing";
import SettingsButton from "../src/components/SettingsButton.vue";

describe("SettingsButton.vue", () => {
    it('has icon that matches snapshot', () => {
        const pinia = createTestingPinia(); // Tworzymy testową Pinia
        const wrapper = mount(SettingsButton, {
            global: {
                plugins: [pinia], // Przekazujemy Pinia
            },
        });

        expect(wrapper.html()).toMatchSnapshot()
    })
});
