import mongoose, { Document, Schema } from "mongoose";

export interface IPost extends Document {
  postId: string;
  author: mongoose.Types.ObjectId;
  title: string;
  body: string;
  subreddit: string;
  category: string;
  score: number;
  numComments: number;
  createdUtc: Date;
  engagementScore: number;
  wordCount: number;
  postLength: number;
  recencyWeight: number;
  hourPosted: number;
  dayOfWeek: number;
  embedding?: number[];
  image: string | null;
  likes: mongoose.Types.ObjectId[];
  dislikes: mongoose.Types.ObjectId[];
  likesCount: number;
  dislikesCount: number;
}

const postSchema = new Schema<IPost>({
  postId: { type: String, required: true, unique: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  subreddit: { type: String, required: true },
  category: { type: String, required: true },
  score: { type: Number, default: 0 },
  numComments: { type: Number, default: 0 },
  createdUtc: { type: Date, required: true },
  engagementScore: { type: Number, default: 0 },
  wordCount: { type: Number, default: 0 },
  postLength: { type: Number, default: 0 },
  recencyWeight: { type: Number, default: 0 },
  hourPosted: { type: Number, default: 0 },
  dayOfWeek: { type: Number, default: 0 },
  embedding: { type: [Number], default: undefined },
  image: { type: String, default: null },
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  dislikes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  likesCount: { type: Number, default: 0 },
  dislikesCount: { type: Number, default: 0 },
});

export default mongoose.model<IPost>("Post", postSchema);
