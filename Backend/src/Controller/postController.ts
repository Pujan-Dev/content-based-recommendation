// Controller/postController.ts
import type { Request, Response } from "express"
import mongoose from "mongoose"
import { v4 as uuidv4 } from "uuid"
import Post from "../Model/post.js"
import User from "../Model/user.js"
import cloudinary from "../Config/cloudinary.js"

// CREATE post
export const handleCreatePost = async (req: Request, res: Response): Promise<void> => {
    const { title, body, final_category } = req.body
    const image = req.file?.path

    if (!title || !body || !final_category) {
        res.status(400).json({ success: false, message: "Title, body and category are required" })
        return
    }

    try {
        const word_count = body.trim().split(/\s+/).length
        const post_length = body.length
        const recency_weight = Math.exp(-0.01 * 0)
        const hour_posted = new Date().getHours()
        const day_of_week = new Date().getDay()

        const post = await Post.create({
            author: new mongoose.Types.ObjectId(req.user?.userId),
            title,
            body,
            image: image ?? "",
            final_category,
            word_count,
            post_length,
            recency_weight,
            hour_posted,
            day_of_week,
            created_utc: new Date()
        })

        res.status(201).json({ success: true, post })
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message })
        } else {
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    }
}

// GET single post
export const handleGetPost = async (req: Request, res: Response): Promise<void> => {
    try {
        const post = await Post.findById(req.params.id).populate("author", "name username")
        if (!post) {
            res.status(404).json({ success: false, message: "Post not found" })
            return
        }
        res.status(200).json({ success: true, post })
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message })
        } else {
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    }
}

// PATCH post (only author can edit)
export const handleUpdatePost = async (req: Request, res: Response): Promise<void> => {
    const { title, body, final_category } = req.body
    const image = req.file?.path

    try {
        const post = await Post.findById(req.params.id)
        if (!post) {
            res.status(404).json({ success: false, message: "Post not found" })
            return
        }

        if (post.author.toString() !== req.user?.userId) {
            res.status(403).json({ success: false, message: "Not authorized to edit this post" })
            return
        }

        if (body) {
            post.word_count = body.trim().split(/\s+/).length
            post.post_length = body.length
        }

        post.title = title ?? post.title
        post.body = body ?? post.body
        post.image = image ?? post.image
        post.final_category = final_category ?? post.final_category
        await post.save()

        res.status(200).json({ success: true, post })
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message })
        } else {
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    }
}

// DELETE post (only author can delete)
export const handleDeletePost = async (req: Request, res: Response): Promise<void> => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) {
            res.status(404).json({ success: false, message: "Post not found" })
            return
        }

        if (post.author.toString() !== req.user?.userId) {
            res.status(403).json({ success: false, message: "Not authorized to delete this post" })
            return
        }

        if (post.image) {
            const publicId = post.image.split("/").pop()?.split(".")[0]
            if (publicId) await cloudinary.uploader.destroy(`posts/${publicId}`)
        }

        await post.deleteOne()

        res.status(200).json({ success: true, message: "Post deleted" })
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message })
        } else {
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    }
}

// UPVOTE post
export const handleUpvote = async (req: Request, res: Response): Promise<void> => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) {
            res.status(404).json({ success: false, message: "Post not found" })
            return
        }

        const userId = new mongoose.Types.ObjectId(req.user?.userId)
        const postId = post._id as mongoose.Types.ObjectId

        // check if already voted
        const existingInteraction = await User.findOne({
            _id: userId,
            "interaction_history.post_id": postId,
            "interaction_history.action": { $in: ["upvote", "downvote"] }
        })

        if (existingInteraction) {
            res.status(400).json({ success: false, message: "Already voted on this post" })
            return
        }

        // increment score
        post.score += 1
        post.upvotes += 1
        await post.save()

        // log interaction in user
        await User.findByIdAndUpdate(userId, {
            $push: {
                interaction_history: {
                    interaction_id: uuidv4(),
                    post_id: postId,
                    post_category: post.final_category,
                    action: "upvote",
                    dwell_time_seconds: 0,
                    timestamp: new Date(),
                    engagement_value: 1
                }
            },
            $inc: { [`category_preferences.${post.final_category}`]: 1 }
        })

        res.status(200).json({ success: true, score: post.score })
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message })
        } else {
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    }
}

// DOWNVOTE post
export const handleDownvote = async (req: Request, res: Response): Promise<void> => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) {
            res.status(404).json({ success: false, message: "Post not found" })
            return
        }

        const userId = new mongoose.Types.ObjectId(req.user?.userId)
        const postId = post._id as mongoose.Types.ObjectId

        // check if already voted
        const existingInteraction = await User.findOne({
            _id: userId,
            "interaction_history.post_id": postId,
            "interaction_history.action": { $in: ["upvote", "downvote"] }
        })

        if (existingInteraction) {
            res.status(400).json({ success: false, message: "Already voted on this post" })
            return
        }

        // decrement score
        post.score -= 1
        post.downvotes += 1
        await post.save()

        // log interaction in user
        await User.findByIdAndUpdate(userId, {
            $push: {
                interaction_history: {
                    interaction_id: uuidv4(),
                    post_id: postId,
                    post_category: post.final_category,
                    action: "downvote",
                    dwell_time_seconds: 0,
                    timestamp: new Date(),
                    engagement_value: 0
                }
            },
            $inc: { [`category_preferences.${post.final_category}`]: -1 }
        })

        res.status(200).json({ success: true, score: post.score })
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message })
        } else {
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    }
}