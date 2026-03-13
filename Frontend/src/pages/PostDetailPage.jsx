import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Heart, ThumbsDown, Eye, Clock } from 'lucide-react'
import { cn } from '../lib/utils'
import { likePost, dislikePost, trackView } from '../config/backendconnect'

export default function PostDetailPage() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [viewTime, setViewTime] = useState(0)
  const viewStartRef = useRef(Date.now())
  const timerRef = useRef(null)

  const post = location.state?.post

  useEffect(() => {
    if (!post) return
    viewStartRef.current = Date.now()
    timerRef.current = setInterval(() => {
      setViewTime(Math.floor((Date.now() - viewStartRef.current) / 1000))
    }, 1000)

    return () => {
      clearInterval(timerRef.current)
      const totalViewTime = Math.floor((Date.now() - viewStartRef.current) / 1000)
      if (totalViewTime > 2) {
        trackView(post.postId, post.category, totalViewTime).catch(() => {})
      }
    }
  }, [post])

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Post not found</p>
      </div>
    )
  }

  const handleLike = async () => {
    const newLiked = !liked
    setLiked(newLiked)
    if (disliked) setDisliked(false)
    try {
      await likePost(post.postId)
    } catch (err) { console.log(err) }
  }

  const handleDislike = async () => {
    const newDisliked = !disliked
    setDisliked(newDisliked)
    if (liked) setLiked(false)
    try {
      await dislikePost(post.postId)
    } catch (err) { console.log(err) }
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
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {post.author?.name?.[0]?.toUpperCase() || post.title?.[0]?.toUpperCase() || "P"}
            </div>
            <span className="font-semibold text-foreground">{post.author?.name || post.subreddit}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-lg">
        {/* Image */}
        {post.image && (
          <div className="animate-scale-in">
            <img src={post.image} alt={post.title} className="w-full object-cover" />
          </div>
        )}

        {/* Actions */}
        <div className="px-4 py-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-5">
            <button onClick={handleLike} className="flex items-center gap-2 btn-tap">
              <Heart className={cn('h-7 w-7 transition-all duration-200', liked ? 'fill-destructive text-destructive' : 'text-foreground hover:text-destructive')} />
              <span className={cn('text-sm font-medium', liked ? 'text-destructive' : 'text-foreground')}>
                {liked ? 'Liked' : 'Like'}
              </span>
            </button>
            <button onClick={handleDislike} className="flex items-center gap-2 btn-tap">
              <ThumbsDown className={cn('h-6 w-6 transition-all duration-200', disliked ? 'fill-muted-foreground text-muted-foreground' : 'text-foreground hover:text-muted-foreground')} />
              <span className={cn('text-sm font-medium', disliked ? 'text-muted-foreground' : 'text-foreground')}>
                {disliked ? 'Disliked' : 'Dislike'}
              </span>
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="border-t border-border px-4 py-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <p className="mb-2 text-base font-bold text-foreground">{post.title}</p>
          <p className="mb-3 text-sm leading-relaxed text-foreground">{post.body}</p>
          <div className="mb-3">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {post.category}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {post.subreddit} · {new Date(post.createdUtc).toLocaleDateString()}
          </p>
        </div>

        {/* AI Tracking */}
        <div className="mx-4 mb-6 rounded-xl border border-border bg-secondary/50 p-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="mb-2 flex items-center gap-2">
            <Eye className="h-4 w-4 text-accent" />
            <span className="text-xs font-semibold text-foreground">Behavior Tracking Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Viewing for: <span className="font-mono font-semibold text-primary">{formatViewTime(viewTime)}</span>
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">This data helps us recommend similar content.</p>
        </div>
      </div>
    </div>
  )
}
