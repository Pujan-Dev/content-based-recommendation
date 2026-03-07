import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../Model/user.js";

export const protect = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ success: false, message: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export const protectAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ success: false, message: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };
    req.user = decoded;

    const user = await User.findById(decoded.userId).select("role");
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (user.role !== "admin") {
      res
        .status(403)
        .json({ success: false, message: "Admin access required" });
      return;
    }

    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};
