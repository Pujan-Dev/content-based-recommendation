import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { updatePost } from "../config/backendconnect"

const CATEGORIES = [
    "gaming", "relationships", "career & jobs", "education", "finance",
    "technology", "entertainment", "mental health", "parenting & family",
    "health & fitness", "travel", "sports", "news & politics",
    "food & cooking", "science"
]

export default function EditPostPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const post = location.state?.post

    const [title, setTitle] = useState(post?.title || "")
    const [body, setBody] = useState(post?.body || "")
    const [category, setCategory] = useState(post?.category || "")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        if (!title || !body || !category) {
            setError("Title, body and category are required")
            return
        }
        setIsLoading(true)
        try {
            const data = await updatePost(post.postId, { title, body, category })
            if (data.success) {
                navigate("/feed")
            } else {
                setError(data.message)
            }
        } catch (err) {
            setError("Something went wrong. Try again!")
        } finally {
            setIsLoading(false)
        }
    }

    if (!post) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <p className="text-muted-foreground">Post not found.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary btn-tap"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-lg font-bold text-foreground">Edit Post</h1>
                </div>
            </header>

            <div className="mx-auto max-w-lg px-4 py-6">
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                    {/* Title */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="h-12 w-full rounded-xl border border-border bg-secondary/50 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Body */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">Body</label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={5}
                            className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="h-12 w-full rounded-xl border border-border bg-secondary/50 px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="">Select a category</option>
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    {/* Note about image */}
                    {post.image && (
                        <div className="rounded-xl border border-border bg-secondary/30 px-4 py-3">
                            <p className="text-xs text-muted-foreground">Image cannot be changed when editing a post.</p>
                            <img src={post.image} alt="current" className="mt-2 w-full rounded-lg object-cover max-h-48" />
                        </div>
                    )}

                    {/* Error */}
                    {error && <p className="text-sm text-destructive">{error}</p>}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex h-12 w-full items-center justify-center rounded-xl bg-primary font-medium text-primary-foreground shadow-md shadow-primary/25 transition-all hover:brightness-110 disabled:opacity-70 btn-tap"
                    >
                        {isLoading ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        ) : "Save Changes"}
                    </button>
                </form>
            </div>
        </div>
    )
}