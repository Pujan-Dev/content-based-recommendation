import express from "express"
import {handlelogin,handlesignup} from "../Controller/controller"
const router = express.Router()

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
 * /backend/signup:
 *   post:
 *     summary: Signup user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Signup successful
 */
router.post('/signup', handlesignup)

export default router