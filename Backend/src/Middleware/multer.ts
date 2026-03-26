import multer from "multer";
import type { Request } from "express";

export interface MulterRequest extends Request {
  file?: Express.Multer.File | undefined;
}

const storage = multer.memoryStorage()
const uploads = multer({ storage })

export default uploads;