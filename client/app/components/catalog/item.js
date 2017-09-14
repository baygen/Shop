import React from 'react';
import axios from 'axios';
import {log} from 'alertify-webpack';


export default class Item extends React.Component {
  constructor(props){
  super(props);
    this.state = {
      params: this.props.params,
      item : {},
      properties:[]
    }
 }

  componentWillMount(){
    axios.post(`/item/${this.props.params.id}`)
      .then ( res => {this.setState({ item : res.data, properties : res.data.properties });
    })
  }

  addToCart(id){
    if ( !this.props.isAuth) return log.error('You must be logged in store to shopping!');
    
    axios.put(`/shoppingcart/${id}`).then(res=>{
			if(res.data.error){
				log.error('Oops!  Something bad happens...')
			}else{
				log.success('Added to cart!')
			}
		});
  }

  render() {
    const { item , properties} = this.state;

    return (
    
      <div className="panel panel-default">
        <ul class="list-group">

          <li class="list-group-item list-group-item-info" style = {{ backgroundColor : 'rgba(249, 190, 25, 0.28)' }} >
            <div className="row">
              <div className= "col-md-8"> 
                  <h3 style={{ color:'black' }} >
                    <strong>{item.title}</strong>
                  </h3>
              </div>  
              <div className= "col-md-2">
              </div>
              <div className= "col-md-2">
                <div className="panel-heading">
                  { item.accessible ? <button className="btn-success btn-sm" onClick={()=>{this.addToCart(item._id)}}>
                                        <span className="glyphicon glyphicon-shopping-cart" ></span> add
                                      </button> 
                                      : <span/>
                  }
                </div>
              </div>
            </div>
          </li>

          <li className= "list-group-item" >
            <div className = "row">
              <div className= "col-md-4"> 
                {item.img &&<img src={ item.img.splice(0,1)} width="350" height="350" />}  
              </div>
              <div className= "col-md-4"> 
                <strong><h3>Description:</h3></strong>
                <br/>
                {item.desc}
                <br/>
                <h3 className=" text-right" ><strong>{item.accessible ? "Price : "+ (item.price%100===0?item.price/100+'.00':item.price/100)+ '$': "not availiabe"}</strong></h3>
              </div>
              <div className= "col-md-4 text-center"> 
                <strong><h3>Properties:</h3></strong>
                <br/>
                { properties.map( (prop, index )=>
                        (<div key={index} style={{width:'100%'}} >
                          <div  className="row">
                            <div className=" col-md-5 text-right" style={{paddingRight:'1px',paddingLeft:'1px'}}> <strong>{prop.name}:</strong></div>
                            <div className=" col-md-5 text-left" style={{width:'55%',paddingRight:'3px',paddingLeft:'5px'}}>{prop.value}</div>
                          </div>
                        <br></br>
                        </div>
                        ))
                    }
              </div>
            
            </div> 
          </li>
          <li className="list-group-item">
            <div className= "row">
                {item.img && item.img.map( (image, index )=>(
                  <div className="col-md-3" >
                    <img key={index} src={image}  width="250" height="250" />
                  </div>
                )
                )}
            </div>
          </li>
        </ul>
      </div>
    )
  }
}
