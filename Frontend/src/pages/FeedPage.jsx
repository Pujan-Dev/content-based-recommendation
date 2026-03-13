import { useState, useEffect, useRef} from "react";
import { useNavigate } from "react-router-dom";
import { getHome, logout } from "../config/backendconnect"
import { LogOut, Sparkles, Search, User, Plus } from "lucide-react";

import useAuthStore from "../lib/zustand";
import { PostCard } from "../Components/PostCard";



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
  const [likedPostIds, setLikedPostIds] = useState([])
  const [dislikedPostIds, setDislikedPostIds] = useState([])

useEffect(() => {
  const fetchPosts = async () => {
    try {
      const data = await getHome()

        if (data.success) {
    setPosts(data.data || []);
    setUser(data.user || null);
    setLikedPostIds(data.user?.likedPosts || [])
    setDislikedPostIds(data.user?.dislikedPosts || [])
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
              <button
                  onClick={() => navigate("/create-post")}
                  className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-primary text-primary-foreground transition-colors hover:brightness-110 btn-tap"
                  aria-label="Create post"
              >
                  <Plus className="h-3.5 w-3.5" />
              </button>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive btn-tap"
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
      {userCategories.length > 0 && (
        <div
          className="mx-auto max-w-lg px-4 pb-2 animate-fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Your interests:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {userCategories.slice(0, 8).map((interest) => (
              <span
                key={interest}
                className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
              >
                {interest}
              </span>
            ))}
            {userCategories.length > 8 && (
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
                +{userCategories.length - 8} more
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
    <PostCard 
    key={post._id} 
    post={post} 
    index={index}
    initialLiked={likedPostIds.includes(post._id?.toString())}
    initialDisliked={dislikedPostIds.includes(post._id?.toString())}
/>
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
