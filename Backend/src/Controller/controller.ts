import type { Request, Response } from "express"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import User from "../Model/user.js"


export const handlesignup = async (req: Request, res: Response): Promise<void> => {
    
    const { name, username, email, password } = req.body

    if (!name || !username || !email || !password) {
        res.status(400).json({ success: false, message: "Details are Missing" })
        return
    }
    try{
        const existingUser = await User.findOne({email})
        if(existingUser){
            res.status(400).json({success: false, message: "User already exists"})
            return
        }
        const existingUsername = await User.findOne({ username })
        if (existingUsername) {
            res.status(400).json({ success: false, message: "Username already taken" })
            return
        }
        
        const hashedPassword = await bcrypt.hash(password,10)
        await User.create({name,username, email, password: hashedPassword })
        res.status(201).json({ message: "Signup success" })
    }
    catch(error){
        if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message })
        } else {
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    }
    

}
export const handlelogin = async (req: Request, res: Response): Promise<void> => {
    
        const {email,password} = req.body
        if(!email || !password){
             res.status(400).json({success: false, message : "Email and Password are required"})
             return
        }
        try{
            const user = await User.findOne({email})
            if(!user){
                res.status(401).json({success: false, message:"Invalid credentials"})
                return
            }
            const isMatch = await bcrypt.compare(password, user.password)
            if(!isMatch){
                res.status(401).json({success: false, message: "Invalid credentials"})
                return
            }

            const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
)


    res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000 
    })

    res.status(200).json({ success: true, message: "Login successful" })
        }
        catch(error){
        if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message })
        } else {
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
        }
}

export const handlelogout = (req: Request, res: Response): void => {
    res.clearCookie("token")
    res.status(200).json({ success: true, message: "Logged out successfully" })
}