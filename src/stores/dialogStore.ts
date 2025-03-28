import { defineStore } from "pinia";

export interface dialogProps {
  type: "help Dialog" | "settings Dialog",
  id: string,
  heading: string,
}

export const useDialogs = defineStore("dialogs", {
  state: () => ({
    dialog: {
        type: "help Dialog",
        id: "help-dialog",
        heading: "How to Play",
    } as dialogProps | null,
  }),

  actions: {
    showHelpDialog() {
      this.dialog = {
        type: "help Dialog",
        id: "help-dialog",
        heading: "How to Play",
      };
    },
    showSettingsDialog() {
      this.dialog = {
        type: "settings Dialog",
        id: "settings-dialog",
        heading: "Settings",
      };
    },
    hideDialog() {
        this.dialog = null;
    }
  },
});
