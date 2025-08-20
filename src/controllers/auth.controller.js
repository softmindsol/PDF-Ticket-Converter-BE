import { asyncHandler } from "#utils/api.utils.js";
import userModel from "../models/user.model.js";
import { comparePassword, generateAuthToken } from "#utils/auth.utils.js";
import ApiError from "#utils/api.utils.js";
const loginController = asyncHandler(async (req, res) => {
console.log("login")
    const { username, password } = req.body;

    if (!username || !password) {
        throw new ApiError(400, "Username and password are required");
    }

    const user = await userModel.findOne({ username }).select("+password");
    if (!user) {
        throw new ApiError(401, "Invalid username or password");
    }

    const isMatch = await comparePassword(password, user.password); 
    if (!isMatch) {
        throw new ApiError(401, "Invalid username or password");
    }

    const token = await generateAuthToken(user);
    
    res.status(200).json({
        success: true,
        token,
        user: {
            id: user._id,
            username: user.username
        }
    });
});

export { loginController };