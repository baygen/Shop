import React from 'react';
import { Route, IndexRoute } from 'react-router';


import HomePage from './components/catalog/main_block';
import App from './components/App';
import SignUpPage from './components/signup/SignUpPage';
import LoginPage from './components/login/LoginPage';
import Profile from './components/profile/Profile';
import EditPassword from './components/profile/editPassword';
import ShoppingCart from './components/shoppingCart/ShoppingCart';
import CheckOut from './components/shoppingCart/checkout/checkOut'
import ConfirmPurchase from './components/shoppingCart/checkout/confirmPurchase'
import TableHistory from './components/shoppingCart/shoppingHistory/tableHistory'
import PurchaseDetailes from './components/shoppingCart/shoppingHistory/purchaseDetailes'
import NotFound from './components/notFound'


import Item from './components/catalog/Item';

export default (
    <div>
    <Route path="/" component={App}>
          <IndexRoute component={HomePage}/>  
          <Route path="signup" component={SignUpPage} />  
          <Route path="login" component={LoginPage} />   
          <Route path="profile" component={Profile} />
          <Route path="editpassword" component={EditPassword} />   
          <Route path="item/:id" component={Item} />
          <Route path="shoppingcart" component={ShoppingCart} />
          <Route path="shoppinghistory" component={TableHistory} />
          <Route path="shoppinghistory/:id" component={PurchaseDetailes} />
          <Route path="checkout" component={CheckOut}/>
          <Route path="confirm" component={ConfirmPurchase} />
          <Route path="*" component={NotFound}/>
    </Route>
    </div>
)
