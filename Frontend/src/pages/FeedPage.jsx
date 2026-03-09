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
import { cn } from "../lib/utils";
import useAuthStore from "../lib/zustand";
import { PostCard } from "../Components/PostCard";

// const ALL_POSTS = [
//   // ART & DESIGN
//   {
//     id: 1,
//     username: "photo_master",
//     avatar: "P",
//     caption: "Golden hour at the mountain peak. Nothing beats this view.",
//     image: "/images/feed-1.jpg",
//     tags: ["Photography", "Landscape", "Nature"],
//     category: "Photography",
//     timeAgo: "2h",
//   },
//   {
//     id: 2,
//     username: "digital_dreams",
//     avatar: "D",
//     caption: "New digital artwork exploring the concept of consciousness.",
//     image: "/images/feed-7.jpg",
//     tags: ["Digital Art", "Abstract", "Creative"],
//     category: "Digital Art",
//     timeAgo: "3h",
//   },
//   {
//     id: 3,
//     username: "illustrator_pro",
//     avatar: "I",
//     caption: "Character design sketches for my latest project.",
//     image: "/images/feed-7.jpg",
//     tags: ["Illustration", "Art", "Character Design"],
//     category: "Illustration",
//     timeAgo: "4h",
//   },
//   {
//     id: 4,
//     username: "arch_digest",
//     avatar: "A",
//     caption: "Modern architecture meets nature. This building breathes.",
//     image: "/images/feed-5.jpg",
//     tags: ["Architecture", "Design", "Modern"],
//     category: "Architecture",
//     timeAgo: "5h",
//   },
//   // LIFESTYLE
//   {
//     id: 5,
//     username: "fashion_forward",
//     avatar: "F",
//     caption: "Street style from Milan Fashion Week. Bold choices everywhere.",
//     image: "/images/feed-2.jpg",
//     tags: ["Fashion", "Style", "Milan"],
//     category: "Fashion",
//     timeAgo: "2h",
//   },
//   {
//     id: 6,
//     username: "fit_life",
//     avatar: "F",
//     caption: "Morning workout complete. Consistency is key!",
//     image: "/images/feed-1.jpg",
//     tags: ["Fitness", "Workout", "Health"],
//     category: "Fitness",
//     timeAgo: "3h",
//   },
//   {
//     id: 7,
//     username: "travel_tales",
//     avatar: "T",
//     caption: "Hidden gem in Bali. The locals were so welcoming.",
//     image: "/images/feed-8.jpg",
//     tags: ["Travel", "Bali", "Adventure"],
//     category: "Travel",
//     timeAgo: "4h",
//   },
//   {
//     id: 8,
//     username: "food_artistry",
//     avatar: "F",
//     caption: "Plating is an art. Today's creation: deconstructed tiramisu.",
//     image: "/images/feed-3.jpg",
//     tags: ["Food & Cooking", "Culinary", "Art"],
//     category: "Food & Cooking",
//     timeAgo: "5h",
//   },
//   // TECHNOLOGY
//   {
//     id: 9,
//     username: "ai_researcher",
//     avatar: "A",
//     caption: "Fascinating developments in neural network visualization.",
//     image: "/images/feed-7.jpg",
//     tags: ["AI & Machine Learning", "Tech", "Neural Networks"],
//     category: "AI & Machine Learning",
//     timeAgo: "1h",
//   },
//   {
//     id: 10,
//     username: "dev_hub",
//     avatar: "D",
//     caption: "New React patterns that changed how I build UIs.",
//     image: "/images/feed-5.jpg",
//     tags: ["Web Development", "React", "Coding"],
//     category: "Web Development",
//     timeAgo: "3h",
//   },
//   {
//     id: 11,
//     username: "gadget_guru",
//     avatar: "G",
//     caption: "Unboxing the latest flagship smartphone. First impressions!",
//     image: "/images/feed-2.jpg",
//     tags: ["Gadgets", "Tech", "Review"],
//     category: "Gadgets",
//     timeAgo: "4h",
//   },
//   {
//     id: 12,
//     username: "gamer_zone",
//     avatar: "G",
//     caption: "This indie game deserves more attention. Absolutely stunning.",
//     image: "/images/feed-7.jpg",
//     tags: ["Gaming", "Indie", "Review"],
//     category: "Gaming",
//     timeAgo: "5h",
//   },
//   // ENTERTAINMENT
//   {
//     id: 13,
//     username: "movie_buff",
//     avatar: "M",
//     caption:
//       "Just finished this masterpiece. The cinematography is incredible.",
//     image: "/images/feed-2.jpg",
//     tags: ["Movies & TV", "Film", "Cinema"],
//     category: "Movies & TV",
//     timeAgo: "2h",
//   },
//   {
//     id: 14,
//     username: "music_vibes",
//     avatar: "M",
//     caption: "New album drop! This artist never disappoints.",
//     image: "/images/feed-1.jpg",
//     tags: ["Music", "Album", "Vibes"],
//     category: "Music",
//     timeAgo: "4h",
//   },
//   {
//     id: 15,
//     username: "anime_world",
//     avatar: "A",
//     caption: "This season's anime lineup is absolutely stacked!",
//     image: "/images/feed-7.jpg",
//     tags: ["Anime & Manga", "Animation", "Japan"],
//     category: "Anime & Manga",
//     timeAgo: "6h",
//   },
//   // NATURE & SCIENCE
//   {
//     id: 16,
//     username: "wild_capture",
//     avatar: "W",
//     caption: "Caught this majestic eagle mid-flight. Patience pays off!",
//     image: "/images/feed-4.jpg",
//     tags: ["Wildlife", "Photography", "Nature"],
//     category: "Wildlife",
//     timeAgo: "3h",
//   },
//   {
//     id: 17,
//     username: "cosmos_view",
//     avatar: "C",
//     caption: "Long exposure of the Milky Way from the Atacama Desert.",
//     image: "/images/feed-6.jpg",
//     tags: ["Astronomy", "Space", "Stars"],
//     category: "Astronomy",
//     timeAgo: "5h",
//   },
//   {
//     id: 18,
//     username: "ocean_soul",
//     avatar: "O",
//     caption: "Underwater paradise - the coral reefs are still thriving here.",
//     image: "/images/feed-8.jpg",
//     tags: ["Ocean Life", "Marine", "Conservation"],
//     category: "Ocean Life",
//     timeAgo: "7h",
//   },
//   // SPORTS
//   {
//     id: 19,
//     username: "football_fanatic",
//     avatar: "F",
//     caption: "What a match! That last-minute goal was incredible.",
//     image: "/images/feed-1.jpg",
//     tags: ["Football", "Sports", "Match"],
//     category: "Football",
//     timeAgo: "1h",
//   },
//   {
//     id: 20,
//     username: "basketball_daily",
//     avatar: "B",
//     caption: "NBA playoffs getting intense. Who's your pick to win?",
//     image: "/images/feed-2.jpg",
//     tags: ["Basketball", "NBA", "Playoffs"],
//     category: "Basketball",
//     timeAgo: "4h",
//   },
//   {
//     id: 21,
//     username: "extreme_sports",
//     avatar: "E",
//     caption: "Cliff diving in Thailand. The adrenaline rush is unmatched!",
//     image: "/images/feed-8.jpg",
//     tags: ["Extreme Sports", "Adventure", "Thailand"],
//     category: "Extreme Sports",
//     timeAgo: "6h",
//   },
// ];

