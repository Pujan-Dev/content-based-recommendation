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

        //  write user data in ML model's exact format
        await mlUsersCollection.updateOne(
            { user_id: userId },
            {
                $set: {
                    user_id:  userId,
                    username: user.name,

                    // 👇 ML format: category_preferences
                    category_preferences: Object.fromEntries(user.categoryScore),

                    // 👇 ML format: interaction_history
                    interaction_history: [
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
            { upsert: true }  // 👈 create if not exists, update if exists
        )

        console.log(`syncUserToML: synced user ${userId}`)

    } catch (error) {
        // 👇 never crash main flow if sync fails
        console.error("syncUserToML failed:", error)
    }
}