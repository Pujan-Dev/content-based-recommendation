import mongoose, { Document, Schema } from "mongoose";

interface IViewHistory {
  postId: mongoose.Types.ObjectId;
  category: string;
  dwellTime: number;
  viewedAt: Date;
}

interface IViewHistory {
  postId: mongoose.Types.ObjectId
  category: string
    dwellTime: number 
  viewedAt: Date
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  selectedCategory: string | null;
  categoryScore: Map<string, number>;
  viewHistory: IViewHistory[];
  likedPosts: mongoose.Types.ObjectId[];
  dislikedPosts: mongoose.Types.ObjectId[];
}

const viewHistorySchema = new Schema<IViewHistory>(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    category: { type: String, required: true },
    dwellTime: { type: Number, default: 0 },
    viewedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  selectedCategory: { type: String, default: null },
  categoryScore: { type: Map, of: Number, default: {} },
  viewHistory: { type: [viewHistorySchema], default: [] },
  likedPosts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  dislikedPosts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
});

export default mongoose.model<IUser>("User", userSchema);
