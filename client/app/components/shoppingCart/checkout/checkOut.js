import React from 'react';
import {browserHistory} from 'react-router'
import axios from 'axios';
import Item from '../item'


class CheckOut extends React.Component {

  constructor(props){
    super(props);
    this.state = {
            items : [],
            totalDiscount : 0,
			purchasesSum : 0,
			isLoading : false
		}
        this.confirmPurchase = this.confirmPurchase.bind(this)
  }

  componentWillMount(){
      
        this.setState({isLoading : true})
        axios.post(`/checkout`).then(response =>{
            if(response.data.items){
                var data = response.data;
                this.setState({
                    items : data.items, 
                    isLoading : false,
                    purchasesSum : data.purchasesSum,
                    totalDiscount : data.discountSum
                    });
            }
        })     
  }


  confirmPurchase(){
      if(this.state.items.length !== 0)
    browserHistory.push('/confirm')
  }

  render() {
    const{items , isLoading ,purchasesSum} = this.state;

    return (

    
      <div className="container">
		    <div className="row">
            
                <div className="col-sm-12 col-md-10 col-md-offset-1">
                    
        { isLoading ? <div className="col-sm-12 col-md-10 col-md-offset-5">Loading data... Please wait</div>:
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th className="text-center">
                            <button className="btn btn-default" type='button' onClick={()=>browserHistory.push('/shoppingcart')}>
                                Back to cart
                            </button>
                        </th>
                    </tr>
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
						checkOut = {true}
						id={index}
						item={item} 
						/>
			  			) 
			    	}  
                    <tr>
                        <td>   </td>
                        <td> <h3>
                            <button type="button" className="btn btn-default" onClick={()=>browserHistory.push('/')}>
                                <span className="glyphicon glyphicon-shopping-cart" ></span> Continue Shopping
                            </button>
                            </h3>
                        </td>
                        <td className="text-right "><h3><strong>Total cost :</strong></h3></td>
                        <td className="text-center">
                            <h3><span className="glyphicon glyphicon-usd" />
                                <strong style={{fontSize:'26px'}}>{purchasesSum%100 === 0 ? purchasesSum/100+'.00':purchasesSum/100}</strong>
                            </h3>
                        </td>
                        <td><h3 style={{ marginTop:'15px'}}>
                            <button type="button" className="btn btn-success" onClick={this.confirmPurchase} >
                                Buy <span className="glyphicon glyphicon-play"></span>
                            </button>
                            </h3>
                        </td>

                    </tr>
                    <tr>
                        <th>   </th>
                        <th>   </th>
                        <th>
                        
                        </th>
                        <th className="text-center">
                        </th>
                        <th>   </th>
                    </tr>
                </tbody>
            </table>}
            </div> 
        </div>
    </div> 
    );
    
  }
}

export default CheckOut;