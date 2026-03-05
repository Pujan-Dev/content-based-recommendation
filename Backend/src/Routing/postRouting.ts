// Routes/postRoutes.ts
import express from "express"
import {
    handleCreatePost,
    handleGetPost,
    handleUpdatePost,
    handleDeletePost,
    handleUpvote,
    handleDownvote
} from "../Controller/postController.js"
import { protect } from "../Middleware/tokens.js"
import { upload } from "../Middleware/upload.js"

const router = express.Router()

/**
 * @openapi
 * /post:
 *   post:
 *     summary: Create a post
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               caption:
 *                 type: string
 *               category:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Post created
 */
router.post("/", protect, upload.single("image"), handleCreatePost)

/**
 * @openapi
 * /post/{id}:
 *   get:
 *     summary: Get a post
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post found
 */
router.get("/:id", protect, handleGetPost)

/**
 * @openapi
 * /post/{id}:
 *   patch:
 *     summary: Update a post (only author)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               caption:
 *                 type: string
 *               category:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Post updated
 */
router.patch("/:id", protect, upload.single("image"), handleUpdatePost)

/**
 * @openapi
 * /post/{id}:
 *   delete:
 *     summary: Delete a post (only author)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted
 */
router.delete("/:id", protect, handleDeletePost)

/**
 * @openapi
 * /post/{id}/upvote:
 *   post:
 *     summary: Upvote a post
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Upvoted
 */
router.post("/:id/upvote", protect, handleUpvote)

/**
 * @openapi
 * /post/{id}/downvote:
 *   post:
 *     summary: Downvote a post
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Downvoted
 */
router.post("/:id/downvote", protect, handleDownvote)

export default router