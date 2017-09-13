import React from 'react';
import { Link } from 'react-router';

export default class ItemsPage extends React.Component {

    render() {
      const price = this.props.item.price;
      let curPrice = (price % 100 === 0) ? price/100+'.00 $': price/100+' $';
      
      return (
        <div className="snip1423" key={this.props.item._id}>
              <ui className=" list-group">

                <li class="list-group-item">

                  <img src={this.props.item.img[0]} height="120" width="160"/>
                </li>

                <li class="list-group-item" style={{ height:'130px', paddingTop: '6px' }} >
                  <Link to={`/item/${this.props.item._id}`} >
                    <h3 className="panel-title">{this.props.item.title}</h3>
                  </Link>
                </li>

                <li class="list-group-item">
                    { this.props.item.accessible ? <h3>{ curPrice }</h3> : <h4>---</h4>}
                </li>

              </ui>              
              <i className="ion-android-cart" onClick={this.props.addToCart}></i>              
        </div>
  		);
  	}
  }
