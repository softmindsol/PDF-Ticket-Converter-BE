import Joi from "joi";

const passwordRegrex=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{6,30}$/


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
password: Joi.string().required().regex(passwordRegrex)
    .messages({
        "string.base": "Password must be a string",
        "string.empty": "Password cannot be empty",
        "string.pattern.base": "Password must contain at least one lowercase letter, one uppercase letter, and one special character",
        "string.min": "Password must be at least 6 characters long",
        "string.max": "Password cannot be longer than 30 characters",
        "any.required": "Password is required",
    }),
})

},
register:{
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
        password: Joi.string().required().regex(passwordRegrex)
        .messages({
            "string.base": "Password must be a string",
            "string.empty": "Password cannot be empty",
            "string.pattern.base": "Password must contain at least one lowercase letter, one uppercase letter, and one special character",
            "string.min": "Password must be at least 6 characters long",
            "string.max": "Password cannot be longer than 30 characters",
            "any.required": "Password is required",
        }),
    
        firstName: Joi.string().required().min(3).max(30)
        .messages({
            "string.base": "First name must be a string",
            "string.empty": "First name cannot be empty",
            "string.min": "First name must be at least 3 characters long",
            "string.max": "First name cannot be longer than 30 characters",
            "any.required": "First name is required",
        }),
        lastName: Joi.string().required().min(3).max(30)
        .messages({
            "string.base": "Last name must be a string",
            "string.empty": "Last name cannot be empty",
            "string.min": "Last name must be at least 3 characters long",
            "string.max": "Last name cannot be longer than 30 characters",
            "any.required": "Last name is required",
        }),
        phoneNumber: Joi.string().required().min(10).max(15)
        .messages({
            "string.base": "Phone number must be a string",
            "string.empty": "Phone number cannot be empty",
            "string.min": "Phone number must be at least 10 characters long",
            "string.max": "Phone number cannot be longer than 15 characters",
            "any.required": "Phone number is required",
        }),  
    }) 
}


}



export default authValidation;
