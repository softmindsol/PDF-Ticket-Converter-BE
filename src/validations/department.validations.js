import Joi from "joi";

const departmentValidation = {
createDepartment:{
body: Joi.object({
    name: Joi.string().required().min(3).max(30).regex(/^(?!.*\s$).*\S.*\S$/).messages({
        "string.base": "Name must be a string",
        "string.empty": "Name cannot be empty",
        "string.min": "Name must be at least 3 characters long",
        "string.max": "Username cannot be longer than 30 characters",
        "string.pattern.base": "Name must start with an alphabet and can only contain letters, numbers and spaces(in between)",
        "any.required": "Name is required",
    }),

})  

},
}
export default departmentValidation