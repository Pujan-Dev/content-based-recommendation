
import mongoose, { Document, Schema } from "mongoose"

export interface IPost extends Document {
    author: mongoose.Types.ObjectId
    caption: string
    image: string
    publicId: string
    category: string
    upvotes: number
    downvotes: number
    upvotedBy: mongoose.Types.Array<mongoose.Types.ObjectId>
    downvotedBy: mongoose.Types.Array<mongoose.Types.ObjectId>
    createdAt: Date
}

const PostSchema = new Schema<IPost>({
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    caption: { type: String, required: true },
    image: { type: String },
    publicId: { type: String, default: "" },
    category: { type: String, required: true },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    downvotedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now }
})

export default mongoose.model<IPost>("Post", PostSchema)