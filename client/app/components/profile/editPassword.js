import React from 'react';
import axios from 'axios';
import {browserHistory} from 'react-router';
import Validator from 'validator'



export default class Editpassword extends React.Component {
	constructor(props){
		super(props);

		this.state = {            
            oldPassword:'',
            newPassword: '',
            newPasswordConfirmation:'',
            message : '',
            loading : false
        }
        this.onSubmit = this.onSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
        this.validate = this.validate.bind(this)
    }
    
    onChange(e){
        this.setState({[e.target.name]:e.target.value});
    }

    validate( data ){
        if( Validator.isEmpty(data.oldPassword+'') ){
            this.setState({ message : 'old password field cant be empty'})
            return false;
            }
        if( Validator.isEmpty(data.newPassword+'') ){
                this.setState({ message : 'password field cant be empty'})
                return false;
            }
        if(!Validator.equals(data.newPassword+'', data.newPasswordConfirmation+'')){
            this.setState({ message : 'password dont match'})
            return false;
        }
        this.setState({ message : ''})
        return true;
    }
    onSubmit(e){
        e.preventDefault();
        let res = this.validate(this.state);
        if( res ){
            this.setState({ loading : true})
            axios.post('/editpassword', this.state)
                 .then( res => res.data._id ? 'saved' : res.data )
                 .then ( mes => this.setState({ message : mes, loading : false }) )
        }
    }

	componentWillMount(){
        if(!this.props.isAuth)
        {
            browserHistory.push('/login');   
            return;          
        }
	}

	render() {
        const { loading, message } = this.state;

        return (
            <div class="container">
                <div className="raw">
                    <div className="col-md-4 col-md-offset-5">
                        <h3>Edit password</h3>
                    </div>
                    <div className="col-md-6 col-md-offset-5">
                        {message && <p className = "text-danger"><h5> {message} </h5></p>}
                    </div>
                    <div className="col-md-9 col-md-offset-1 personal-info">
                        
                        <form className="form-horizontal" >

                            <div className="form-group">
                                <label className="col-lg-4 control-label text-right">Old password :</label>
                                <div className="col-lg-6">
                                <input className="form-control" 
                                    type="password" 
                                    name="oldPassword"
                                    value={this.state.oldPassword}
                                    onChange={this.onChange}
                                />
                                
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="col-lg-4 control-label text-right">New password:</label>
                                <div className="col-lg-6">
                                <input className="form-control" 
                                    type="password" 
                                    name="newPassword"
                                    value={this.state.newPassword}
                                    onChange={this.onChange}
                                />
                                </div>
                            </div>
                        
                            <div className="form-group">
                                <label className="col-lg-4 control-label text-right">Confirm new password:</label>
                                <div className="col-lg-6">
                                <input className="form-control"
                                        type="password" 
                                        name="newPasswordConfirmation"
                                        value={this.state.newPasswordConfirmation}
                                        onChange={this.onChange}
                                />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label className="col-md-4 control-label"></label>
                                <div className="col-md-6">
                                <button  className="btn btn-primary"  disabled ={loading} onClick={this.onSubmit} >Save</button>
                                </div>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        );
	}
}
