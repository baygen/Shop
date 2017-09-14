import React from 'react';
import axios from 'axios';
import classnames from 'classnames';
import validateInput from '../../../../server/validation/SignupVal'
import {browserHistory} from 'react-router' 

class SignUpForm extends React.Component {

  constructor(props){
  super(props);

  this.state = {
    email: '',
    password: '',
    passwordConfirmation: '',
    errors: {},
    isLoading: false
}

this.onSubmit= this.onSubmit.bind(this);
this.onChange= this.onChange.bind(this);

}

onChange(e){
  this.setState({[e.target.name]:e.target.value});
}

isvalid(){
   const{errors, isValid} = validateInput(this.state);
   if(!isValid){
       this.setState({errors});
   }
   return isValid;
}

onSubmit(e){
    e.preventDefault();
    
    if(this.isvalid()){    
        axios.post('/register',this.state)
            .then(response=>{
                if(response.data._id){
                  this.setState({errors:''});
                  this.props.login("Guest");
                  browserHistory.push('/');
              }else{
                var errors = {
                  isExist:'this email already exist'
                };
                this.setState({errors: errors, isLoading:false});
              }
                
            }
          );
    }
}

  render() {
    const{errors} = this.state;
    return (
      
      <form onSubmit={this.onSubmit}>
        <p>{errors.isExist&&<span >{errors.isExist}</span>}</p>

        <div className={classnames("form-group",{'has-error':errors.email})}>

          <label className="control-label">e-mail</label>
          <input className="form-control"
              value={this.state.email}
              onChange={this.onChange}
              type="text"
              name="email"/>
              {errors.email&&<span className="help-block">{errors.email}</span>}
        </div>

        <div className={classnames("form-group",{'has-error':errors.password})}>
          <label className="control-label">Password</label>
          <input className="form-control"
              value={this.state.password}
              onChange={this.onChange}
              type="password"
              name="password"/>
            {errors.password&&<span className="help-block">{errors.password}</span>}

        </div>

        <div className={classnames("form-group",{'has-error':errors.passwordConfirmation})}>
          <label className="control-label">Password confirmation</label>
          <input className="form-control"
            value={this.state.passwordConfirmation}
            onChange={this.onChange}
              type="password"
              name="passwordConfirmation"/>
              {errors.passwordConfirmation&&<span className="help-block">{errors.passwordConfirmation}</span>}
        </div>
        
        <div className="form-group">
          <button disabled={this.state.isLoading} className="btn btn-primary btn-lg">
            Sign up
          </button>
        </div>
      </form>
      
    );
}
}


export default SignUpForm;