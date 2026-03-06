// helpers/syncUserToML.ts
import mongoose from "mongoose"
import User from "../Model/user.js"
import type { IPost } from "../Model/postschema.js"

export const syncUserToML = async (userId: string): Promise<void> => {
    try {
        const user = await User.findById(userId)
            .populate<{ likedPosts: IPost[] }>("likedPosts")
            .populate<{ dislikedPosts: IPost[] }>("dislikedPosts")

        if (!user) {
            console.error(`syncUserToML: user ${userId} not found`)
            return
        }

        if (!mongoose.connection.db) {
            console.error("syncUserToML: database connection not available")
            return
        }

        const mlUsersCollection = mongoose.connection.db.collection("ml_users")

        await mlUsersCollection.updateOne(
            { user_id: userId },
            {
                $set: {
                    user_id:  userId,
                    username: user.name,

                    preferences: {
                        categories: [user.selectedCategory],
                        language: "en"
                    },


                    interactions: [
                        // likes → "upvote"
                        ...user.likedPosts.map((post) => ({
                            post_id:   post.postId,
                            action:    "upvote",
                            timestamp: new Date().toISOString()
                        })),

                        // dislikes → "downvote"
                        ...user.dislikedPosts.map((post) => ({
                            post_id:   post.postId,
                            action:    "downvote",
                            timestamp: new Date().toISOString()
                        })),

                        // views
                        ...user.viewHistory.map((view) => ({
                            post_id:   view.postId.toString(),
                            action:    "view",
                            timestamp: view.viewedAt
                        }))
                    ]
                }
            },
            { upsert: true }
        )

        console.log(`syncUserToML: synced user ${userId}`)

    } catch (error) {
        console.error("syncUserToML failed:", error)
    }
}