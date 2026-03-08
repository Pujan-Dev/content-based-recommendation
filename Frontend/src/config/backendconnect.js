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
export const logout = async (email,password) => {
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
        { category: categories[0].toLowerCase() }, //Sending only a string (not array) because backend expects only a string. Will fix later
        { withCredentials: true }
    )
    return res.data
}

export const handlereaction = async (postId, userId,action) => {
  const connecttoreaction = await axios.post(
    "http://localhost:8080/reactions",
    {
      postId: postId,
      userId: userId,
      action: action
    },
    {
      withCredentials: true,
    }
  );

  return connecttoreaction.data;
};

export const fetchreactions = async (postId) => {
  const connecttofetchreaction = await axios.get(
    `http://localhost:8080/reactions?postId=${postId}`,
    {
      withCredentials: true,
    }
  );

  return connecttofetchreaction.data;
}