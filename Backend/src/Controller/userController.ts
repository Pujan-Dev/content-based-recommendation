
import type { Request, Response } from "express"
import bcrypt from 'bcrypt'
import mongoose from "mongoose"
import { v4 as uuidv4 } from "uuid"
import User from "../Model/user.js"
import Post from "../Model/post.js"

// GET profile
export const handleGetProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user?.userId).select("-password")
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" })
            return
        }
        res.status(200).json({ success: true, user })
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message })
        } else {
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    }
}

// GET user's own posts
export const handleGetMyPosts = async (req: Request, res: Response): Promise<void> => {
    try {
        const posts = await Post.find({ 
            author: new mongoose.Types.ObjectId(req.user?.userId) 
        }).sort({ created_utc: -1 })

        res.status(200).json({ success: true, posts })
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message })
        } else {
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    }
}

// UPDATE interests
export const handleInterests = async (req: Request, res: Response): Promise<void> => {
    const { interests } = req.body

    if (!interests || interests.length === 0) {
        res.status(400).json({ success: false, message: "Interests are required" })
        return
    }

    try {
        // prefill category_preferences with selected interests
        const initialPreferences: Record<string, number> = {}
        interests.forEach((category: string) => {
            initialPreferences[category] = 0
        })

        await User.findByIdAndUpdate(
            req.user?.userId,
            {
                interests,
                category_preferences: initialPreferences
            },
            { new: true }
        )

        res.status(200).json({ success: true, message: "Interests updated" })
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message })
        } else {
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    }
}

// TRACK view (called by frontend when user views a post)
export const handleTrackView = async (req: Request, res: Response): Promise<void> => {
    const { post_id, dwell_time_seconds } = req.body

    if (!post_id || !dwell_time_seconds) {
        res.status(400).json({ success: false, message: "post_id and dwell_time_seconds are required" })
        return
    }

    try {
        const post = await Post.findById(post_id)
        if (!post) {
            res.status(404).json({ success: false, message: "Post not found" })
            return
        }

        const userId = new mongoose.Types.ObjectId(req.user?.userId)

        await User.findByIdAndUpdate(userId, {
            $push: {
                interaction_history: {
                    interaction_id: uuidv4(),
                    post_id: post._id,
                    post_category: post.final_category,
                    action: "view",
                    dwell_time_seconds,
                    timestamp: new Date(),
                    engagement_value: 0.3
                }
            },
            $inc: { [`category_preferences.${post.final_category}`]: 0.3 }
        })

        res.status(201).json({ success: true, message: "View tracked" })
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message })
        } else {
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    }
}

// CHANGE password
export const handleChangePassword = async (req: Request, res: Response): Promise<void> => {
    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
        res.status(400).json({ success: false, message: "Details are Missing" })
        return
    }

    try {
        const user = await User.findById(req.user?.userId)
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" })
            return
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password)
        if (!isMatch) {
            res.status(401).json({ success: false, message: "Old password is incorrect" })
            return
        }

        user.password = await bcrypt.hash(newPassword, 10)
        await user.save()

        res.status(200).json({ success: true, message: "Password changed successfully" })
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message })
        } else {
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    }
}