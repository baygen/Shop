import React from 'react';
import axios from 'axios';
import {browserHistory } from 'react-router';
import Item from '../item';
import {dialog} from 'alertify-webpack'

function dateFormatter( cell ){
    var date=' ';
    date += cell.slice(8,10) + '/'+cell.slice(5,7)+'/'+cell.slice(0,4);
    date += " "+cell.slice(11,13)+':'+cell.slice(14,16);
    
    return date;
  }

export default class PurchaseDetailes extends React.Component {
    constructor(props){
        super(props);
        this.state = {
                cart: {},
                isLoading : false
            }
        
      }
    
    componentWillMount(){
        let id = this.props.id || this.props.params.id;
        this.setState({isLoading : true})

        axios.post(`/shoppinghistory/${id}`)
        .then(response =>{
            if(response.data) this.setState({ cart : response.data });
            this.setState({ isLoading : false})
        })     
    }
    
    orderDelivery(){
        dialog.prompt('Type destination'
                , (input)=>{
                    // axios.put(`/confirm/${input}`
                    //     ).then( response =>{
                            let message = 'succes';
                            // response.error ? response.error : 'Success';
                            dialog.alert(message+" "+input);
                            if(message != 'success') this.orderDelivery();
                        // })
                },()=>{}
        )
        console.log(this.state.cart._id)

    }
    
    render() {
        const{ cart , isLoading } = this.state;
    
        return (
            <div className="container">
                <div className="row">
                
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
                                {dateFormatter(cart.date)}
                            </th>
                            <th> </th>
                            <th> </th>
                        </tr>

                        <tr>
                            <th className="text-right"><strong>Status : </strong></th>
                            <th style={{ color:'red'}}>{cart.status.toUpperCase()} </th>
                            { cart.delivery ? <th className="text-right">Arrived time:</th> : <th> </th>}
                            { cart.delivery ? <th className="text-left"> {dateFormatter(cart.delivery.arrivedDate) }</th> 
                                            : cart.status === 'paid' ? <th>
                                                                            <button className="btn btn-info" onClick={this.orderDelivery.bind(this)}>
                                                                                Order Delivery
                                                                            </button> 
                                                                       </th>
                                                                      : <th> </th>}
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
                            <Item key = {index}
                            checkOut = {true}
                            id={index}
                            item={item} 
                            />
                              ) 
                        }  
                        <tr>
                            <th>   </th>
                            <th>   </th>
                            <th className="text-right"><h3><strong>Total sum</strong></h3></th>
                            <th className="text-center"><h3><strong>$ {cart.purchasesSum/100}</strong></h3></th>
                        </tr>
                        
                    </tbody>
                </table>}
            </div> 
            
            </div>
        </div> 
        );
        
      }
}
