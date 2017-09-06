import React from 'react';
import axios from 'axios';
import classnames from 'classnames';
import { browserHistory } from 'react-router';


export default class ConfirmPurchase extends React.Component {
	constructor(props){
		super(props);

		this.state = {            
            badstatus : '',
            sum : '0',
            token : '',
            cart : '',
            destination : '',
            isLoading : false,
            errors : {},
            delivery : false
        }
        
        this.onSubmit = this.onSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
        this.validateInput = this.validateInput.bind(this);
    }

    componentWillMount(){
        
        this.setState({ isLoading:true })
        axios.post('/confirm').then(response => {
            if(response.data.address) this.setState({ destination : response.data.address })            
            this.setState( { 
                sum : response.data.purchasesSum,
                isLoading : false }
            )
        });
	}
    
    onChange(e){
        this.setState({[e.target.name] : e.target.value , badstatus:'', errors : {} });
    }

    validateInput(  ){
        var error = {} ;
        if( !this.state.delivery ){
            if(this.state.token === ''){
                error.token = 'token field cant be empty'
                this.setState({ errors : error  })
                return false;
            }
            if(this.state.cart === ''){
                error.cart = 'cart field cant be empty'
                this.setState({ errors : error  })
                return false;
            }
        }else{
            if(this.state.destination === ''){
                error.dest = 'destination field cant be empty'
                this.setState({ errors : error  })
                return false;
            }
        }
        return true;
    }

    onSubmit(e){
        e.preventDefault();
        if( !this.props.isAuth ) {
            browserHistory.push('/login');
            return;
        }
        if( !this.validateInput() ) return ;
        const data = {
            amount : this.state.sum,
            sourceAccount : this.state.cart,
            token : this.state.token
        }

        axios.put('/confirm',data).then( res =>{
                if(res.data.error) {
                    this.setState({ badstatus : res.data.error } )
                }else if( res ){
                    this.setState({ delivery : true})
                }
            }
        )
    }

    goDeliver(){
        if( !this.props.isAuth ) {
            browserHistory.push('/login');
            return;
        }
        if(!this.validateInput() ) return ;
        this.setState({ isLoading : true})
        axios.put(`/confirm/${this.state.destination}`).then( res=>{
            var res = res.data.trackcode ? 'Your trackcode : '+res.data.trackcode : res.data.error;
            this.setState({ badstatus : res, isLoading : false })
        })
    }


	render() {

    const { badstatus , sum , destination, errors , token, cart} = this.state;
    const delivery = (  <div>
                        <div className={classnames("form-group")}>
                        <label className="control-label">Destination : </label>
                        <input className="form-control"
                            value={destination}
                            onChange={this.onChange}
                            type="text"
                            name="destination"/>
                        { errors.dest && <span className="text-danger">{errors.dest}</span>}
                      </div>
                      <button disabled={this.state.isLoading} className="btn btn-primary " onClick={this.goDeliver}>
                        Confirm
                      </button>
                      </div>
                    );


        return (
    <div class="container">  	
        <div className="row">
            <div className="col-md-4 col-md-offset-5">
                <h3>Fill the form :</h3>
            </div>
        </div>

        <div className="row">
            <div className="col-md-4 col-md-offset-4">
                    { badstatus && <h4> <p class="text-danger">{badstatus}</p></h4>}
                <div>
                    <form >
                        { this.state.delivery ? delivery :
                        <div>
                        <div className={classnames("form-group",{'has-error': errors.token })}>
                            <label className="control-label">Bank token : </label>
                            <input className="form-control"
                                value={ token}
                                onChange={this.onChange}
                                type="text"
                                name="token"/>
                            { errors.token && <span className="text-danger">{ errors.token }</span>}
                        </div>

                        <div className={classnames("form-group",{'has-error' : errors.cart })}>
                            <label className="control-label">Cart number : </label>
                            <input className="form-control"
                                value={ cart}
                                onChange={this.onChange}
                                type="text"
                                name="cart"/>
                            { errors.cart &&<span className="text-danger">{errors.cart}</span>}
                        </div>

                        <div className={classnames("form-group")}>
                            <label className="control-label">Sum : {sum}</label>
                        </div>
                        
                        <div className="form-group">
                            <button disabled={this.state.isLoading} className="btn btn-primary " onClick={this.onSubmit}>
                                Confirm
                            </button>
                            <span>  </span><span>  </span>
                            <button disabled={this.state.isLoading} className="btn " onClick={()=>browserHistory.push('shoppingcart')}>
                                Cancel
                            </button>
                        </div>
                         </div>   }
                    </form>
                </div>
            </div>
        </div>
    </div>

		);
	}
}
