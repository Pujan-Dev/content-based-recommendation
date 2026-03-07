import React, { useState } from "react";

const LikeAndDislike = () => {
  const [likes, setLikes] = useState(0)
  const [dislikes, setDislikes] = useState(0)
  const [userAction, setUserAction] = useState(null)


  const handleLike = () => {
    if (userAction === "liked") {
      setLikes(likes - 1);
      setUserAction(null);
    } else if (userAction === "disliked") {
      setDislikes(dislikes - 1);
      setLikes(likes + 1);
      setUserAction("liked");
    } else {
      setLikes(likes + 1);
      setUserAction("liked");
    }
  };

  const handleDislike = () => {
    if (userAction === "disliked") {
      setDislikes(dislikes - 1);
      setUserAction(null);
    } else if (userAction === "liked") {
      setLikes(likes - 1);
      setDislikes(dislikes + 1);
      setUserAction("disliked");
    } else {
      setDislikes(dislikes + 1);
      setUserAction("disliked");
    }
  };




  return (
    <div>
      <button onClick={handleLike}>
        Like ({likes})
      </button>

      <button onClick={handleDislike} style={{ marginLeft: "10px" }}>
         Dislike ({dislikes})
      </button>
    </div>
  );
};

export default LikeAndDislike;