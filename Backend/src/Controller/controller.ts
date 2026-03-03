import type { Request, Response } from "express"

export const handlelogin = async (req: Request, res: Response): Promise<void> => {
    console.log("Login endpoint hit")
    res.status(200).json({ message: "Login success" })
}

export const handlesignup = async (req: Request, res: Response): Promise<void> => {
    console.log("Signup endpoint hit")
    res.status(201).json({ message: "Signup success" })
}