// Routing/userRouting.ts
import express from "express"
import {
    handleGetProfile,
    handleGetMyPosts,
    handleInterests,
    handleTrackView,
    handleChangePassword
} from "../Controller/userController.js"
import { protect } from "../Middleware/tokens.js"

const router = express.Router()

/**
 * @openapi
 * /user/profile:
 *   get:
 *     summary: Get user profile
 *     responses:
 *       200:
 *         description: Profile fetched
 */
router.get("/profile", protect, handleGetProfile)

/**
 * @openapi
 * /user/posts:
 *   get:
 *     summary: Get user's own posts
 *     responses:
 *       200:
 *         description: Posts fetched
 */
router.get("/posts", protect, handleGetMyPosts)

/**
 * @openapi
 * /user/interests:
 *   put:
 *     summary: Update user interests
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - interests
 *             properties:
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Interests updated
 */
router.put("/interests", protect, handleInterests)

/**
 * @openapi
 * /user/track-view:
 *   post:
 *     summary: Track view interaction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - post_id
 *               - dwell_time_seconds
 *             properties:
 *               post_id:
 *                 type: string
 *               dwell_time_seconds:
 *                 type: number
 *     responses:
 *       201:
 *         description: View tracked
 */
router.post("/track-view", protect, handleTrackView)

/**
 * @openapi
 * /user/change-password:
 *   put:
 *     summary: Change password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed
 */
router.put("/change-password", protect, handleChangePassword)

export default router