import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, ThumbsDown, Eye, Clock } from 'lucide-react'
import { cn } from '../lib/utils'

const ALL_POSTS = [
  { id: 1, username: 'photo_master', avatar: 'P', caption: 'Golden hour at the mountain peak. Nothing beats this view.', image: '/images/feed-1.jpg', tags: ['Photography', 'Landscape', 'Nature'], category: 'Photography', timeAgo: '2h' },
  { id: 2, username: 'digital_dreams', avatar: 'D', caption: 'New digital artwork exploring the concept of consciousness.', image: '/images/feed-7.jpg', tags: ['Digital Art', 'Abstract', 'Creative'], category: 'Digital Art', timeAgo: '3h' },
  { id: 3, username: 'illustrator_pro', avatar: 'I', caption: 'Character design sketches for my latest project.', image: '/images/feed-7.jpg', tags: ['Illustration', 'Art', 'Character Design'], category: 'Illustration', timeAgo: '4h' },
  { id: 4, username: 'arch_digest', avatar: 'A', caption: 'Modern architecture meets nature. This building breathes.', image: '/images/feed-5.jpg', tags: ['Architecture', 'Design', 'Modern'], category: 'Architecture', timeAgo: '5h' },
  { id: 5, username: 'fashion_forward', avatar: 'F', caption: 'Street style from Milan Fashion Week. Bold choices everywhere.', image: '/images/feed-2.jpg', tags: ['Fashion', 'Style', 'Milan'], category: 'Fashion', timeAgo: '2h' },
  { id: 6, username: 'fit_life', avatar: 'F', caption: 'Morning workout complete. Consistency is key!', image: '/images/feed-1.jpg', tags: ['Fitness', 'Workout', 'Health'], category: 'Fitness', timeAgo: '3h' },
  { id: 7, username: 'travel_tales', avatar: 'T', caption: 'Hidden gem in Bali. The locals were so welcoming.', image: '/images/feed-8.jpg', tags: ['Travel', 'Bali', 'Adventure'], category: 'Travel', timeAgo: '4h' },
  { id: 8, username: 'food_artistry', avatar: 'F', caption: 'Plating is an art. Today\'s creation: deconstructed tiramisu.', image: '/images/feed-3.jpg', tags: ['Food & Cooking', 'Culinary', 'Art'], category: 'Food & Cooking', timeAgo: '5h' },
  { id: 9, username: 'ai_researcher', avatar: 'A', caption: 'Fascinating developments in neural network visualization.', image: '/images/feed-7.jpg', tags: ['AI & Machine Learning', 'Tech', 'Neural Networks'], category: 'AI & Machine Learning', timeAgo: '1h' },
  { id: 10, username: 'dev_hub', avatar: 'D', caption: 'New React patterns that changed how I build UIs.', image: '/images/feed-5.jpg', tags: ['Web Development', 'React', 'Coding'], category: 'Web Development', timeAgo: '3h' },
  { id: 11, username: 'gadget_guru', avatar: 'G', caption: 'Unboxing the latest flagship smartphone. First impressions!', image: '/images/feed-2.jpg', tags: ['Gadgets', 'Tech', 'Review'], category: 'Gadgets', timeAgo: '4h' },
  { id: 12, username: 'gamer_zone', avatar: 'G', caption: 'This indie game deserves more attention. Absolutely stunning.', image: '/images/feed-7.jpg', tags: ['Gaming', 'Indie', 'Review'], category: 'Gaming', timeAgo: '5h' },
  { id: 13, username: 'movie_buff', avatar: 'M', caption: 'Just finished this masterpiece. The cinematography is incredible.', image: '/images/feed-2.jpg', tags: ['Movies & TV', 'Film', 'Cinema'], category: 'Movies & TV', timeAgo: '2h' },
  { id: 14, username: 'music_vibes', avatar: 'M', caption: 'New album drop! This artist never disappoints.', image: '/images/feed-1.jpg', tags: ['Music', 'Album', 'Vibes'], category: 'Music', timeAgo: '4h' },
  { id: 15, username: 'anime_world', avatar: 'A', caption: 'This season\'s anime lineup is absolutely stacked!', image: '/images/feed-7.jpg', tags: ['Anime & Manga', 'Animation', 'Japan'], category: 'Anime & Manga', timeAgo: '6h' },
  { id: 16, username: 'wild_capture', avatar: 'W', caption: 'Caught this majestic eagle mid-flight. Patience pays off!', image: '/images/feed-4.jpg', tags: ['Wildlife', 'Photography', 'Nature'], category: 'Wildlife', timeAgo: '3h' },
  { id: 17, username: 'cosmos_view', avatar: 'C', caption: 'Long exposure of the Milky Way from the Atacama Desert.', image: '/images/feed-6.jpg', tags: ['Astronomy', 'Space', 'Stars'], category: 'Astronomy', timeAgo: '5h' },
  { id: 18, username: 'ocean_soul', avatar: 'O', caption: 'Underwater paradise - the coral reefs are still thriving here.', image: '/images/feed-8.jpg', tags: ['Ocean Life', 'Marine', 'Conservation'], category: 'Ocean Life', timeAgo: '7h' },
  { id: 19, username: 'football_fanatic', avatar: 'F', caption: 'What a match! That last-minute goal was incredible.', image: '/images/feed-1.jpg', tags: ['Football', 'Sports', 'Match'], category: 'Football', timeAgo: '1h' },
  { id: 20, username: 'basketball_daily', avatar: 'B', caption: 'NBA playoffs getting intense. Who\'s your pick to win?', image: '/images/feed-2.jpg', tags: ['Basketball', 'NBA', 'Playoffs'], category: 'Basketball', timeAgo: '4h' },
  { id: 21, username: 'extreme_sports', avatar: 'E', caption: 'Cliff diving in Thailand. The adrenaline rush is unmatched!', image: '/images/feed-8.jpg', tags: ['Extreme Sports', 'Adventure', 'Thailand'], category: 'Extreme Sports', timeAgo: '6h' },
]

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
