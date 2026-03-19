import { create } from "zustand";

export const useAnalyticsStore = create((set) => ({

  filters: {
    department: "",
    course: "",
    semester: "",
    subject: ""
  },

  dataset: [],

  setFilters: (filters) => set({ filters }),

  setDataset: (data) => set({ dataset: data })

}));