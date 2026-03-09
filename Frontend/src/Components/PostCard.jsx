import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {cn} from "../lib/utils";
import {
  Heart,
  ThumbsDown,
  
} from "lucide-react";

export function PostCard({ post, index }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const viewStartRef = useRef(Date.now());
  const cardRef = useRef(null);

  useEffect(() => {
    const savedLikes = JSON.parse(
      localStorage.getItem("postlens_likes") || "[]",
    );
    const savedDislikes = JSON.parse(
      localStorage.getItem("postlens_dislikes") || "[]",
    );
    if (savedLikes.includes(post.postId)) setLiked(true);
    if (savedDislikes.includes(post.postId)) setDisliked(true);
  }, [post.id]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            viewStartRef.current = Date.now();
          } else {
            const viewTime = Date.now() - viewStartRef.current;
            if (viewTime > 500) {
              const existing = JSON.parse(
                localStorage.getItem("postlens_view_times") || "{}",
              );
              existing[post.postId] = (existing[post.postId] || 0) + viewTime;
              localStorage.setItem(
                "postlens_view_times",
                JSON.stringify(existing),
              );
            }
          }
        });
      },
      { threshold: 0.5 },
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [post.id]);

  const handleLike = (e) => {
    e.stopPropagation();
    const newLiked = !liked;
    setLiked(newLiked);
    if (disliked) setDisliked(false);

    const savedLikes = JSON.parse(
      localStorage.getItem("postlens_likes") || "[]",
    );
    const savedDislikes = JSON.parse(
      localStorage.getItem("postlens_dislikes") || "[]",
    );

    if (newLiked) {
      savedLikes.push(post.postId);
      const idx = savedDislikes.indexOf(post.postId);
      if (idx > -1) savedDislikes.splice(idx, 1);
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    } else {
      const idx = savedLikes.indexOf(post.id);
      if (idx > -1) savedLikes.splice(idx, 1);
    }

    localStorage.setItem("postlens_likes", JSON.stringify(savedLikes));
    localStorage.setItem("postlens_dislikes", JSON.stringify(savedDislikes));
  };

  const handleDislike = (e) => {
    e.stopPropagation();
    const newDisliked = !disliked;
    setDisliked(newDisliked);
    if (liked) setLiked(false);

    const savedLikes = JSON.parse(
      localStorage.getItem("postlens_likes") || "[]",
    );
    const savedDislikes = JSON.parse(
      localStorage.getItem("postlens_dislikes") || "[]",
    );

    if (newDisliked) {
      savedDislikes.push(post.id);
      const idx = savedLikes.indexOf(post.id);
      if (idx > -1) savedLikes.splice(idx, 1);
    } else {
      const idx = savedDislikes.indexOf(post.id);
      if (idx > -1) savedDislikes.splice(idx, 1);
    }

    localStorage.setItem("postlens_likes", JSON.stringify(savedLikes));
    localStorage.setItem("postlens_dislikes", JSON.stringify(savedDislikes));
  };

  const handleDoubleClick = () => {
    if (!liked) {
      setLiked(true);
      if (disliked) setDisliked(false);
      const savedLikes = JSON.parse(
        localStorage.getItem("postlens_likes") || "[]",
      );
      if (!savedLikes.includes(post.id)) savedLikes.push(post.id);
      localStorage.setItem("postlens_likes", JSON.stringify(savedLikes));
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }
  };

  const handlePostClick = () => {
    navigate(`/post/${post.postId}`);
  };

  return (
    <article
      ref={cardRef}
      className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-sm animate-fade-in-up"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Post Header */}
<div className="flex items-center gap-3 px-4 py-3">
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
        {post.title?.[0]?.toUpperCase() || "P"}
    </div>
    <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">
            {post.subreddit}
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
</div>

      {/* Post Image */}
      <div
        className="relative cursor-pointer"
        onClick={handlePostClick}
        onDoubleClick={handleDoubleClick}
      >
        <img
          src={post.image}
          alt={post.body}
          className="aspect-square w-full object-cover"
          loading="lazy"
        />
        {/* Double-tap heart animation */}
        {showHeart && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Heart className="h-20 w-20 fill-primary-foreground text-primary-foreground drop-shadow-lg animate-scale-in" />
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center gap-4 px-4 py-3">
        <button
          onClick={handleLike}
          className="flex items-center gap-1.5 transition-colors btn-tap"
          aria-label={liked ? "Unlike post" : "Like post"}
        >
          <Heart
            className={cn(
              "h-6 w-6 transition-all duration-200",
              liked
                ? "fill-destructive text-destructive scale-110"
                : "text-foreground hover:text-destructive",
            )}
          />
        </button>

        <button
          onClick={handleDislike}
          className="flex items-center gap-1.5 transition-colors btn-tap"
          aria-label={disliked ? "Remove dislike" : "Dislike post"}
        >
          <ThumbsDown
            className={cn(
              "h-5 w-5 transition-all duration-200",
              disliked
                ? "fill-muted-foreground text-muted-foreground scale-110"
                : "text-foreground hover:text-muted-foreground",
            )}
          />
        </button>
      </div>

      {/* Caption */}
      <div className="px-4 pb-3">
        <p className="text-sm leading-relaxed text-foreground">
          <span className="mr-1.5 font-semibold">{post.subreddit}</span>
          {post.caption}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {post.category && (
    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
        {post.category}
    </span>
)}
        </div>
      </div>

      {/* Click to view prompt */}
      <button
        onClick={handlePostClick}
        className="w-full border-t border-border px-4 py-2.5 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
      >
        Tap to view full post
      </button>
    </article>
  );
}