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
            errors : {}
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

    validateInput(){
        console.log('valid input')
        var error = {} ;

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
        if(this.state.destination === ''){
            error.dest = 'destination field cant be empty'
            this.setState({ errors : error  })
            return false;
        }
        console.log(!!error)
        return true;
    }

    onSubmit(e){
        e.preventDefault();
        if( !this.validateInput() ) return ;
        const data = {
            amount : this.state.sum,
            // hard coded must be: this.state.cart
            sourceAccount : '5291044803410187',
            token : '1koVlRSV7rIigQW7'
            // this.state.token
        }

        axios.put('/confirm',data).then( res =>{
                if(res.data.error) {
                    this.setState({ badstatus : res.data.error } )
                }else if( res ){
                    browserHistory.push('/')
                }
            }
        )
    }



	render() {

    const { badstatus , sum , address, errors } = this.state;
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
                        
                        <div className={classnames("form-group",{'has-error': errors.token })}>
                            <label className="control-label">Bank token : </label>
                            <input className="form-control"
                                value={this.state.token}
                                onChange={this.onChange}
                                type="text"
                                name="token"/>
                            { errors.token && <span className="text-danger">{ errors.token }</span>}
                        </div>

                        <div className={classnames("form-group",{'has-error' : errors.cart })}>
                            <label className="control-label">Cart number : </label>
                            <input className="form-control"
                                value={this.state.cart}
                                onChange={this.onChange}
                                type="text"
                                name="cart"/>
                            { errors.cart &&<span className="text-danger">{errors.cart}</span>}
                        </div>

                        <div className={classnames("form-group")}>
                            <label className="control-label">Destination : </label>
                            <input className="form-control"
                                value={this.state.destination}
                                onChange={this.onChange}
                                type="text"
                                name="destination"/>
                            { errors.dest && <span className="text-danger">{errors.dest}</span>}
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
                    </form>
                </div>
            </div>
        </div>
    </div>

		);
	}
}
