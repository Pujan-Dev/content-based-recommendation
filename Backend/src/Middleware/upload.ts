// Middleware/upload.ts
import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import cloudinary from "../Config/cloudinary.js"

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "posts",
        allowed_formats: ["jpg", "jpeg", "png", "webp"]
    } as any
})

export const upload = multer({ storage })