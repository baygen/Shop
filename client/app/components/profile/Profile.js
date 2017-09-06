import React from 'react';
import axios from 'axios';
import classnames from 'classnames';
import {browserHistory} from 'react-router';


export default class Profile extends React.Component {
	constructor(props){
		super(props);

		this.state = {            
            name : '',
            phone : '',
            email : '',
            address : '',
            saved : '',            
            loading : false
        }
        this.onSubmit = this.onSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
    }
    
    onChange(e){
        this.setState({[e.target.name]:e.target.value});
    }

    onSubmit(e){
        e.preventDefault();
        this.setState({ loading : true})        
        axios.put('/profile',this.state).then( response=>{
            if(response.data._id){
                this.setState({ saved:'Changes are saved!', loading : false});
                this.props.login(this.state.name);
            }else{  
                this.setState({saved:"This email already exist, try another", loading : false});
            }
        }).catch(err=>{
            this.setState({saved:err});
        })
    }

	componentWillMount(){
        
        this.setState({ loading : true})
        axios.post('/profile').then(response => {
                const user = response.data;
                if(user._id){
                this.setState({
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    address : user.address ? user.address : '',
                    loading : false
                });}
        });
        
	}

	render() {
        const { saved}=this.state;
        
            return (
    <div class="container">  	

	<div className="row">
    <div className="col-md-2 col-md-offset-5">
            <h3>Personal info</h3>
        </div>
      <div className="col-md-8 col-md-offset-2 personal-info">
      {saved && <div className="alert alert-success alert-dismissible" role="alert"><h4 className="col-md-offset-5">{saved}</h4></div>}
      <div class="jumbotron">
        <form className="form-horizontal" role="form" >
          <div className="form-group">
            <label className="col-lg-3 control-label">Name/Nickname :</label>
            <div className="col-lg-8">
              <input className="form-control" 
              type="text" 
              name="name"
              value={this.state.name}
              onChange={this.onChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="col-lg-3 control-label">Phone :</label>
            <div className="col-lg-8">
            <input className="form-control" 
              type="text" 
              name="phone"
              value={this.state.phone}
              onChange={this.onChange}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="col-lg-3 control-label">Email :</label>
            <div className="col-lg-8">
            <input className="form-control"
              type="text" 
              name="email"
              value={this.state.email}
              onChange={this.onChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="col-lg-3 control-label">Address :</label>
            <div className="col-lg-8">
            <input className="form-control"
              type="text" 
              name="address"
              value={this.state.address}
              onChange={this.onChange}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="col-md-3 control-label"></label>
            <div className="col-md-8">
              <button  className="btn btn-primary" onClick={this.onSubmit} disabled= {this.state.loading}>Save changes</button>
              <span>   </span>
              <button type="reset" class="btn btn-default" disabled= {this.state.loading}>Reset</button>
              <span>   </span>
              <span>   </span>
              <button  class="btn btn-default" onClick={()=>browserHistory.push('editpassword')} disabled= {this.state.loading}>Change Password</button>
            </div>

          </div>
        </form>
        </div>

      </div>
  </div>
</div>

		);
	}
}
