import type { Request, Response } from "express"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import User from "../Model/user.js"
import type { MulterRequest } from "../Middleware/multer.js"
import Post from "../Model/postschema.js"
import type { IPost } from "../Model/postschema.js"
import { syncUserToML } from "../helper/mlsync.js"


export const handlesignup = async (req: Request, res: Response): Promise<void> => {

    const { name, email, password } = req.body
    if (!name || !email || !password) {
        res.status(400).json({ success: false, message: "Details are Missing" })
        return
    }
    try {
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            res.status(400).json({ success: false, message: "User already exists" })
            return
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        await User.create({ name, email, password: hashedPassword })
        res.status(201).json({ message: "Signup success" })
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message })
        } else {
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    }


}
export const handlelogin = async (req: Request, res: Response): Promise<void> => {

    const { email, password } = req.body
    if (!email || !password) {
        res.status(400).json({ success: false, message: "Email and Password are required" })
        return
    }
    try {
        const user = await User.findOne({ email })
        if (!user) {
            res.status(401).json({ success: false, message: "Invalid credentials" })
            return
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            res.status(401).json({ success: false, message: "Invalid credentials" })
            return
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET as string,
            { expiresIn: "7d" }
        )


        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({ success: true, message: "Login successful" })
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message })
        } else {
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    }
}

export const handlelogout = (req: Request, res: Response): void => {
    res.clearCookie("token")
    res.status(200).json({ success: true, message: "Logged out successfully" })
}


// Homepage handling function
export const handlehome = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies.token
    if (!token) {
        res.status(401).json({ success: false, message: "Unauthorized" })
        return
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string }
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const skip = (page - 1) * limit

        const user = await User.findById(decoded.userId)
            .populate<{ likedPosts: IPost[] }>("likedPosts")
            .populate<{ dislikedPosts: IPost[] }>("dislikedPosts")

        if (!user) {
            res.status(404).json({ success: false, message: "User not found" })
            return
        }

        //  user ley just signed up gareko xa rah yedi kunai filed selection garena bhaney yesley hadnle garxa
        if (!user.selectedCategory) {
            res.status(200).json({
                success: true,
                requiresCategory: true,
                message: "Please select a category"
            })
            return
        }

        const mergedScore: Record<string, number> = {}

        // hami ley naya user ho ki nai check garxau if te user has no categoryScore, no likedPosts, and no viewHistory, then we consider them a new user
        const isNewUser =
            user.categoryScore.size === 0 &&
            user.likedPosts.length === 0 &&
            user.viewHistory.length === 0


        try {
            await syncUserToML(decoded.userId)
            const mlResponse = await fetch(
                `http://localhost:8000/recommendations?user_id=${decoded.userId}&k=${limit}`,
                { method: "GET" }
            )

            if (mlResponse.ok) {
                const mlData = await mlResponse.json()
                const recommendedPostIds = mlData.recommendations.map(
                    (r: { post_id: string }) => r.post_id
                )

                const posts = await Post.find({
                    postId: { $in: recommendedPostIds }
                })
                    .sort({ recencyWeight: -1, engagementScore: -1, createdUtc: -1 })
                    .skip(skip)
                    .limit(limit)

                const totalCount = mlData.total_candidates ?? posts.length
                const totalPages = Math.ceil(totalCount / limit)

                res.status(200).json({
                    success: true,
                    requiresCategory: false,
                    isNewUser,
                    message: "Feed data fetched successfully",
                    data: posts,
                    page,
                    limit,
                    totalCount,
                    totalPages,
                    hasMore: page < totalPages
                })
                return
            }
        } catch (mlError) {
            //  ML model unavailable — fall back to mergedScore logic
            console.error("ML model unavailable, using fallback:", mlError)
        }


        // we are handling based on the score i.e if our user is new than they have only 1 socre and if they are returing user than they will have wached history and than some user may like post they also have liked post

        if (isNewUser) {
            mergedScore[user.selectedCategory] = 1
        } else {
            if (user.categoryScore.size > 0) {
                for (const [cat, score] of user.categoryScore.entries()) {
                    mergedScore[cat] = (mergedScore[cat] ?? 0) + score
                }
            }

            // we are giving more weightage to liked post category as compare to view history category because if user like the post that means they are more interested in that category than just watching the post this will be asked to pujan to give more weightage to liked post category as compare to view history category
            if (user.likedPosts.length > 0) {
                for (const post of user.likedPosts) {
                    mergedScore[post.category] = (mergedScore[post.category] ?? 0) + 1
                }
            }


            if (user.dislikedPosts.length > 0) {
                for (const post of user.dislikedPosts) {
                    mergedScore[post.category] = (mergedScore[post.category] ?? 0) - 1
                }
            }
        }

        // new user ko lagi hamile just selected category ko score 1 diyeko xam but returning user ko lagi hamile category score, liked post ko category score lai merge garera top 3 category nikaleko xam
        const topCategories: string[] = isNewUser
            ? [user.selectedCategory]
            : Object.entries(mergedScore)
                .filter(([, score]) => score > 0)
                .sort((a, b) => b[1] - a[1]) // highes to lowest score anusar sort gareko xam
                .slice(0, 3)
                .map(([cat]) => cat)

        const query: Record<string, unknown> = {
            category: { $in: topCategories }
        }

        const totalCount = await Post.countDocuments(query)
        const totalPages = Math.ceil(totalCount / limit)

        const posts = await Post.find(query)
            .sort({ recencyWeight: -1, engagementScore: -1, createdUtc: -1 })
            .skip(skip)
            .limit(limit)

        res.status(200).json({
            success: true,
            requiresCategory: false,
            isNewUser,
            message: "Feed data fetched successfully",
            data: posts,
            page,
            limit,
            totalCount,
            totalPages,
            hasMore: page < totalPages
        })

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ success: false, message: "Unauthorized" })
        } else if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message })
        } else {
            res.status(500).json({ success: false, message: "Internal server error" })
        }
    }
}

