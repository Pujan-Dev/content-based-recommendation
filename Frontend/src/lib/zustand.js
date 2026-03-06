import { create } from "zustand";

const useAuthStore = create((set) => ({
  authState: { isLoggedIn: false, hasInterests: false },
  setAuthState: (newState) => set(() => ({ authState: newState })),
}));

export default useAuthStore;