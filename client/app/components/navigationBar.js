import React from 'react';
import {Link} from 'react-router';

export default class NavigationBar extends React.Component{

    render(){
      const notLogged=(
        <ul className="nav navbar-nav navbar-right">
        <li><Link to="/login"><strong>Hi {this.props.username} !</strong></Link></li>    
        <li><Link to="/signup"><strong>Sign up</strong></Link></li>
        <li><Link to="/login"><strong>Login</strong></Link></li>
        </ul>
      );

      const logged = (
        <ul className="nav navbar-nav navbar-right">
        <li><Link to="/profile"><strong>Hi, {this.props.username}!</strong></Link></li>  
        <li><Link to="/shoppingcart"><strong><span className="glyphicon glyphicon-shopping-cart"></span> Shopping cart</strong></Link></li>
        <li><Link to="/shoppinghistory"><strong><span className="glyphicon glyphicon-list"></span> History</strong></Link></li>
        <li onClick={this.props.logout()}><Link to='/login'><strong>Logout</strong></Link></li>
     </ul>
      )

     return  (
     <nav className="navbar navbar-default bg-inverse " style= {{ backgroundColor : 'rgba(0, 220, 255, 0.5)'}}>
        <div className="container-fluid">
          <div className="navbar-header">
            <Link to="/" className="navbar-brand"><strong>ES Shop</strong></Link>
          </div>
          
          <div className="collapse navbar-collapse">
          { this.props.isAuth ? logged : notLogged }
          </div>
        </div>
      </nav>
    );
    }
}