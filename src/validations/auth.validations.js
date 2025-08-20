import Joi from "joi";

const authValidation = {
login:{
body: Joi.object({
    username: Joi.string().required().regex(/^[a-z][a-z0-9]+$/).min(3).max(30)
    .messages({
        "string.base": "Username must be a string",
        "string.empty": "Username cannot be empty",
        "string.pattern.base": "Username must start with a letter and can only contain letters and numbers",
        "string.min": "Username must be at least 3 characters long",
        "string.max": "Username cannot be longer than 30 characters",
        "any.required": "Username is required",
    }),
password: Joi.string().required().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\W)[a-zA-Z\W]{6,30}$/)
    .messages({
        "string.base": "Password must be a string",
        "string.empty": "Password cannot be empty",
        "string.pattern.base": "Password must contain at least one lowercase letter, one uppercase letter, and one special character",
        "string.min": "Password must be at least 6 characters long",
        "string.max": "Password cannot be longer than 30 characters",
        "any.required": "Password is required",
    }),
})

}

}



export default authValidation;
