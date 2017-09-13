import React from 'react';
import axios from 'axios';
import Item from './item';
import {browserHistory} from 'react-router';
import isEmpty from 'lodash/isEmpty';


export default class ShoppingCart extends React.Component {
	constructor(props){
		super(props);

		this.state = {
			cartId : '',
			items : [],
			totalSum : 0,
			message :'',
			isLoading : false,
			isUpdating : false,
			discountCode :''
		}
		
		this.goCheckOut = this.goCheckOut.bind(this);
		this.countAmount = this.countAmount.bind(this);
		this.deleteItem = this.deleteItem.bind(this);
		this.updateData = this.updateData.bind(this);
		this.updateDB = this.updateDB.bind(this);
		this.onChange = this.onChange.bind(this)
	}

	onChange(e){
		this.setState({[e.target.name]:e.target.value})
	}
	
	componentWillMount(){
		
		this.setState({isLoading:true});

    	axios.post('/shoppingcart').then(response => {
			const data = response.data.result;
				if(isEmpty(data)){
					this.setState({ message : 'cart is empty' , isLoading : false});
				}else{
					this.setState({ items : data, isLoading : false , cartId : response.data.cartId})
					this.updateData();
				}
			}
		);
		
	}

	deleteItem(index){
		this.setState({ isUpdating : true })		
		var items = this.state.items;
		items.splice(index,1);
		if( items.length == 0 ) this.setState({message : 'cart empty',isUpdating : false})
		this.updateData()		
	}
	
	countAmount(i, newamount){
		this.setState({ isUpdating : true })

		var newitems = this.state.items;
		newitems[i].quantity = +newamount;
		newitems[i].cost = newamount * newitems[i].price;
		
		this.updateData();
		 
	}

	updateData(){
		var total=0;
		const {items} = this.state;
		items.map( (item, index)=>{
			if(item.accessible ){
				item.cost = item.price * item.quantity;
				total += item.cost;
			}else{
				item.cost = 0;
				if(!!item.costWithDisc) item.costWithDisc = 0;
			}
		});
		this.setState({ items : items, totalSum : total }, ()=>this.updateDB() );
	}

	updateDB(){
		axios.put(`/shoppingcart/${this.state.cartId}/${this.state.totalSum}`, this.state.items
		).then( res =>{
			if(res) this.setState({ isUpdating : false })
		})
	}
	
	goCheckOut(){
		if(this.state.discountCode){
			axios.post(`/shoppingcart/${this.state.discountCode}`)
				.then( response => {
					if(response.data) {
						let result = 'Sorry , but '+response.data;
						alert(result)
					}
					browserHistory.push('/checkout')
				})
		}else{
			browserHistory.push('/checkout');
		}

	}
	formatPrice( price){
        return (price % 100 === 0) ? price/100+'.00 $': price/100+' $';    
    }

	render() {
		const{items, message, isLoading, isUpdating}=this.state;

		if(!isLoading){
		if(message){
			return(
		        <div className="col-sm-12 col-md-4 col-md-offset-5">
					<h2>Your cart is empty.</h2>
					<br/>
					<label style={{ marginLeft : '15px'}} ></label>
					<button type="button" className="btn btn-default" onClick={()=>browserHistory.push('/')}>
                		<span className="glyphicon glyphicon-shopping-cart" ></span> Continue Shopping
            		</button>
					
				</div>
			);
		}else{
		return (
		<div className="container">
		    <div className="row">
        		<div className="col-sm-12 col-md-10 col-md-offset-1">
					<div className="row text-center" >
						<div className=" col-md-3 col-md-offset-4">
						<h2 style={{ marginTop : "0px", marginBottom:" 2px"}} >
							<strong>
								Shopping cart
							</strong>
						</h2>
						</div>
						<div className = "col-md-2 text-right" 
							style={{marginTop:'8px',color:'red',paddingRight:'0px'}} >
							Discount code :
						</div>
						<div className=" col-md-3 text-left">
								
							<input className="form-control"
								value={this.state.discountCode}
								onChange={this.onChange}
								type="text"
								name="discountCode"/>
						</div>
					</div>
			<br/>
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th className="text-center">Quantity</th>
                        <th className="text-center">Price</th>
                        <th className="text-center">Cost</th>
                        <th> </th>
                    </tr>
                </thead>
                <tbody>
					
					{items && items.map((item,index) =>
						<Item key={index}
						id={index}
						item={item} 
						deleteItem = {()=>this.deleteItem(index)}
						countAmount = {this.countAmount}
						/>
			  			) 
			    	}  
                    <tr>
                        <th>   </th>
                        <th>   </th>
                        
                        <th className="text-right"><h3></h3></th>
                        <th className="col-md-3 text-left">
							<h3> <strong>Total :</strong> 			
								
								<strong className="text-center" style={{fontSize:'26px',marginLeft:'4px'}}>
									{this.formatPrice(this.state.totalSum)}
								</strong>
							</h3>
						</th>
						<th>   </th>
                    </tr>
                    <tr>
                        <th>   </th>
                        <th>   </th>
                        <th>   </th>
                        <th>
                        <button type="button" className="btn btn-default" onClick={()=>browserHistory.push('/')}>
                            <span className="glyphicon glyphicon-shopping-cart" /> Continue Shopping
                        </button></th>
                        <th>
                        <button type="button" disabled={isUpdating} className="btn btn-success" onClick={this.goCheckOut}>
                            Checkout <span className="glyphicon glyphicon-play"></span>
                        </button></th>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
		);}
	}else{
		return (<div className="col-sm-12 col-md-10 col-md-offset-5">
		<h2>Content is loading...</h2>
		
	</div>);
	}
	}
}

