import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AppSwitch from "../src/components/AppSwitch.vue";

// 📌 Factory do montowania komponentu AppSwitch
const factoryMount = (props: { label: string, modelValue: boolean } = { label: 'Hard Mode', modelValue: false }) => {
    return mount(AppSwitch, { props });
};

describe("AppSwitch.vue", () => {
    it('sets id and aria-label correctly from prop', () => {
        const wrapper = factoryMount()
      
        expect(wrapper.attributes('id')).toBe('Hard Mode')
        expect(wrapper.get('button').attributes('aria-label')).toBe('Hard Mode')
    })

    it('set modelValue correctly from prop', () => {
        const wrapper = factoryMount({ label: 'Hard Mode', modelValue: true })

        expect(wrapper.classes()).toContain('checked')
        expect(wrapper.find('button').attributes('aria-checked')).toBe('true')
    })

    it('emits false to true', async () => {
        const wrapper = factoryMount()
        const button = wrapper.find('button')

        await button.trigger('click')
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
    })

    it('emits true to false', async () => {
        const wrapper = factoryMount({ label: 'Hard Mode', modelValue: true })
        const button = wrapper.find('button')

        await button.trigger('click')
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    })
});
