import React from 'react';
import ReactDOM from 'react-dom';
import InputRange from 'react-input-range';
import axios from 'axios'

export default class SearchProp extends React.Component {
  constructor(props) {
   super(props);

   this.state = {
        props:[],
        max: 1,
        min : 0,
        price: {
            min: 0,
            max: 1,
          }
        }
 }

 componentWillMount (){
   axios.post('/itemprices').then( response => {
      let curPrice = {
        min : response.data.min/100,
        max : response.data.max/100
      }
      this.setState({ price: curPrice, max: curPrice.max, min: curPrice.min })
    }
  ).catch( err => console.log(err.message))
 }

 render() {
    var handleToPriceUpdate  =   this.props.handleToPriceUpdate;
   return (
   <div>
        <form className="form">
          <InputRange draggableTrack={true}
                      maxValue={this.state.max}
                      minValue={this.state.min}
                      onChange={value => this.setState({ price: value })}
                      onChangeComplete={value => handleToPriceUpdate(value)}
                      value = {this.state.price} />
        </form>
     </div>
   );
 }
}
