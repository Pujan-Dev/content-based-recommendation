import { create } from "zustand";
import { login, signup, logout } from "../config/backendconnect.js"



const useAuthStore = create((set) => ({
  authState: { isLoggedIn: false, hasInterests: false },
  setAuthState: (newState) => set(() => ({ authState: newState })),
  interests: [],
  setInterests: (interests) => set(() => ({ interests })), 

  login: async (email,password) => {
    const data = await login(email,password)
    if (data.success){
      
    }
  }
}));

export default useAuthStore;