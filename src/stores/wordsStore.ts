import { defineStore } from 'pinia';
import { fetchWordList, initWord } from '../services/wordService'

export const useWords = defineStore('words', {
    state: () => ({
        wordList: [] as string[],
    }),

    actions: {
        async init() {
            this.wordList = await fetchWordList();
            await initWord(this.wordList);
        },
    }
});
