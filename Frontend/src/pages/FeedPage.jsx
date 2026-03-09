import { useState, useEffect, useRef} from "react";
import { useNavigate } from "react-router-dom";
import { getHome, logout } from "../config/backendconnect"
import {
  Heart,
  ThumbsDown,
  LogOut,
  Sparkles,
  Search,
  User,
  FlaskRound,
} from "lucide-react";

import useAuthStore from "../lib/zustand";
import { PostCard } from "../Components/PostCard";

const ALL_POSTS = [
  // GAMING
  {
    id: 1,
    username: "gamer_zone",
    avatar: "G",
    caption: "Clutched the final round in Valorant!",
    image: "/images/feed-1.jpg",
    tags: ["Valorant", "Esports"],
    category: "GAMING",
    timeAgo: "1h",
  },
  {
    id: 2,
    username: "battle_master",
    avatar: "B",
    caption: "Late night PUBG squad matches never get old.",
    image: "/images/feed-2.jpg",
    tags: ["PUBG", "Multiplayer"],
    category: "GAMING",
    timeAgo: "3h",
  },
  {
    id: 3,
    username: "mine_builder",
    avatar: "M",
    caption: "Finished building my Minecraft castle!",
    image: "/images/feed-3.jpg",
    tags: ["Minecraft", "Creative"],
    category: "GAMING",
    timeAgo: "5h",
  },

  // RELATIONSHIPS
  {
    id: 4,
    username: "life_advice",
    avatar: "L",
    caption: "Communication is the key to healthy relationships.",
    image: "/images/feed-4.jpg",
    tags: ["Relationship Advice", "Trust"],
    category: "RELATIONSHIPS",
    timeAgo: "2h",
  },
  {
    id: 5,
    username: "dating_diary",
    avatar: "D",
    caption: "First date tips that actually work.",
    image: "/images/feed-5.jpg",
    tags: ["Dating", "Love"],
    category: "RELATIONSHIPS",
    timeAgo: "4h",
  },

  // CAREER
  {
    id: 6,
    username: "career_guru",
    avatar: "C",
    caption: "Top resume tips to stand out in job applications.",
    image: "/images/feed-6.jpg",
    tags: ["Resume Writing", "Job Search"],
    category: "CAREER & JOBS",
    timeAgo: "2h",
  },
  {
    id: 7,
    username: "work_success",
    avatar: "W",
    caption: "Networking can open unexpected career doors.",
    image: "/images/feed-7.jpg",
    tags: ["Networking", "Career Growth"],
    category: "CAREER & JOBS",
    timeAgo: "5h",
  },

  // EDUCATION
  {
    id: 8,
    username: "study_master",
    avatar: "S",
    caption: "Pomodoro technique improved my exam preparation.",
    image: "/images/feed-1.jpg",
    tags: ["Study Tips", "Exams"],
    category: "EDUCATION",
    timeAgo: "1h",
  },
  {
    id: 9,
    username: "uni_life",
    avatar: "U",
    caption: "Balancing assignments and social life in college.",
    image: "/images/feed-2.jpg",
    tags: ["College", "Assignments"],
    category: "EDUCATION",
    timeAgo: "3h",
  },

  // FINANCE
  {
    id: 10,
    username: "money_smart",
    avatar: "M",
    caption: "Simple budgeting rule: 50/30/20.",
    image: "/images/feed-3.jpg",
    tags: ["Budgeting", "Saving Money"],
    category: "FINANCE",
    timeAgo: "2h",
  },
  {
    id: 11,
    username: "crypto_watch",
    avatar: "C",
    caption: "Bitcoin market volatility explained.",
    image: "/images/feed-4.jpg",
    tags: ["Cryptocurrency", "Investing"],
    category: "FINANCE",
    timeAgo: "4h",
  },

  // TECHNOLOGY
  {
    id: 12,
    username: "dev_hub",
    avatar: "D",
    caption: "React hooks changed the way we build UIs.",
    image: "/images/feed-5.jpg",
    tags: ["Web Development", "JavaScript"],
    category: "TECHNOLOGY",
    timeAgo: "1h",
  },
  {
    id: 13,
    username: "ai_future",
    avatar: "A",
    caption: "Machine learning models are transforming industries.",
    image: "/images/feed-6.jpg",
    tags: ["AI & Machine Learning"],
    category: "TECHNOLOGY",
    timeAgo: "3h",
  },
  {
    id: 14,
    username: "cyber_guard",
    avatar: "C",
    caption: "Cybersecurity tips everyone should know.",
    image: "/images/feed-7.jpg",
    tags: ["Cybersecurity"],
    category: "TECHNOLOGY",
    timeAgo: "5h",
  },

  // ENTERTAINMENT
  {
    id: 15,
    username: "movie_buff",
    avatar: "M",
    caption: "Just finished watching this amazing Netflix series!",
    image: "/images/feed-1.jpg",
    tags: ["Netflix", "TV Series"],
    category: "ENTERTAINMENT",
    timeAgo: "2h",
  },
  {
    id: 16,
    username: "music_vibes",
    avatar: "M",
    caption: "This new album is on repeat all day.",
    image: "/images/feed-2.jpg",
    tags: ["Music"],
    category: "ENTERTAINMENT",
    timeAgo: "4h",
  },

  // MENTAL HEALTH
  {
    id: 17,
    username: "mind_balance",
    avatar: "M",
    caption: "Meditation for 10 minutes daily improves focus.",
    image: "/images/feed-3.jpg",
    tags: ["Meditation", "Mindfulness"],
    category: "MENTAL HEALTH",
    timeAgo: "1h",
  },
  {
    id: 18,
    username: "stress_free",
    avatar: "S",
    caption: "Managing stress with simple breathing techniques.",
    image: "/images/feed-4.jpg",
    tags: ["Stress Management"],
    category: "MENTAL HEALTH",
    timeAgo: "3h",
  },

  // HEALTH
  {
    id: 19,
    username: "fit_life",
    avatar: "F",
    caption: "Morning run done. Feeling energized!",
    image: "/images/feed-5.jpg",
    tags: ["Running", "Workout"],
    category: "HEALTH & FITNESS",
    timeAgo: "2h",
  },
  {
    id: 20,
    username: "gym_pro",
    avatar: "G",
    caption: "Strength training builds both body and discipline.",
    image: "/images/feed-6.jpg",
    tags: ["Gym Training"],
    category: "HEALTH & FITNESS",
    timeAgo: "4h",
  },

  // TRAVEL
  {
    id: 21,
    username: "travel_tales",
    avatar: "T",
    caption: "Sunset view from Bali beaches.",
    image: "/images/feed-7.jpg",
    tags: ["Beaches", "Vacation"],
    category: "TRAVEL",
    timeAgo: "3h",
  },
  {
    id: 22,
    username: "mountain_explorer",
    avatar: "M",
    caption: "Hiking the Himalayan trails was breathtaking.",
    image: "/images/feed-8.jpg",
    tags: ["Mountains", "Adventure"],
    category: "TRAVEL",
    timeAgo: "5h",
  },

  // SPORTS
  {
    id: 23,
    username: "football_fan",
    avatar: "F",
    caption: "That last-minute goal was unbelievable!",
    image: "/images/feed-1.jpg",
    tags: ["Football"],
    category: "SPORTS",
    timeAgo: "1h",
  },
  {
    id: 24,
    username: "nba_daily",
    avatar: "N",
    caption: "NBA playoffs heating up!",
    image: "/images/feed-2.jpg",
    tags: ["Basketball"],
    category: "SPORTS",
    timeAgo: "3h",
  },

  // NEWS
  {
    id: 25,
    username: "world_news",
    avatar: "W",
    caption: "Global leaders meet to discuss climate change.",
    image: "/images/feed-3.jpg",
    tags: ["World News"],
    category: "NEWS & POLITICS",
    timeAgo: "2h",
  },
  {
    id: 26,
    username: "policy_watch",
    avatar: "P",
    caption: "New government policy explained.",
    image: "/images/feed-4.jpg",
    tags: ["Government Policy"],
    category: "NEWS & POLITICS",
    timeAgo: "4h",
  },

  // FOOD
  {
    id: 27,
    username: "chef_daily",
    avatar: "C",
    caption: "Homemade pasta recipe for beginners.",
    image: "/images/feed-5.jpg",
    tags: ["Recipes", "Cooking"],
    category: "FOOD & COOKING",
    timeAgo: "2h",
  },
  {
    id: 28,
    username: "dessert_lover",
    avatar: "D",
    caption: "Chocolate lava cake fresh from the oven!",
    image: "/images/feed-6.jpg",
    tags: ["Desserts"],
    category: "FOOD & COOKING",
    timeAgo: "5h",
  },

  // SCIENCE
  {
    id: 29,
    username: "space_view",
    avatar: "S",
    caption: "New discoveries from the James Webb telescope.",
    image: "/images/feed-7.jpg",
    tags: ["Astronomy", "Space"],
    category: "SCIENCE",
    timeAgo: "3h",
  },
  {
    id: 30,
    username: "bio_lab",
    avatar: "B",
    caption: "Breakthrough in genetic research.",
    image: "/images/feed-8.jpg",
    tags: ["Biology", "Genetics"],
    category: "SCIENCE",
    timeAgo: "6h",
  },
];

