import express from "express"
import { handleGetFeed, handleFeedSession } from "../Controller/feedController.js"
import { protect } from "../Middleware/tokens.js"

const router = express.Router()

/**
 * @openapi
 * /feed:
 *   get:
 *     summary: Get 5 posts based on user interests
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: Feed fetched
 */
router.get("/", protect, handleGetFeed)

/**
 * @openapi
 * /feed/session:
 *   post:
 *     summary: Track time spent on a category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *               timeSpent:
 *                 type: number
 *     responses:
 *       201:
 *         description: Session tracked
 */
router.post("/session", protect, handleFeedSession)

export default router