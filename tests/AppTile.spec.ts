import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AppTile from "../src/components/AppTile.vue";

describe("AppTile.vue", () => {
    it('sets aria-label correctly from props', () => {
        const wrapper = mount(AppTile, {
          props: { ariaLabel: '1st letter, W, correct' }
        })
      
        expect(wrapper.attributes('aria-label')).toBe('1st letter, W, correct')
    })

    it('sets data-state correctly from props', async () => {
        const wrapper = mount(AppTile, {
          props: { state: 'correct' }
        })
      
        expect(wrapper.attributes('data-state')).toBe('correct')
    })

    it('applies animation props, handles flip-in and flip-out animations and resets after animations end', async () => {
        const wrapper = mount(AppTile, {
          props: { dataAnimation: 'flip-in' }
        })
      
        const tile = wrapper.find('[data-testid="tile"]')
      
        // ✅ Sprawdzenie, czy animacja została ustawiona na początku
        expect(tile.attributes('data-animation')).toBe('flip-in')
        expect(tile.attributes('aria-live')).not.toBe('off') // Podczas animacji aria-live ≠ off
      
        // ✅ Symulacja zakończenia animacji (event transitionend lub animationend)
        await tile.trigger('animationend')

        expect(tile.attributes('data-animation')).toBe('flip-out')
        expect(tile.attributes('aria-live')).not.toBe('off') // Podczas animacji aria-live ≠ off

        // ✅ Symulacja zakończenia animacji (event transitionend lub animationend)
        await tile.trigger('animationend')
      
        // ✅ Po zakończeniu animacji `data-animation` powinno być `idle`
        expect(tile.attributes('data-animation')).toBe('idle')
      
        // ✅ Po zakończeniu animacji `aria-live` powinno wrócić na `off`
        expect(tile.attributes('aria-live')).toBe('off')
    })
});
