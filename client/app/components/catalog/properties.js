import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import Value from 'components/catalog/prop_value'

export default class Properties extends React.Component {
  constructor(props) {
   super(props);
   this.state = {
     props:[],
     value:[]
     }
   };

  getProp(){
     axios.get(`/props`).then( response =>  this.setState({ props : response.data }) );
  }

  getValue(prop,k){

    axios.get(`/value?prop=`+prop).then(response =>{
      var joined = this.state.value.concat(response.data);
      console.log('getValue( prop, k ) in propertes',joined);
      return this.setState({ value : joined })
    })
  }

  componentDidMount(){
    this.getProp();
  }

 render() {
   var props = this.state.props;
   var handlePropsAdd = this.props.handlePropsAdd;
   var handlePropsRemove = this.props.handlePropsRemove;
   return (
     <div className="list-group" >
          { props.map((prop,key)=>{
            return <div key={key}  >

              <p className="list-group-item list-group-item-info"><strong>{prop} : </strong></p>
              <div className="list-group-item">
                <Value handlePropsAdd={handlePropsAdd} handlePropsRemove={handlePropsRemove} prop={prop}/>
              </div>
            </div>
            }
        )}
      
    </div>
)}
}
