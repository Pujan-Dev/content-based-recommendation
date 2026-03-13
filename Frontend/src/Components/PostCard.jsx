import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { Heart, ThumbsDown, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { likePost, dislikePost, trackView, deletePost } from '../config/backendconnect'
import useAuthStore from '../lib/zustand'

export function PostCard({ post, index, initialLiked = false, initialDisliked = false }) {
  const navigate = useNavigate();
  const { authState } = useAuthStore()
  const [liked, setLiked] = useState(initialLiked)
  const [disliked, setDisliked] = useState(initialDisliked)
  const [showHeart, setShowHeart] = useState(false);
  const [showMenu, setShowMenu] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const viewStartRef = useRef(Date.now());
  const cardRef = useRef(null);
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            viewStartRef.current = Date.now();
          } else {
            const viewTime = Date.now() - viewStartRef.current;
            if (viewTime > 2000) {
              trackView(post.postId, post.category, Math.floor(viewTime / 1000)).catch(() => {})
            }
          }
        });
      },
      { threshold: 0.5 },
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [post.postId]);

  const handleLike = async (e) => {
    e.stopPropagation();
    const newLiked = !liked;
    setLiked(newLiked);
    if (disliked) setDisliked(false);
    if (newLiked) {
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }
    try { await likePost(post.postId) } catch (err) { console.log(err) }
  }

  const handleDislike = async (e) => {
    e.stopPropagation();
    const newDisliked = !disliked;
    setDisliked(newDisliked);
    if (liked) setLiked(false);
    try { await dislikePost(post.postId) } catch (err) { console.log(err) }
  }

  const handleDoubleClick = () => {
    if (!liked) {
      setLiked(true);
      if (disliked) setDisliked(false);
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
      likePost(post.postId).catch(err => console.log(err))
    }
  }

  const handlePostClick = () => {
    navigate(`/post/${post.postId}`, { state: { post } })
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    setShowMenu(false)
    navigate(`/edit-post/${post.postId}`, { state: { post } })
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    setShowMenu(false)
    if (!window.confirm("Delete this post?")) return
    setIsDeleting(true)
    try {
      await deletePost(post.postId)
      window.location.reload()
    } catch (err) {
      console.log(err)
      setIsDeleting(false)
    }
  }

  // Check if current user is the author
  const isAuthor = post.author?._id === authState?.userId

  return (
    <article
      ref={cardRef}
      className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-sm animate-fade-in-up"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Post Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {post.author?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            {post.author?.name || post.subreddit}
          </p>
          <p className="text-xs text-muted-foreground">
            {(() => {
              const diff = Date.now() - new Date(post.createdUtc).getTime()
              const hours = Math.floor(diff / 3600000)
              const days = Math.floor(diff / 86400000)
              if (days > 0) return `${days}d ago`
              if (hours > 0) return `${hours}h ago`
              return "Just now"
            })()}
          </p>
        </div>

        {/* Three dots menu — only for author */}
        {isAuthor && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary btn-tap"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 z-50 w-36 rounded-xl border border-border bg-card shadow-lg animate-fade-in">
                <button
                  onClick={handleEdit}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary rounded-t-xl"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10 rounded-b-xl"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Image */}
      {post.image && (
        <div className="relative cursor-pointer" onClick={handlePostClick} onDoubleClick={handleDoubleClick}>
          <img src={post.image} alt={post.title} className="aspect-square w-full object-cover" loading="lazy" />
          {showHeart && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <Heart className="h-20 w-20 fill-primary-foreground text-primary-foreground drop-shadow-lg animate-scale-in" />
            </div>
          )}
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center gap-4 px-4 py-3">
        <button onClick={handleLike} className="flex items-center gap-1.5 transition-colors btn-tap">
          <Heart className={cn("h-6 w-6 transition-all duration-200", liked ? "fill-destructive text-destructive scale-110" : "text-foreground hover:text-destructive")} />
          <span className={cn("text-xs font-medium", liked ? "text-destructive" : "text-muted-foreground")}>
            {post.likesCount + (liked && !initialLiked ? 1 : !liked && initialLiked ? -1 : 0)}
          </span>
        </button>
        <button onClick={handleDislike} className="flex items-center gap-1.5 transition-colors btn-tap">
          <ThumbsDown className={cn("h-5 w-5 transition-all duration-200", disliked ? "fill-muted-foreground text-muted-foreground scale-110" : "text-foreground hover:text-muted-foreground")} />
        </button>
      </div>

      {/* Caption */}
      <div className="px-4 pb-3">
        <p className="text-sm font-semibold text-foreground mb-1">{post.title}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {post.body?.split(' ').slice(0, 6).join(' ')}
          <span className="bg-linear-to-r from-muted-foreground to-transparent bg-clip-text text-transparent">
            {' '}{post.body?.split(' ').slice(6, 10).join(' ')}
          </span>
          <span className="text-muted-foreground/30">...</span>
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {post.category && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {post.category}
            </span>
          )}
        </div>
      </div>

      {/* Tap to view */}
      <button onClick={handlePostClick} className="w-full border-t border-border px-4 py-2.5 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground">
        Tap to view full post
      </button>
    </article>
  );
}