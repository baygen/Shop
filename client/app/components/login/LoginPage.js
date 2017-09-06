import React from 'react';
import LoginForm from './LoginForm'


class LoginPage extends React.Component {

  render() {
    
    return (
      <div className="overlai">
        <div className="col-sm-10 col-md-12 col-md-offset-5" style={{ marginLeft : "45.45%"}} >
          <strong><h3>    Login !</h3></strong>
        </div>
				
        <div className="col-md-4 col-md-offset-4">
          <div className="jumbotron" style={{ paddingLeft : "40px", paddingRight : "35px", backgroundColor : "rgba(159, 213, 222, 0.39)"}} >
            <LoginForm login={this.props.login}/>
          </div>
        </div>
      </div>
    )
  }
}

export default LoginPage;