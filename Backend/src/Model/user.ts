import mongoose, { Document, Schema } from "mongoose"

const CATEGORIES = [
    "gaming", "relationships", "career_jobs", "education", "finance",
    "technology", "entertainment", "mental_health", "parenting_family",
    "health_fitness", "travel", "sports", "news_politics", "food_cooking", "science"
]

export interface IInteraction {
    interaction_id: string
    post_id: mongoose.Types.ObjectId
    post_category: string
    action: "view" | "upvote" | "downvote"
    dwell_time_seconds: number
    timestamp: Date
    engagement_value: number
}

export interface IUser extends Document {
    name: string
    email: string
    username: string
    password: string
    interests: string[]
    interaction_history: IInteraction[]
    category_preferences: Map<string, number>
    createdAt: Date
}

const InteractionSchema = new Schema<IInteraction>({
    interaction_id: { type: String, required: true },
    post_id: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    post_category: { type: String, required: true },
    action: { type: String, enum: ["view", "upvote", "downvote"], required: true },
    dwell_time_seconds: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now },
    engagement_value: { type: Number, default: 0 }
})

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    interests: [{ type: String, enum: CATEGORIES }],
    interaction_history: [InteractionSchema],
    category_preferences: { type: Map, of: Number, default: {} },
    createdAt: { type: Date, default: Date.now }
})

export { CATEGORIES }
export default mongoose.model<IUser>("User", UserSchema)