import React from 'react';
import NavigationBar from './navigationBar';
import SignUpPage from './signup/SignUpPage';
import axios from 'axios';

class App extends React.Component {
  constructor(props){
    super(props);
    this.state={
      isAuth : '' ,
      username : 'Guest'
    }
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.checkAuth = this.checkAuth.bind(this);
  }

  login(username){
    this.setState({
      isAuth: true, 
      username: username
    });
  }

  logout(){
    axios.post('/logout').then(response=>{
      this.setState({
        isAuth: false,
        username:'Guest'
      });
    }
      );
  }

  checkAuth(){

    axios.post('/').then(response=>{
        if(response.data.auth == 'true'){
          this.setState({
            isAuth : true, 
            username : response.data.username
          });
        }else if(response.data.auth == 'false'){
          this.setState({ isAuth : false });
        }
    });

  }

  componentWillMount(){
    if(this.state.isAuth === ''){
      this.checkAuth();
    }
  }


  render() {

    const { isAuth } = this.state;

    const childrenWithProps = React.Children.map(this.props.children,
      (child) => React.cloneElement(child, {
        login : this.login,
        isAuth : isAuth
        })
     );

    return (
      <div className="container">
        <NavigationBar 
          isAuth = {this.state.isAuth} 
          logout = {()=>this.logout}
          username = {this.state.username}
          />
        <div>{childrenWithProps}</div>
      </div>
    );
  }
}


export default App;