// Model/feedsession.ts
import mongoose, { Document, Schema } from "mongoose"

export interface ICategoryData {
    watchTime: number
    votes: number
}

export interface IFeedSession extends Document {
    user: mongoose.Types.ObjectId
    categoryData: Map<string, ICategoryData>
}

const FeedSessionSchema = new Schema<IFeedSession>({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    categoryData: {
        type: Map,
        of: new Schema<ICategoryData>({
            watchTime: { type: Number, default: 0 },
            votes: { type: Number, default: 0 },
        }),
        default: {}
    }
})

export default mongoose.model<IFeedSession>("FeedSession", FeedSessionSchema)