import React, { Component } from 'react'
import { Link } from 'react-router'

import List from './List';
import Create from './Create';

import './css/App.css';
// import './css/'

export default class Admin extends React.Component {

    render() {
        return (
            <div className='App_container'>
                <Link to='admin/list'><button>Product Catalog</button></Link>
                <Link to='admin/create'><button>Add new product</button></Link>
                {this.props.children}
            </div> 
        );
    }
}
