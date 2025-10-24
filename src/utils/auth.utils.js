import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "#config/env.config.js";

// Compare password using bcrypt
const comparePassword = async (password, userPassword) => {
    try {
        return await bcrypt.compare(password, userPassword);
    } catch (error) {
        throw new Error("Error comparing passwords");
    }
};


// Hash password using bcrypt
const hashPassword = async (password) => {
    try {
        return await bcrypt.hash(password, 10);
    } catch (error) {
        throw new Error("Error hashing password");
    }
};


// Generate auth token using jsonwebtoken
const generateAuthToken = async (user) => {
    try {
        const payload = {
            id: user._id,
            username: user.username,
            allowedForms:user?.department?.allowedForms,
            department:user?.department?._id,
            departmentName:user?.department?.name,
            role: user.role,
        };
        const token = jwt.sign(payload, JWT_SECRET, {
            expiresIn: "10h" 
        });
        if (!token) {
            throw new Error("Failed to generate auth token");
        }
        return token;
    } catch (error) {
        console.log("🚀 ~ generateAuthToken ~ error:", error)
        throw new Error("Error generating auth token");
    }
};


// Verify token using jsonwebtoken
const verifyToken = (token) => {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw new Error("TOKEN_EXPIRED");
      }
      if (err.name === "JsonWebTokenError") {
        throw new Error("INVALID_TOKEN");
      }
      throw new Error(err.name||"TOKEN_ERROR" );
    }
  };


export { comparePassword, hashPassword, generateAuthToken, verifyToken };