export default function FeedPage() {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState("")
  const navigate = useNavigate();
  const { setAuthState } = useAuthStore()
  const [userCategories, setUserCategories] = useState([]);
  const [user, setUser] = useState(null);

useEffect(() => {
  const fetchPosts = async () => {
    try {
      const data = await getHome()

        if (data.success) {
    setPosts(data.data || []);
    setUser(data.user || null);
    setUserEmail(data.user?.email || "")
    setUserCategories(data.user?.selectedCategory || []);
}

    } catch (err) {
      console.log(err)
    } finally {
      setIsLoading(false)
    }
  }

  fetchPosts()
}, [])
// useEffect(() => {
//     const fetchPosts = async () => {
//         try {
//             const data = await getHome()
//             if (data.success) {
//                 setPosts(data.data || [])
//             }
//         } catch (err) {
//             console.log(err)
//         } finally {
//             setIsLoading(false)
//         }
//     }
//     fetchPosts()
// }, [])

  const handleLogout = async () => {
    try {
        await logout()
    } catch (err) {
        console.log(err)
    }
    setAuthState({ isLoggedIn: false, hasInterests: false })
    navigate("/")
} 
  const filteredPosts = posts.filter((post) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
        post.title?.toLowerCase().includes(q) ||
        post.body?.toLowerCase().includes(q) ||
        post.category?.toLowerCase().includes(q)
    )
})

  // const filteredPosts = ALL_POSTS.filter((post) => {
  //   const matchesInterest =
  //     userInterests.length === 0 ||
  //     userInterests.some(
  //       (interest) =>
  //         post.category.toLowerCase() === interest.toLowerCase() ||
  //         post.tags.some((tag) =>
  //           tag.toLowerCase().includes(interest.toLowerCase()),
  //         ),
  //     );
  //   return matchesInterest;
  // })
  //   .filter((post) => {
  //     if (!searchQuery) return true;
  //     const q = searchQuery.toLowerCase();
  //     return (
  //       post.caption.toLowerCase().includes(q) ||
  //       post.username.toLowerCase().includes(q) ||
  //       post.tags.some((tag) => tag.toLowerCase().includes(q))
  //     );
  //   })
  //   .sort((a, b) => {
  //     const aExactMatch = userInterests.some(
  //       (i) => a.category.toLowerCase() === i.toLowerCase(),
  //     );
  //     const bExactMatch = userInterests.some(
  //       (i) => b.category.toLowerCase() === i.toLowerCase(),
  //     );
  //     if (aExactMatch && !bExactMatch) return -1;
  //     if (!aExactMatch && bExactMatch) return 1;
  //     return 0;
  //   });

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl animate-fade-in-down">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold  text-foreground">GazeFlow</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive btn-tap"
              aria-label="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mx-auto max-w-lg px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-1 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground " />
             <input
              type="text"
              placeholder="Search posts, tags, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-xl border border-border bg-secondary/50 pl-10 pr-4 text-sm text-foreground text-center placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
