import Joi from 'joi';
import httpStatus from 'http-status';
import pick from '#utils/pick.utils.js';
import ApiError from '#utils/api.utils.js';

const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ['params', 'query', 'body', 'file']);
    
  const object = pick(req, Object.keys(validSchema));
    
  const { value, error } = Joi.compile(validSchema)
    
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);
    
  if (error) {
    const errorArray = error.details.map((details) =>  {return{message:details.message,
     key:details.context?.key
    }});
    
    return next(new ApiError(httpStatus.BAD_REQUEST, "Validation Error",errorArray));
  } 
  
  Object.assign(req, value);
  
  return next();
};  
    
    
export default validate;