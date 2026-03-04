import axios from "axios";

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