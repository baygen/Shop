import React from 'react';
import axios from 'axios';
import {browserHistory } from 'react-router';
import Item from '../item';
import {dialog} from 'alertify-webpack'

function dateFormatter( cell, del ){
    var date=' ';
    if(del){
        date += "After "+cell.slice(11,13)+':00 ';
    }else{
        date += cell.slice(11,13)+':'+cell.slice(14,16)+' ';
    }
    date += cell.slice(8,10) + '/'+cell.slice(5,7)+'/'+cell.slice(0,4);
    return date;
  }

export default class PurchaseDetailes extends React.Component {
    constructor(props){
        super(props);
        this.state = {
                cart: {},
                isLoading : false
            }
        this.orderDelivery = this.orderDelivery.bind(this);
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
        let id = this.state.cart._id;
        dialog.prompt('Type destination'
                , (input)=>{
                    this.setState({ isLoading: true})
                    axios.put(`/confirmdeliver/${input}`, {id : id}
                        ).then( response =>{
                            console.log(response.data)
                            if (response.data.track ){
                             dialog.alert("Success order");
                                this.componentWillMount();
                            }
                            this.setState({ isLoading: false})
                            // response.error ? response.error : 'Success';
                            if (response.data.error ){
                            dialog.alert(response.data.error)
                            this.orderDelivery()}
                        })
                },()=>{}
        )
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
                                <strong>Purchase date : </strong>
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
                            { cart.delivery ? <th className="text-center">Arrival time :</th> : <th> </th>}
                            { cart.delivery ? <th className="text-center"> {dateFormatter(cart.delivery.arrivedTime, true) }</th> 
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
                            <th className="text-center"><h3><strong>$ {cart.purchasesSum%100===0 ?cart.purchasesSum/100+'.00' : cart.purchasesSum/100 }</strong></h3></th>
                        </tr>
                        
                    </tbody>
                </table>}
            </div> 
            
            </div>
        </div> 
        );
        
      }
}
