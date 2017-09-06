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
			isUpdating : false
		}
			
		this.countAmount = this.countAmount.bind(this);
		this.deleteItem = this.deleteItem.bind(this);
		this.updateData = this.updateData.bind(this);
		this.updateDB = this.updateDB.bind(this)
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
		newitems[i].cost = newamount*newitems[i].price;
		
		this.updateData();	
		 
	}

	updateData(){
		var total=0;
		const {items} = this.state;
		items.map((item, index)=>{
			item.cost = item.price*item.quantity;
			total += item.cost;
		});
		this.setState({items : items, totalSum : total }, ()=>this.updateDB() );
	}

	updateDB(){
		axios.put(`/shoppingcart/${this.state.cartId}/${this.state.totalSum}`, this.state.items
		).then( res =>{
			if(res) this.setState({ isUpdating : false })
		})
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
						<h2 style={{ marginTop : "0px", marginBottom:" 2px"}} >
							<strong>
								Shopping cart
							</strong>
						</h2>
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
					
					{items&&items.map((item,index) =>
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
                        <th>   </th>
                        <th><h3>Total</h3></th>
                        <th className="text-right"><h3><strong>{this.state.totalSum} UAH</strong></h3></th>
                    </tr>
                    <tr>
                        <th>   </th>
                        <th>   </th>
                        <th>   </th>
                        <th>
                        <button type="button" className="btn btn-default" onClick={()=>browserHistory.push('/')}>
                            <span className="glyphicon glyphicon-shopping-cart" ></span> Continue Shopping
                        </button></th>
                        <th>
                        <button type="button" disabled={isUpdating} className="btn btn-success" onClick={()=>browserHistory.push(`/checkout`)}>
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

