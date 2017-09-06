import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';


export default class Value extends React.Component {
  constructor(prop) {
   super(prop);
   this.state = {
     props:[],
     value:[]
     }

  };

   getValue(prop,k){
      axios.get(`/value?prop=`+prop)
        .then(response => this.setState({ value : response.data}))
   }

   componentDidMount(){
     this.getValue(this.props.prop);
   }

   onChange(value, prop,check) {
      return (event) => {
        if(event.target.checked){
          this.props.handlePropsAdd( prop.props, value.value );
        }else{
          this.props.handlePropsRemove( prop.props, value.value );
        }
      }}

   render() {
     var props = this.props.prop;

     return (
       <div>
        {this.state.value.map( value => 
        <div key={value} >
            <input type="checkbox"  
              name={props} 
              value={value} 
              onChange={this.onChange({value},{props})}
              /> 
              <span> </span>

              {value}              
              </div> 
              )
        }
        </div>


  )}
  }
