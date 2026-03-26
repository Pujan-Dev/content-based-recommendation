import { create } from "zustand"

const useAuthStore = create((set) => ({
    authState: { isLoggedIn: false, hasInterests: false, userId: null},
    interests: [],
    setAuthState: (newState) => set(() => ({ authState: newState })),
    setInterests: (interests) => set(() => ({ interests })),
}))

const usePostsStore = create((set) => ({
    posts: [],
    setPosts: (posts) => set(() => ({ posts })),
    addPost: (post) => set((state) => ({ posts: [...state.posts, post] })),
    prependPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
}))

export { useAuthStore, usePostsStore }
export default useAuthStore