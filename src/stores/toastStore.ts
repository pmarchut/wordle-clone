import { defineStore } from "pinia";

export interface toastProps {
  id: number,
  message: string,
  fade?: boolean,
}

export const useToasts = defineStore("toasts", {
  state: () => ({
    toasts: [] as toastProps[],
  }),

  actions: {
    showToast(message: string) {
      const id = this.toasts.length

      this.toasts.push({ id, message })

      setTimeout(() => this.closeToast(id), 3000)
    },
    closeToast(id: number) {
      this.toasts = this.toasts.map((toast) => toast.id === id ? { ...toast, fade: true } : toast)
      setTimeout(() => this.toasts = this.toasts.filter((toast) => toast.id !== id), 300)
    }
  },
});
