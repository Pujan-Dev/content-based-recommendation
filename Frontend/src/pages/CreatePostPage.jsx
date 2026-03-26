import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Upload, X } from "lucide-react"
import { createPost } from "../config/backendconnect"
import { usePostsStore } from "../lib/zustand"

const CATEGORIES = [
    "gaming", "relationships", "career & jobs", "education", "finance",
    "technology", "entertainment", "mental health", "parenting & family",
    "health & fitness", "travel", "sports", "news & politics",
    "food & cooking", "science"
]

export default function CreatePostPage() {
    const navigate = useNavigate()
    const { addPost } = usePostsStore()
    const [title, setTitle] = useState("")
    const [body, setBody] = useState("")
    const [category, setCategory] = useState("")
    const [image, setImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImage(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        if (!title || !body || !category) {
            setError("Title, body and category are required")
            return
        }
        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append("title", title)
            formData.append("body", body)
            formData.append("category", category)
            formData.append("subreddit", `r/${category}`)
            formData.append("score", "0")
            formData.append("numComments", "0")
            formData.append("createdUtc", new Date().toISOString())
            formData.append("engagementScore", "0")
            formData.append("wordCount", body.split(" ").length.toString())
            formData.append("postLength", body.length.toString())
            formData.append("recencyWeight", "1.0")
            formData.append("hourPosted", new Date().getHours().toString())
            formData.append("dayOfWeek", new Date().getDay().toString())
            if (image) formData.append("image", image)

            const data = await createPost(formData)
            if (data.success) {
                // Add new post to the store (append to bottom)
                if (data.data) {
                    addPost(data.data)
                }
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

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
                    <button
                        onClick={() => navigate("/feed")}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary btn-tap"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-lg font-bold text-foreground">Create Post</h1>
                </div>
            </header>

            <div className="mx-auto max-w-lg px-4 py-6">
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                    {/* Title */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">Title</label>
                        <input
                            type="text"
                            placeholder="What's your post about?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="h-12 w-full rounded-xl border border-border bg-secondary/50 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Body */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">Body</label>
                        <textarea
                            placeholder="Share your thoughts..."
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

                    {/* Image Upload */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">Image <span className="text-muted-foreground">(optional)</span></label>
                        {imagePreview ? (
                            <div className="relative">
                                <img src={imagePreview} alt="Preview" className="w-full rounded-xl object-cover max-h-64" />
                                <button
                                    type="button"
                                    onClick={() => { setImage(null); setImagePreview(null) }}
                                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-foreground/60 text-background"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-secondary/30 py-8 transition-colors hover:bg-secondary/50">
                                <Upload className="h-6 w-6 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Click to upload image</span>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                        )}
                    </div>

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
                        ) : "Post"}
                    </button>
                </form>
            </div>
        </div>
    )
}