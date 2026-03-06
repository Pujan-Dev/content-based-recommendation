// Routing/routing.ts
import express from "express"
import { handlelogin, handlesignup, handlelogout } from "../Controller/controller.js"

const router = express.Router()

/**
 * @openapi
 * /backend/signup:
 *   post:
 *     summary: Signup user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - username
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Signup successful
 */
router.post('/signup', handlesignup)

/**
 * @openapi
 * /backend/login:
 *   post:
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', handlelogin)

/**
 * @openapi
 * /backend/logout:
 *   post:
 *     summary: Logout user
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', handlelogout)

export default router