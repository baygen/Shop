import React from 'react';
import axios from 'axios';
import classnames from 'classnames';
import { browserHistory } from 'react-router';
import {dialog} from 'alertify-webpack'

export default class ConfirmPurchase extends React.Component {
	constructor(props){
		super(props);

		this.state = {
            purchaseCartId : '',
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
        this.goDeliver = this.goDeliver.bind(this)
    }

    componentWillMount(){
        
        this.setState({ isLoading:true })
        axios.post('/confirm').then(response => {
            response && this.setState( { 
                            destination : response.data.address || '',
                            cart : response.data.bankCart+'' || '',
                            sum : response.data.purchasesSum/100,
                            isLoading : false 
                        })
        })
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
        this.setState({ isLoading : true})
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
                    this.setState({ badstatus : res.data.error, isLoading:false })
                }else if( res ){
                    this.setState({ purchaseCartId : res.data.cartId, isLoading : false
                        },()=>dialog.confirm('Your order is paid! Wish you order delivery?'
                        , () => this.setState( { delivery : true}
                                        ,()=>console.log('input after state') )
                        ,()=> browserHistory.push('/') )
                    );
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
        console.log('goDEliver')
        axios.put(`/confirmdeliver/${this.state.destination}`,{id:this.state.purchaseCartId}).then( res=>{
            console.log(res.data)
            var res = res.data.arrivedTime ? 'Your trackcode : '+res.data.trackcode 
                                                +`.           Arrived time : ${res.data.arrivedtime}`
                                         : res.data.error;
            this.setState({ badstatus : res, isLoading : false })
        })
    }


	render() {

    const { badstatus , sum , destination, errors , token, cart, isLoading} = this.state;
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
                
                <h3>{ this.state.delivery ? 'Type or change address :' : 'Fill the form :' }</h3>
            </div>
        </div>

        <div className="row">
            <div className="col-md-4 col-md-offset-4">
                    <div className="text-center">{isLoading  ? <h4>Please wait ...</h4>:''}
                    { badstatus && <h4> <p class="text-danger">{badstatus}</p></h4>}
                    </div>
                <div>
                { this.state.delivery ? delivery :<form >
                        
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
                            <label className="control-label">Sum : {sum} $</label>
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
                         </div>   
                    </form>}
                </div>
            </div>
        </div>
    </div>

		);
	}
}