/>
          </div>
        </div>
      </header>

     

      {/* User Interests Tags */}
      {userInterests.length > 0 && (
        <div
          className="mx-auto max-w-lg px-4 pb-2 animate-fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Your interests:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {userInterests.slice(0, 8).map((interest) => (
              <span
                key={interest}
                className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
              >
                {interest}
              </span>
            ))}
            {userInterests.length > 8 && (
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
                +{userInterests.length - 8} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="mx-auto flex max-w-lg flex-col items-center gap-5 px-4 pb-20 pt-2">
        {isLoading ? (
    <div className="py-20 text-center text-muted-foreground animate-fade-in">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
    </div>
    ) :  filteredPosts.length === 0 ?(
    <div className="py-20 text-center text-muted-foreground animate-fade-in">
        <p className="text-sm">No posts yet. Check back later!</p>
    </div>
    ) : (
    filteredPosts.map((post, index) => (
    <PostCard key={post._id} post={post} index={index} />
))
  )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="mx-4 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl animate-scale-in"
          >
            <h3 className="mb-2 text-lg font-bold text-foreground">Log out?</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              {`You're signed in as ${userEmail || "User"}. Are you sure you want to log out?`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-xl border border-border bg-secondary py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80 btn-tap"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 rounded-xl bg-destructive py-2.5 text-sm font-medium text-card transition-colors hover:brightness-110 btn-tap"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
