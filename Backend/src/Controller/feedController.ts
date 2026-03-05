import type { Request, Response } from "express"
import mongoose from "mongoose"
import Post from "../Model/post.js"
import User from "../Model/user.js"
import FeedSession from "../Model/feedsession.js"

// GET feed (5 posts at a time based on interests)
export const handleGetFeed = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = 5
        const skip = (page - 1) * limit

        const user = await User.findById(req.user?.userId)
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" })
            return
        }

        const posts = await Post.find({ category: { $in: user.interests } })
            .populate("author", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        res.status(200).json({ success: true, page, posts })
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message })
        } else {
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    }
}

// TRACK watchtime (called by frontend)
export const handleFeedSession = async (req: Request, res: Response): Promise<void> => {
    const { category, timeSpent } = req.body

    if (!category || !timeSpent) {
        res.status(400).json({ success: false, message: "Category and timeSpent are required" })
        return
    }

    try {
        const userId = new mongoose.Types.ObjectId(req.user?.userId)

        await FeedSession.findOneAndUpdate(
            { user: userId },
            { $inc: { [`categoryData.${category}.watchTime`]: timeSpent } },
            { upsert: true, new: true }
        )

        res.status(201).json({ success: true, message: "Session tracked" })
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message })
        } else {
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    }
}