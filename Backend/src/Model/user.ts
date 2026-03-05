
import mongoose, { Document, Schema } from "mongoose"

export interface IUser extends Document {
    name: string
    email: string
    password: string
    interests: string[]
    posts: mongoose.Types.ObjectId[]
    createdAt: Date
}

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    interests: [{ type: String }],
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    createdAt: { type: Date, default: Date.now }
})

export default mongoose.model<IUser>("User", UserSchema)