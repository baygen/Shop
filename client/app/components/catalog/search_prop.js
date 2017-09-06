import React from 'react';
import ReactDOM from 'react-dom';
import InputRange from 'react-input-range';

export default class SearchProp extends React.Component {
  constructor(props) {
   super(props);

   this.state = {
        props:[],
        max: 300000,
        min : 0,
        price: {
            min: 0,
            max: 300000,
          }
        }
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
