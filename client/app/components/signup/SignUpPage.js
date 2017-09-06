import React from 'react';
import SignupForm from './SignupForm';

 
class SignUpPage extends React.Component {


  render() {
    const{userSignupRequest} = this.props;
    return (
      <div className="row">
        <div className="col-md-2 col-md-offset-5">
          <strong>Sign up!</strong>
        </div>
        <div className="col-md-4 col-md-offset-4">
          
          <SignupForm 
          login={this.props.login}
          />
        </div>
      </div>
    );
}
}

SignUpPage.propTypes={
  login: React.PropTypes.func,
}

export default SignUpPage;