// Homepage handling function ends


// Post handling function
export const handlepost = async (req: MulterRequest, res: Response): Promise<void> => {
    const token = req.cookies?.token
    if (!token) {
        res.status(401).json({ success: false, message: "Unauthorized" })
        return
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET as string)

        const {

            title,
            body,
            subreddit,
            category,
            score,
            numComments,
            createdUtc,
            engagementScore,
            wordCount,
            postLength,
            recencyWeight,
            hourPosted,
            dayOfWeek
        } = req.body as {
            postId: string
            title: string
            body: string
            subreddit: string
            category: string
            score: number
            numComments: number
            createdUtc: string
            engagementScore: number
            wordCount: number
            postLength: number
            recencyWeight: number
            hourPosted: number
            dayOfWeek: number
        }

        if (!req.file) {
            res.status(400).json({ success: false, message: "Image file is required" })
            return
        }

        const imageUrl = `https://${req.get("host")}/uploads/${req.file.filename}`

        const newPost = await Post.create({
            title,
            body,
            subreddit,
            category,
            score,
            numComments,
            createdUtc: new Date(createdUtc),
            engagementScore,
            wordCount,
            postLength,
            recencyWeight,
            hourPosted,
            dayOfWeek,
            image: imageUrl
        })

        await Post.findByIdAndUpdate(newPost._id, {
            postId: newPost._id.toString()
        })
        res.status(201).json({ success: true, message: "Post created successfully", data: newPost })

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ success: false, message: "Unauthorized" })
        } else if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message })
        } else {
            res.status(500).json({ success: false, message: "Internal server error" })
        }
    }
}
// post handling function ends



