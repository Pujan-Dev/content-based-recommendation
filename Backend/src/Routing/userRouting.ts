// Routes/userRoutes.ts
import express from "express"
import {
    handleGetProfile,
    handleInterests,
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
 * /user/interests:
 *   put:
 *     summary: Update user interests
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 * /user/change-password:
 *   put:
 *     summary: Change password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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