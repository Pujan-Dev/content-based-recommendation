import { create } from "zustand"

const useAuthStore = create((set) => ({
    authState: { isLoggedIn: false, hasInterests: false, userId: null},
    interests: [],
    setAuthState: (newState) => set(() => ({ authState: newState })),
    setInterests: (interests) => set(() => ({ interests })),
}))

export default useAuthStore