export default function FeedPage() {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate();
  const { setAuthState, interests } = useAuthStore()

// useEffect(() => {
//     const fetchUser = async () => {
//         try {
//             const data = await getHome()
//             if (data.success && data.user) {
//                 setUserInterests(data.user.selectedCategory || [])
//             }
//         } catch {
//             setUserInterests([])
//         }
//     }
//     fetchUser()
// }, [])
useEffect(() => {
    const fetchPosts = async () => {
        try {
            const data = await getHome()
            if (data.success) {
                setPosts(data.data || [])
            }
        } catch (err) {
            console.log(err)
        } finally {
            setIsLoading(false)
        }
    }
    fetchPosts()
}, [])

  const userEmail = "User";

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
            <h1 className="text-lg font-bold text-foreground">PostLens</h1>
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
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search posts, tags, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-xl border border-border bg-secondary/50 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </header>

      {/* AI Banner */}
      <div
        className="mx-auto max-w-lg px-4 py-3 animate-fade-in"
        style={{ animationDelay: "0.3s" }}
      >
        <div className="flex items-center gap-2 rounded-xl border border-accent/20 bg-accent/5 px-4 py-2.5">
          <Sparkles className="h-4 w-4 flexshrink-0 text-accent" />
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-accent">AI Active</span> - Showing
            posts based on your interests.
          </p>
        </div>
      </div>

      {/* User Interests Tags */}
      {interests.length > 0 && (
        <div
          className="mx-auto max-w-lg px-4 pb-2 animate-fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Your interests:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {interests.slice(0, 8).map((interest) => (
              <span
                key={interest}
                className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
              >
                {interest}
              </span>
            ))}
            {interests.length > 8 && (
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
                +{interests.length - 8} more
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
              {`You're signed in as ${userEmail}. Are you sure you want to log out?`}
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
