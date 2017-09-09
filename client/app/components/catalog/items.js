import React from 'react';
import { Link } from 'react-router';

export default class ItemsPage extends React.Component {

    render() {
      
      return (
        <div className="snip1423" key={this.props.item._id}>
              <ui className=" list-group">

                <li class="list-group-item">

                  <img src={this.props.item.img[0]} height="120" width="160"/>
                </li>

                <li class="list-group-item" style={{ height:'27%', paddingTop: '6px' }} >
                  <Link to={`/item/${this.props.item._id}`} >
                    <h3 className="panel-title">{this.props.item.title}</h3>
                  </Link>
                </li>

                <li class="list-group-item">
                    <h4>{this.props.item.price/100} $</h4>  
                </li>

              </ui>              
              <i className="ion-android-cart" onClick={this.props.addToCart}></i>              
        </div>
  		);
  	}
  }
