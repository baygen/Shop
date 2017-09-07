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
    browserHistory.push('/confirm')
  }

  render() {
    const{items , isLoading } = this.state;

    return (

    
      <div className="container">
		    <div className="row">
            
                <div className="col-sm-12 col-md-10 col-md-offset-1">
                    
        { isLoading ? <div className="col-sm-12 col-md-10 col-md-offset-5">Loading data... Please wait</div>:
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
						item.accessible &&
                        <Item key={index}
						checkOut = {true}
						id={index}
						item={item} 
						/>
			  			) 
			    	}  
                    <tr>
                        <td>   </td>
                        <td>   </td>
                        <td className="text-right "><h3><strong>Total cost :</strong></h3></td>
                        <td className="text-center">
                            <h3><span className="glyphicon glyphicon-usd" />
                                <strong style={{fontSize:'26px'}}>{this.state.purchasesSum/100}</strong>
                            </h3>
                        </td>
                        <td>   </td>

                    </tr>
                    <tr>
                        <th>   </th>
                        <th>   </th>
                        <th>
                        <button type="button" className="btn btn-default" onClick={()=>browserHistory.push('/')}>
                            <span className="glyphicon glyphicon-shopping-cart" ></span> Continue Shopping
                        </button>
                        </th>
                        <th className="text-center">
                        <button type="button" className="btn btn-success" onClick={this.confirmPurchase} >
                            Buy <span className="glyphicon glyphicon-play"></span>
                        </button></th>
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