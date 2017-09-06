import React from 'react';
import axios from 'axios';
import {browserHistory} from 'react-router';
import Item from '../item'

export default class PurchaseDetailes extends React.Component {
    constructor(props){
        super(props);
        this.state = {
                cart: {},
                isLoading : false
            }
      }
    
      componentWillMount(){
         let id = this.props.id ? this.props.id : this.props.params.id;
         console.log(id)
            this.setState({isLoading : true})
            axios.post(`/shoppinghistory/${id}`).then(response =>{
                if(response.data) this.setState({ cart : response.data });
                this.setState({ isLoading : false})
            })     
      }
    

    
      render() {
        const{ cart , isLoading } = this.state;
    
        return (
    
        
          <div className="container">
                <div className="row">
                {this.props.isAuth ? 
                    <div className="col-sm-12 col-md-10 col-md-offset-1">
                        
            { isLoading ? <div className="col-sm-12 col-md-10 col-md-offset-5">Loading data... Please wait</div>:

                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th className="text-right" >
                                <strong>Order id : </strong>
                            </th>
                            <th>
                                {cart._id}
                            </th>
                            <th> </th>
                            <th>
                                <button type="button" className="btn btn-default" onClick={()=>browserHistory.push('/shoppinghistory')}>
                                    Back to history
                                </button>    
                            </th>
                        </tr>

                        <tr>
                            <th className="text-right" >
                                <strong>Date : </strong>
                            </th>
                            <th>
                                {cart.date}
                            </th>
                            <th> </th>
                            <th> </th>
                        </tr>

                        <tr>
                            <th className="text-right"><strong>Status : </strong></th>
                            <th>{cart.status} </th>
                            { cart.status == "delivering" ? <th className="text-right"> Finished at:</th> : <th> </th>}
                            { cart.status == "delivering" ? <th className="text-left"> {cart.arrivedDate ? cart.arrivedDate : '12/09/2017'}</th> : <th> </th>}
                        </tr>
                        <tr>
                            <th></th><th></th><th></th><th></th>
                        </tr>

                        <tr>
                            <th>Product</th>
                            <th className="text-center">Quantity</th>
                            <th className="text-center">Price</th>
                            <th className="text-center">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        
                        { cart.items && cart.items.map((item,index) =>
                            <Item key={index}
                            checkOut = {true}
                            id={index}
                            item={item} 
                            />
                              ) 
                        }  
                        <tr>
                            <th>   </th>
                            <th>   </th>
                            <th className="text-right "><h3><strong>Total sum</strong></h3></th>
                            <th className="text-right"><h3><strong>{ cart.purchasesSum } UAH</strong></h3></th>
                        </tr>
                        
                    </tbody>
                </table>}
            </div> 
            : <p>You must be logged <Link to="/login" >Click to login</Link></p>
            }
            </div>
        </div> 
        );
        
      }
}
