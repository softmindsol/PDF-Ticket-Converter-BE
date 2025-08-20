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

// Generate auth token using jsonwebtoken
const generateAuthToken = async (user) => {
    try {
        const payload = {
            id: user._id,
            username: user.username
        };
        const token = jwt.sign(payload, JWT_SECRET, {
            expiresIn: "1h" 
        });
        if (!token) {
            throw new Error("Failed to generate auth token");
        }
        return token;
    } catch (error) {
        throw new Error("Error generating auth token");
    }
};

export { comparePassword, generateAuthToken };