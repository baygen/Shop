const Validator = require('validator');
const _ = require ('underscore');


module.exports = function validateInput(data){
  
  var errors={};

  if (Validator.isEmpty(data.email+'')) {
    errors.email = 'This field is required';
  }else{
  if (!Validator.isEmail(data.email)) {
    errors.email = 'Email is invalid';
  }
}
  if (Validator.isEmpty(data.password+'')) {
    errors.password = 'This field is required';
  }
  if (Validator.isEmpty(data.passwordConfirmation+'')) {
    errors.passwordConfirmation = 'This field is required';
  }
  if (!Validator.equals(data.password+'', data.passwordConfirmation+'')) {
    errors.passwordConfirmation = 'Passwords must match';
  }

  return { errors : errors,
   isValid: _.isEmpty(errors)
 }
}