// like
export const handleLike = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies?.token
    if (!token) {
        res.status(401).json({ success: false, message: "Unauthorized" })
        return
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string }
        const { postId } = req.params
        const userId = decoded.userId

        if (!postId || typeof postId !== "string") {
            res.status(400).json({ success: false, message: "Invalid post ID" })
            return
        }

        const post = await Post.findOne({ postId })
        if (!post) {
            res.status(404).json({ success: false, message: "Post not found" })
            return
        }

        const alreadyLiked = post.likes.some((id: any) => id.toString() === userId)

        if (alreadyLiked) {
            await Post.findOneAndUpdate({ postId }, {
                $pull: { likes: userId },
                $inc: { likesCount: -1 }
            })
            await User.findByIdAndUpdate(userId, {
                $pull: { likedPosts: post._id }
            })
            await syncUserToML(userId)
            res.json({ success: true, message: "Post unliked", likesCount: post.likesCount - 1 })
        } else {
            await Post.findOneAndUpdate({ postId }, {
                $addToSet: { likes: userId },
                $pull: { dislikes: userId },
                $inc: {
                    likesCount: 1,
                    dislikesCount: post.dislikes.some((id: any) => id.toString() === userId) ? -1 : 0
                }
            })
            await User.findByIdAndUpdate(userId, {
                $addToSet: { likedPosts: post._id },
                $pull: { dislikedPosts: post._id },
                $inc: { [`categoryScore.${post.category}`]: 2 }
            })
            res.json({ success: true, message: "Post liked", likesCount: post.likesCount + 1 })
        }
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ success: false, message: "Unauthorized" })
        } else if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message })
        } else {
            res.status(500).json({ success: false, message: "Internal server error" })
        }
    }
}


export const handleDislike = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies?.token
    if (!token) {
        res.status(401).json({ success: false, message: "Unauthorized" })
        return
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string }
        const { postId } = req.params
        const userId = decoded.userId

        if (!postId || typeof postId !== "string") {
            res.status(400).json({ success: false, message: "Invalid post ID" })
            return
        }

        const post = await Post.findOne({ postId })
        if (!post) {
            res.status(404).json({ success: false, message: "Post not found" })
            return
        }

        const alreadyDisliked = post.dislikes.some((id: any) => id.toString() === userId)

        if (alreadyDisliked) {
            await Post.findOneAndUpdate({ postId }, {
                $pull: { dislikes: userId },
                $inc: { dislikesCount: -1 }
            })
            await User.findByIdAndUpdate(userId, {
                $pull: { dislikedPosts: post._id }
            })
            await syncUserToML(userId)
            res.json({ success: true, message: "Dislike removed", dislikesCount: post.dislikesCount - 1 })
        } else {
            await Post.findOneAndUpdate({ postId }, {
                $addToSet: { dislikes: userId },
                $pull: { likes: userId },
                $inc: {
                    dislikesCount: 1,
                    likesCount: post.likes.some((id: any) => id.toString() === userId) ? -1 : 0
                }
            })
            await User.findByIdAndUpdate(userId, {
                $addToSet: { dislikedPosts: post._id },
                $pull: { likedPosts: post._id }
            })
            res.json({ success: true, message: "Post disliked", dislikesCount: post.dislikesCount + 1 })
        }
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ success: false, message: "Unauthorized" })
        } else if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message })
        } else {
            res.status(500).json({ success: false, message: "Internal server error" })
        }
    }
}


export const handleTrack = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies?.token
    if (!token) {
        res.status(401).json({ success: false, message: "Unauthorized" })
        return
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string }
        const { postId, category, dwellTime } = req.body   //  frontend sends 

        await User.findByIdAndUpdate(decoded.userId, {
            $push: {
                viewHistory: {
                    $each: [{
                        postId,
                        category,
                        dwellTime,
                        viewedAt: new Date()
                    }],
                    $slice: -10
                }
            },
            $inc: { [`categoryScore.${category}`]: 1 }
        })
        await syncUserToML(decoded.userId)
        res.json({ success: true, message: "View tracked" })

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ success: false, message: "Unauthorized" })
        } else if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message })
        } else {
            res.status(500).json({ success: false, message: "Internal server error" })
        }
    }
}

export const handleCategory = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies?.token
    if (!token) {
        res.status(401).json({ success: false, message: "Unauthorized" })
        return
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string }
        const { category } = req.body

        if (!category) {
            res.status(400).json({ success: false, message: "Category is required" })
            return
        }

        await User.findByIdAndUpdate(decoded.userId, {
            selectedCategory: category.toLowerCase()
        })

        await syncUserToML(decoded.userId)

        res.status(200).json({ success: true, message: "Category saved successfully" })

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ success: false, message: "Unauthorized" })
        } else if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message })
        } else {
            res.status(500).json({ success: false, message: "Internal server error" })
        }
    }
}


// for sync to pujan ml model