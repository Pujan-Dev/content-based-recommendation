import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, ThumbsDown, Eye, Clock } from 'lucide-react'
import { cn } from '../lib/utils'

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

export default function PostDetailPage() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [viewTime, setViewTime] = useState(0)
  const viewStartRef = useRef(Date.now())
  const timerRef = useRef(null)

  const post = ALL_POSTS.find((p) => p.id === parseInt(postId))

  useEffect(() => {
    if (!post) return

    const savedLikes = JSON.parse(localStorage.getItem('postlens_likes') || '[]')
    const savedDislikes = JSON.parse(localStorage.getItem('postlens_dislikes') || '[]')
    if (savedLikes.includes(post.id)) setLiked(true)
    if (savedDislikes.includes(post.id)) setDisliked(true)
  }, [post])

  useEffect(() => {
    if (!post) return

    viewStartRef.current = Date.now()

    timerRef.current = setInterval(() => {
      setViewTime(Math.floor((Date.now() - viewStartRef.current) / 1000))
    }, 1000)

    return () => {
      clearInterval(timerRef.current)
      const totalViewTime = Date.now() - viewStartRef.current
      const existing = JSON.parse(localStorage.getItem('postlens_view_times') || '{}')
      existing[post.id] = (existing[post.id] || 0) + totalViewTime
      localStorage.setItem('postlens_view_times', JSON.stringify(existing))
    }
  }, [post])

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Post not found</p>
      </div>
    )
  }

  const handleLike = () => {
    const newLiked = !liked
    setLiked(newLiked)
    if (disliked) setDisliked(false)

    const savedLikes = JSON.parse(localStorage.getItem('postlens_likes') || '[]')
    const savedDislikes = JSON.parse(localStorage.getItem('postlens_dislikes') || '[]')

    if (newLiked) {
      if (!savedLikes.includes(post.id)) savedLikes.push(post.id)
      const idx = savedDislikes.indexOf(post.id)
      if (idx > -1) savedDislikes.splice(idx, 1)
    } else {
      const idx = savedLikes.indexOf(post.id)
      if (idx > -1) savedLikes.splice(idx, 1)
    }

    localStorage.setItem('postlens_likes', JSON.stringify(savedLikes))
    localStorage.setItem('postlens_dislikes', JSON.stringify(savedDislikes))
  }

  const handleDislike = () => {
    const newDisliked = !disliked
    setDisliked(newDisliked)
    if (liked) setLiked(false)

    const savedLikes = JSON.parse(localStorage.getItem('postlens_likes') || '[]')
    const savedDislikes = JSON.parse(localStorage.getItem('postlens_dislikes') || '[]')

    if (newDisliked) {
      if (!savedDislikes.includes(post.id)) savedDislikes.push(post.id)
      const idx = savedLikes.indexOf(post.id)
      if (idx > -1) savedLikes.splice(idx, 1)
    } else {
      const idx = savedDislikes.indexOf(post.id)
      if (idx > -1) savedDislikes.splice(idx, 1)
    }

    localStorage.setItem('postlens_likes', JSON.stringify(savedLikes))
    localStorage.setItem('postlens_dislikes', JSON.stringify(savedDislikes))
  }

  const formatViewTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return m > 0 ? `${m}m ${s}s` : `${s}s`
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl animate-fade-in-down">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate('/feed')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary btn-tap"
            aria-label="Go back to feed"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {post.avatar}
            </div>
            <span className="font-semibold text-foreground">{post.username}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-lg">
        {/* Full Image */}
        <div className="animate-scale-in">
          <img
            src={post.image}
            alt={post.caption}
            className="w-full object-cover"
          />
        </div>

        {/* Actions */}
        <div className="px-4 py-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-5">
            <button
              onClick={handleLike}
              className="flex items-center gap-2 btn-tap"
              aria-label={liked ? 'Unlike post' : 'Like post'}
            >
              <Heart
                className={cn(
                  'h-7 w-7 transition-all duration-200',
                  liked
                    ? 'fill-destructive text-destructive'
                    : 'text-foreground hover:text-destructive'
                )}
              />
              <span className={cn('text-sm font-medium', liked ? 'text-destructive' : 'text-foreground')}>
                {liked ? 'Liked' : 'Like'}
              </span>
            </button>

            <button
              onClick={handleDislike}
              className="flex items-center gap-2 btn-tap"
              aria-label={disliked ? 'Remove dislike' : 'Dislike post'}
            >
              <ThumbsDown
                className={cn(
                  'h-6 w-6 transition-all duration-200',
                  disliked
                    ? 'fill-muted-foreground text-muted-foreground'
                    : 'text-foreground hover:text-muted-foreground'
                )}
              />
              <span className={cn('text-sm font-medium', disliked ? 'text-muted-foreground' : 'text-foreground')}>
                {disliked ? 'Disliked' : 'Dislike'}
              </span>
            </button>
          </div>
        </div>

        {/* Caption & Details */}
        <div className="border-t border-border px-4 py-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <p className="mb-3 text-sm leading-relaxed text-foreground">
            <span className="mr-2 font-bold">{post.username}</span>
            {post.caption}
          </p>

          {/* Tags */}
          <div className="mb-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Time info */}
          <p className="text-xs text-muted-foreground">Posted {post.timeAgo} ago</p>
        </div>

        {/* AI Tracking Indicator */}
        <div className="mx-4 mb-6 rounded-xl border border-border bg-secondary/50 p-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="mb-2 flex items-center gap-2">
            <Eye className="h-4 w-4 text-accent" />
            <span className="text-xs font-semibold text-foreground">Behavior Tracking Active</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Viewing for: <span className="font-mono font-semibold text-primary">{formatViewTime(viewTime)}</span>
              </span>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            This data helps us recommend similar content you might enjoy.
          </p>
        </div>
      </div>
    </div>
  )
}
