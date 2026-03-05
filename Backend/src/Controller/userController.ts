
import type { Request, Response } from "express"
import bcrypt from 'bcrypt'
import mongoose from "mongoose"
import User from "../Model/user.js"
import FeedSession from "../Model/feedsession.js"

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

// UPDATE interests
export const handleInterests = async (req: Request, res: Response): Promise<void> => {
    const { interests } = req.body

    if (!interests || interests.length === 0) {
        res.status(400).json({ success: false, message: "Interests are required" })
        return
    }

    try {
        await User.findByIdAndUpdate(
            req.user?.userId,
            { interests },
            { new: true }
        )

        // prefill FeedSession with selected interests
        const initialCategoryData: Record<string, { watchTime: number, votes: number }> = {}
        interests.forEach((category: string) => {
            initialCategoryData[category] = { watchTime: 0, votes: 0 }
        })

        await FeedSession.findOneAndUpdate(
            { user: new mongoose.Types.ObjectId(req.user?.userId) },
            { $set: { categoryData: initialCategoryData } },
            { upsert: true, new: true }
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