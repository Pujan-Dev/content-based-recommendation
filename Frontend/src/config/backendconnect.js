import axios from "axios";
const BASE_URL=import.meta.env.VITE_BACKEND_URL

//AUTH
export const signup = async (name,email,password) => {
  const res = await axios.post(`${BASE_URL}/backend/signup`,
    {name,email,password},
    {withCredentials: true}
  )
  return res.data
}
export const login = async (email,password) => {
  const res = await axios.post(`${BASE_URL}/backend/login`,
    {email,password},
    {withCredentials: true}
  )
  return res.data
}
export const logout = async () => {
  const res = await axios.post(`${BASE_URL}/backend/logout`,
    {},
    {withCredentials: true}
  )
  return res.data
}

// Interests
export const saveInterests = async (categories) => {
    const res = await axios.post(
        `${BASE_URL}/backend/category`,
        { categories: categories.map(c => c.toLowerCase()) },  // ← array
        { withCredentials: true }
    )
    return res.data
}

// Get interests to feed
export const getHome = async (page = 1, limit = 10) => {
    const res = await axios.get(
        `${BASE_URL}/backend/home?page=${page}&limit=${limit}`,
        { withCredentials: true }
    )
    return res.data
}

// POSTS
export const likePost = async (postId) => {
    const res = await axios.post(
        `${BASE_URL}/backend/post/${postId}/like`,
        {},
        { withCredentials: true }
    )
    return res.data
}

export const dislikePost = async (postId) => {
    const res = await axios.post(
        `${BASE_URL}/backend/post/${postId}/dislike`,
        {},
        { withCredentials: true }
    )
    return res.data
}

export const createPost = async (formData) => {
    const res = await axios.post(
        `${BASE_URL}/backend/post`,
        formData,
        {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" }
        }
    )
    return res.data
}

export const updatePost = async (postId, data) => {
    const res = await axios.put(
        `${BASE_URL}/backend/post/${postId}`,
        data,
        { withCredentials: true }
    )
    return res.data
}

export const deletePost = async (postId) => {
    const res = await axios.delete(
        `${BASE_URL}/backend/post/${postId}`,
        { withCredentials: true }
    )
    return res.data
}

// TRACKING
export const trackView = async (postId, category, dwellTime) => {
    const res = await axios.post(
        `${BASE_URL}/backend/track`,
        { postId, category, dwellTime },
        { withCredentials: true }
    )
    return res.data
}

//Fetching Posts

export const getPost = async (postId) => {
    const res = await axios.get(
        `${BASE_URL}/backend/post/${postId}`,
        { withCredentials: true }
    )
    return res.data
}