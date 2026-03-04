import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

export const protect = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies?.token

    if (!token) {
        res.status(401).json({ success: false, message: "No token provided" })
        return
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string }
        req.user = decoded
        next()
    } catch {
        res.status(401).json({ success: false, message: "Invalid token" })
    }
}