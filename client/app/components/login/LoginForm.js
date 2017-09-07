import React from 'react';
import validateInput from '../../../../server/validation/login';
import classnames from 'classnames';
import axios from 'axios';
import {browserHistory} from 'react-router';



class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      errors: {},
      isLoading: false,
      badErrors:''
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  isValid() {
    const { errors, isValid } = validateInput(this.state);
    if (!isValid) {
      this.setState({ errors });
    }
    return isValid;
  }

  onSubmit(e) {
    e.preventDefault();
    if (this.isValid()) {

      this.setState({ errors: {}, isLoading : true});

      var userData = { 
        email: this.state.email, 
        password: this.state.password
      }
      axios.post('/login',userData).then(
          (response)=>{ 
            this.props.login(response.data);
            this.setState({ isLoading : false })
            browserHistory.push('/');           
          }
        ).catch(err=>{
          this.setState({badErrors: err, isLoading : false});
          console.log(err);
        });
    }
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  render() {
    const { badErrors,errors, email, password, isLoading } = this.state;

    return (
      
      <form onSubmit={this.onSubmit}>
        <p>{badErrors&&<span >wrong email or password</span>}</p>

        <div className={classnames("form-group",{'has-error':errors.email})}>

          <label className="control-label">e-mail</label>
          <input className="form-control"
            value={email}
            onChange={this.onChange}
              type="text"
              name="email"/>
              {errors.email&&<span className="help-block">{errors.email}</span>}
        </div>

        <div className={classnames("form-group",{'has-error':errors.password})}>
          <label className="control-label">password</label>
          <input className="form-control"
            value={password}
            onChange={this.onChange}
              type="password"
              name="password"/>
        </div>
        
        <div className="form-group">
          <button disabled={isLoading} className="btn btn-primary btn-lg">
            Log in
          </button>
        </div>
      </form>
      
    );
  }
}


export default LoginForm;
