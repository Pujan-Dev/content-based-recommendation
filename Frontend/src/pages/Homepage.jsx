import React, { useEffect, useRef } from "react";
import LikeAndDislike from "../Components/LikeandDislike";

const Homepage = () => {

  const posts = [
    {
      id: 1,
      title: "Post One",
      description:
        "This is a long post content. Imagine this like a Facebook post where user reads the text carefully for some time. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      image: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d"
    },
    {
      id: 2,
      title: "Post Two",
      description:
        "Another interesting post content. The more time user spends here, the more engagement we record. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085"
    },
    {
      id: 3,
      title: "Post Three",
      description:
        "Third post with some valuable information. Scroll to test visibility tracking. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
    },
    {
      id: 4,
      title: "Post Four",
      description:
        "This post talks about technology trends. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2"
    },
    {
      id: 5,
      title: "Post Five",
      description:
        "Engagement tracking is important for recommendation systems. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio.",
      image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b"
    },
    {
      id: 6,
      title: "Post Six",
      description:
        "Understanding user behavior helps personalize feeds. Nullam varius, turpis et commodo pharetra, est eros bibendum elit.",
      image: "https://images.unsplash.com/photo-1508780709619-79562169bc64"
    },
    {
      id: 7,
      title: "Post Seven",
      description:
        "Scroll further to see tracking in action. Suspendisse potenti. Sed egestas, ante et vulputate volutpat.",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9"
    },
    {
      id: 8,
      title: "Post Eight",
      description:
        "Almost at the bottom. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi.",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
    },
    {
      id: 9,
      title: "Post Nine",
      description:
        "This is a much longer post designed to simulate a real Facebook-style reading experience. The purpose of this content is to test engagement tracking more accurately. When users spend more time reading a post, scrolling slowly and focusing on the content, the system should be able to detect that behavior and record the reading duration properly. In real-world applications, this data is extremely valuable because it helps determine which posts are interesting to the user. Platforms use this information to rank content, improve recommendations, and personalize feeds. The longer a user stays on a post while it remains visible in the viewport, the stronger the engagement signal becomes. Therefore, this extended paragraph ensures enough reading material so the tracking logic can properly calculate time spent.",
      image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d"
    }
  ];

  const postRefs = useRef([]);
  const startTimes = useRef({});
  const totalTimes = useRef({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const postId = entry.target.dataset.id;

          if (entry.isIntersecting) {
            // Start timer
            startTimes.current[postId] = Date.now();
          } else {
            // Stop timer
            if (startTimes.current[postId]) {
              const timeSpent = Date.now() - startTimes.current[postId];
              totalTimes.current[postId] =
                (totalTimes.current[postId] || 0) + timeSpent;

              console.log(
                `Post ${postId} read time: ${(totalTimes.current[postId] / 1000).toFixed(2)} seconds`
              );

              startTimes.current[postId] = null;
            }
          }
        });
      },
      { threshold: 0.1 } // Lower threshold for better tracking
    );

    postRefs.current.forEach((post) => {
      if (post) observer.observe(post);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "auto" }}>

      {posts.map((post, index) => (
        <div
          key={post.id}
          data-id={post.id}
          ref={(el) => (postRefs.current[index] = el)}
          style={{
            marginBottom: "50px",
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            minHeight: "100vh", // Full viewport height
            display: "flex",
            flexDirection: "column",
            justifyContent: "center" // Center content vertically
          }}
        >
          <h2>{post.title}</h2>
          <p>{post.description}</p>
          <img
            src={post.image}
            alt={post.title}
            style={{
              width: "100%",
              borderRadius: "10px",
              marginTop: "15px",
              maxHeight: "50vh", // Take half of viewport height
              objectFit: "cover"
            }}
          />
        <LikeAndDislike />
        </div>
      ))}
    </div>
  );
};

export default Homepage;