import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AppRow from "../src/components/AppRow.vue";

// 📌 Factory do montowania komponentu AppRow
const factoryMount = (props?: { ariaLabel?: string, word?: string }) => {
    const defaultProps = { ariaLabel: 'Row 1' };

    return mount(AppRow, { props: { ...defaultProps, ...props } });
};

describe("AppRow.vue", () => {
    it('renders the correct number of tiles, not small', () => {
        const wrapper = factoryMount({ word: 'HELLO' });
        const tiles = wrapper.findAll('[data-testid="tile"]')
        expect(tiles).toHaveLength(5);
        tiles.forEach((tile) => expect(tile.classes()).not.toContain('small'))
    });

    it('passes correct letters to tiles', () => {
        const wrapper = factoryMount({ word: 'HELLO' });
        const tiles = wrapper.findAllComponents({ name: "AppTile" });
        expect(tiles[0].text()).toBe('H');
        expect(tiles[1].text()).toBe('E');
        expect(tiles[2].text()).toBe('L');
        expect(tiles[3].text()).toBe('L');
        expect(tiles[4].text()).toBe('O');
        expect(tiles[0].attributes('aria-label')).toBe("1st letter, H")
        expect(tiles[1].attributes('aria-label')).toBe("2nd letter, E")
        expect(tiles[2].attributes('aria-label')).toBe("3rd letter, L")
        expect(tiles[3].attributes('aria-label')).toBe("4th letter, L")
        expect(tiles[4].attributes('aria-label')).toBe("5th letter, O")
        expect(tiles[0].attributes('data-state')).toBe("tbd")
        expect(tiles[1].attributes('data-state')).toBe("tbd")
        expect(tiles[2].attributes('data-state')).toBe("tbd")
        expect(tiles[3].attributes('data-state')).toBe("tbd")
        expect(tiles[4].attributes('data-state')).toBe("tbd")
    });

    it('passes correct letters to tiles when word is not complete', () => {
        const wrapper = factoryMount({ word: 'HE' });
        const tiles = wrapper.findAllComponents({ name: "AppTile" });
        expect(tiles[0].text()).toBe('H');
        expect(tiles[1].text()).toBe('E');
        expect(tiles[0].attributes('aria-label')).toBe("1st letter, H")
        expect(tiles[1].attributes('aria-label')).toBe("2nd letter, E")
        expect(tiles[2].attributes('aria-label')).toBe("3rd letter, empty")
        expect(tiles[3].attributes('aria-label')).toBe("4th letter, empty")
        expect(tiles[4].attributes('aria-label')).toBe("5th letter, empty")
        expect(tiles[0].attributes('data-state')).toBe("tbd")
        expect(tiles[1].attributes('data-state')).toBe("tbd")
        expect(tiles[2].attributes('data-state')).toBe("empty")
        expect(tiles[3].attributes('data-state')).toBe("empty")
        expect(tiles[4].attributes('data-state')).toBe("empty")
    });

    it('sets correct label from props', () => {
        const wrapper = factoryMount();

        expect(wrapper.attributes('aria-label')).toBe('Row 1');
    });
});
