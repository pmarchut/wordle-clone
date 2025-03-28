import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import AppHelp from "../src/components/AppHelp.vue";

describe("AppHelp.vue", () => {
  it("renders 5 wordy, light and rogue letters", () => {
    const wrapper = mount(AppHelp);
    const wordyLetters = wrapper.findAll('[data-testid="wordy-letter"]');
    const lightLetters = wrapper.findAll('[data-testid="light-letter"]');
    const rogueLetters = wrapper.findAll('[data-testid="rogue-letter"]');

    expect(wordyLetters.length).toBe(5);
    expect(lightLetters.length).toBe(5);
    expect(rogueLetters.length).toBe(5);
  });
});
