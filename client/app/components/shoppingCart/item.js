import React from 'react';
import {Link} from 'react-router';


export default class ItemView extends React.Component {
	constructor(props){
        super(props);
        this.state ={
            desc :''
        }
        this.onChange = this.onChange.bind(this);
    }

    onChange(e){
        if(e.target.value>0){
            this.props.countAmount(this.props.id, e.target.value);
        }  
    }

    componentWillMount(){

        var desc = this.props.item.desc ? this.props.item.desc.slice(0,110) : '';
        this.setState({ desc : desc.concat('...') })
    }

    formatPrice( price){
        return (price % 100 === 0) ? price/100+'.00': price/100;    
    }
    
    render(){
        const item = this.props.item;
        const itemCost = item.costWithDisc ? <div>
                            <span className="glyphicon glyphicon-usd" />
                            <strong style={{fontSize:'19px'}} > {this.formatPrice(item.costWithDisc)}</strong>
                        </div> 
                        : <div>
                        <span className="glyphicon glyphicon-usd" />
                        <strong style={{fontSize:'19px'}}> {this.formatPrice(item.cost)}</strong>
                        </div> ;

        let itemAccessible = item.accessible ?<input type="Number" 
                                                    name="amount"
                                                    className="form-control"  
                                                    onChange={this.onChange}    
                                                    value={this.props.item.quantity}/>
                                              : <label>not availiable</label>

        return(
            <tr>
                <td className="col-sm-8 col-md-6">
                    <div className="media">
                        
                        {this.props.checkOut ? 
                        <a className="thumbnail pull-left" > <img className="media-object"  src={item.img[0]} height="50" width="90"/> </a>:
                        <a className="thumbnail pull-left" > <img className="media-object" src={item.img[0]} height="90" width="120"/> </a>
                        }
                        <div className="media-body">
                            <p> </p>
                            <Link to={`/item/${item._id}`}>
                            <h3 className="media-heading">
                            {item.title}
                            </h3>
                        { this.props.checkOut===true ? <h2></h2> : <h5 className="media-heading"> {this.state.desc}</h5>}
                            </Link>
                        </div>
                    </div>
                </td>

                <td className="col-sm-1 col-md-1 text-center" >
                <p> </p>
                {this.props.checkOut ? <div className="media-body"><h4 className="media-heading">{item.quantity}</h4></div>
                                     : itemAccessible }
            
                </td>
            
            <td className="col-sm-1 col-md-2 text-center">
                <p> </p>
                { item.priceWithDisc ? <div><span className="glyphicon glyphicon-usd" />
                                        <strong style={{color:'#fb515d',fontSize:'19px'}} >
                                           {this.formatPrice(item.priceWithDisc)}
                                        </strong>
                                      <p><span className="glyphicon glyphicon-usd" /> 
                                          <del>
                                          {this.formatPrice(item.price)}
                                          </del>
                                      </p>
                                      </div>
                                    : <div><span className="glyphicon glyphicon-usd" /> 
                                            <strong style={{fontSize:'19px'}}> {this.formatPrice(item.price)}</strong> 
                                      </div>
                }
            </td>

            <td className="col-sm-1 col-md-2 text-center">
                <p></p>
                { item.accessible === true ? itemCost : <label>-</label> }

            </td>

            { this.props.checkOut ? <td></td>:
                <td className="col-sm-1 col-md-1 text-center">
                    <p> </p>                    
                    <button type="button" className="btn btn-danger"  onClick={this.props.deleteItem}>
                        <span className="glyphicon glyphicon-remove" ></span>
                    </button>
                </td>
            }
        </tr>


        );
    }

}