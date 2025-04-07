import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AppKey from "../src/components/AppKey.vue";

describe("AppKey.vue", () => {
    it('sets correct props without spacer', () => {
        const wrapper = mount(AppKey, {
            props: {
                dataKey: 'a',
                ariaLabel: 'add a',
                ariaDisabled: false
            }
        })
        const button = wrapper.find('button')
      
        expect(button.attributes('data-key')).toBe('a')
        expect(button.attributes('aria-label')).toBe('add a')
        expect(button.attributes('aria-disabled')).toBe('false')
        expect(wrapper.find('[data-testid="spacer"]').exists()).toBe(false)
    })

    it('adds spacer before the tile', () => {
        const wrapper = mount(AppKey, {
            props: {
                dataKey: 'a',
                ariaLabel: 'add a',
                ariaDisabled: false,
                spacerBefore: true
            }
        });
    
        const spacer = wrapper.find('[data-testid="spacer"]');
        const button = wrapper.find('button');
    
        expect(spacer.exists()).toBe(true);
        expect(button.exists()).toBe(true);
    
        expect(spacer.element.compareDocumentPosition(button.element) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });
    
    it('adds spacer after the tile', () => {
        const wrapper = mount(AppKey, {
            props: {
                dataKey: 'a',
                ariaLabel: 'add a',
                ariaDisabled: false,
                spacerAfter: true
            }
        });
    
        const spacer = wrapper.find('[data-testid="spacer"]');
        const button = wrapper.find('button');
    
        expect(spacer.exists()).toBe(true);
        expect(button.exists()).toBe(true);
    
        expect(spacer.element.compareDocumentPosition(button.element) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
    });
});
