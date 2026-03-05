// Controller/postController.ts
import type { Request, Response } from "express"
import mongoose from "mongoose"
import Post from "../Model/post.js"
import User from "../Model/user.js"
import FeedSession from "../Model/feedsession.js"

// CREATE post
export const handleCreatePost = async (req: Request, res: Response): Promise<void> => {
    const { caption, category } = req.body
    const image = req.file?.path  // cloudinary URL from multer

    if (!caption || !category) {
        res.status(400).json({ success: false, message: "Caption and category are required" })
        return
    }

    try {
        const post = await Post.create({
            author: new mongoose.Types.ObjectId(req.user?.userId),
            caption,
            image: image ?? "", 
            category
        })

        // add post to user's posts array
        await User.findByIdAndUpdate(
            new mongoose.Types.ObjectId(req.user?.userId),
            { $push: { posts: post._id } }
        )

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
        const post = await Post.findById(req.params.id).populate("author", "name")
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
    const { caption, category } = req.body
    const image = req.file?.path  // new image if provided

    try {
        const post = await Post.findById(req.params.id)
        if (!post) {
            res.status(404).json({ success: false, message: "Post not found" })
            return
        }

        // check if user is the author
        if (post.author.toString() !== req.user?.userId) {
            res.status(403).json({ success: false, message: "Not authorized to edit this post" })
            return
        }

        post.caption = caption ?? post.caption
        post.image = image ?? post.image
        post.category = category ?? post.category
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

        await post.deleteOne()

        // remove post from user's posts array
        await User.findByIdAndUpdate(
            new mongoose.Types.ObjectId(req.user?.userId),
            { $pull: { posts: post._id } }
        )

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

        // check if already upvoted
        if (post.upvotedBy.includes(userId)) {
            res.status(400).json({ success: false, message: "Already upvoted" })
            return
        }

        // remove from downvotes if exists
        if (post.downvotedBy.includes(userId)) {
            post.downvotedBy.pull(userId)
            post.downvotes -= 1
        }

        post.upvotedBy.push(userId)
        post.upvotes += 1
        await post.save()

        // track in feedsession
        await FeedSession.findOneAndUpdate(
            { user: userId },
            { $inc: { [`categoryData.${post.category}.votes`]: 1 } },
            { upsert: true }
        )

        res.status(200).json({ success: true, upvotes: post.upvotes })
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

        // check if already downvoted
        if (post.downvotedBy.includes(userId)) {
            res.status(400).json({ success: false, message: "Already downvoted" })
            return
        }

        // remove from upvotes if exists
        if (post.upvotedBy.includes(userId)) {
            post.upvotedBy.pull(userId)
            post.upvotes -= 1
        }

        post.downvotedBy.push(userId)
        post.downvotes += 1
        await post.save()

        // track in feedsession
        await FeedSession.findOneAndUpdate(
            { user: userId },
            { $inc: { [`categoryData.${post.category}.votes`]: 1 } },
            { upsert: true }
        )

        res.status(200).json({ success: true, downvotes: post.downvotes })
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message })
        } else {
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    }
}