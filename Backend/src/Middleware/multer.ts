import multer from "multer"
import path from "path"
import type { Request } from "express"

export interface MulterRequest extends Request {
  file?: Express.Multer.File
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname)
    cb(null, uniqueName)
  }
})

const uploads = multer({ storage })

export default uploads