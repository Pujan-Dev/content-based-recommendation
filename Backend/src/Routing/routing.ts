import express from "express";
import {
  handlelogin,
  handlesignup,
  handlelogout,
  handlehome,
  handlepost,
  handleLike,
  handleDislike,
  handleTrack,
  handleCategory,

  handleUpdatePost, handleDeletePost,

  handleAdminGetAllPosts,
  handleAdminGetAllUsers,
  handleAdminDeletePost
} from "../Controller/controller.js";
import { protect } from "../Middleware/tokens.js";
import uploads from "../Middleware/multer.js";
const router = express.Router();

/**
 * @openapi
 * /backend/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Auth
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
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", handlelogin);

/**
 * @openapi
 * /backend/signup:
 *   post:
 *     summary: Signup user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: Signup successful
 *       400:
 *         description: User already exists or missing details
 */
router.post("/signup", handlesignup);

/**
 * @openapi
 * /backend/logout:
 *   post:
 *     summary: Logout user
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", handlelogout);

/**
 * @openapi
 * /backend/home:
 *   get:
 *     summary: Get personalized feed
 *     tags:
 *       - Feed
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Posts per page
 *     responses:
 *       200:
 *         description: Feed fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 requiresCategory:
 *                   type: boolean
 *                 isNewUser:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalCount:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 hasMore:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 */
router.get("/home", protect, handlehome);

/**
 * @openapi
 * /backend/post:
 *   post:
 *     summary: Create a new post
 *     tags:
 *       - Posts
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *               - category
 *               - subreddit
 *               - createdUtc
 *             properties:
 *               title:
 *                 type: string
 *                 example: Climate change solutions
 *               body:
 *                 type: string
 *                 example: Scientific discoveries...
 *               subreddit:
 *                 type: string
 *                 example: r/science
 *               category:
 *                 type: string
 *                 example: science
 *               score:
 *                 type: number
 *                 example: 9
 *               numComments:
 *                 type: number
 *                 example: 2
 *               createdUtc:
 *                 type: string
 *                 example: 2025-07-30T14:49:04.830246
 *               engagementScore:
 *                 type: number
 *                 example: 0.9
 *               wordCount:
 *                 type: number
 *                 example: 136
 *               postLength:
 *                 type: number
 *                 example: 476
 *               recencyWeight:
 *                 type: number
 *                 example: 0.40
 *               hourPosted:
 *                 type: number
 *                 example: 9
 *               dayOfWeek:
 *                 type: number
 *                 example: 3
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Optional image for the post
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/post", protect, uploads.single("image"), handlepost);

/**
 * @openapi
 * /backend/post/{postId}/like:
 *   post:
 *     summary: Like or unlike a post
 *     tags:
 *       - Posts
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *         example: post_001
 *     responses:
 *       200:
 *         description: Post liked or unliked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 likesCount:
 *                   type: number
 *       404:
 *         description: Post not found
 *       401:
 *         description: Unauthorized
 */
router.post("/post/:postId/like", protect, handleLike);

/**
 * @openapi
 * /backend/post/{postId}/dislike:
 *   post:
 *     summary: Dislike or remove dislike from a post
 *     tags:
 *       - Posts
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *         example: post_001
 *     responses:
 *       200:
 *         description: Post disliked or dislike removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 dislikesCount:
 *                   type: number
 *       404:
 *         description: Post not found
 *       401:
 *         description: Unauthorized
 */
router.post("/post/:postId/dislike", protect, handleDislike);

/**
 * @openapi
 * /backend/track:
 *   post:
 *     summary: Track user view interaction
 *     tags:
 *       - Interactions
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *               - category
 *               - dwellTime
 *             properties:
 *               postId:
 *                 type: string
 *                 example: post_001
 *               category:
 *                 type: string
 *                 example: science
 *               dwellTime:
 *                 type: number
 *                 example: 300
 *                 description: Time spent on post in seconds
 *     responses:
 *       200:
 *         description: View tracked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/track", protect, handleTrack);

/**
 * @openapi
 * /backend/category:
 *   post:
 *     summary: Save user selected category
 *     tags:
 *       - Auth
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categories
 *             properties:
 *               categories:
 *                 type: array
 *                  items:
 *                    type:string
 *                 example: ["technology","gaming","travel"]
 *     responses:
 *       200:
 *         description: Category saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Category is required
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/category", protect, handleCategory);

/**
 * @openapi
 * /backend/post/{postId}:
 *   put:
 *     summary: Update a post (author only)
 *     tags:
 *       - Posts
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Post not found
 */
router.put("/post/:postId", protect, handleUpdatePost)

/**
 * @openapi
 * /backend/post/{postId}:
 *   delete:
 *     summary: Delete a post (author only)
 *     tags:
 *       - Posts
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Post not found
 */
router.delete("/post/:postId", protect, handleDeletePost)
/**
 * @openapi
 * /backend/admin/posts:
 *   get:
 *     summary: Get all posts (admin)
 *     tags:
 *       - Admin
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Posts per page
 *     responses:
 *       200:
 *         description: Posts fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/admin/posts", protect, handleAdminGetAllPosts);

/**
 * @openapi
 * /backend/admin/users:
 *   get:
 *     summary: Get all users (admin)
 *     tags:
 *       - Admin
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/admin/users", protect, handleAdminGetAllUsers);

/**
 * @openapi
 * /backend/admin/post/{postId}:
 *   delete:
 *     summary: Delete a post (admin)
 *     tags:
 *       - Admin
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID to delete
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.delete("/admin/post/:postId", protect, handleAdminDeletePost);

export default router;
