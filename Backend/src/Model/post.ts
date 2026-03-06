
import mongoose, { Document, Schema } from "mongoose"
import { CATEGORIES } from "./user.js"

export interface IPost extends Document {
    author: mongoose.Types.ObjectId
    title: string
    body: string
    image: string
    subreddit: string
    final_category: string
    score: number
    num_comments: number
    upvotes: number
    downvotes: number
    engagement_score: number
    word_count: number
    post_length: number
    recency_weight: number
    hour_posted: number
    day_of_week: number
    created_utc: Date
}

const PostSchema = new Schema<IPost>({
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    image: { type: String, default: "" },
    subreddit: { type: String, default: "" },
    final_category: { type: String, enum: CATEGORIES, required: true },
    score: { type: Number, default: 0 },
    num_comments: { type: Number, default: 0 },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    engagement_score: { type: Number, default: 0 },
    word_count: { type: Number, default: 0 },
    post_length: { type: Number, default: 0 },
    recency_weight: { type: Number, default: 0 },
    hour_posted: { type: Number, default: 0 },
    day_of_week: { type: Number, default: 0 },
    created_utc: { type: Date, default: Date.now }
})

export default mongoose.model<IPost>("Post", PostSchema)