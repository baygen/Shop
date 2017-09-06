const dbPurchase = require('../db/dbPurchase')
const isLogged = require('./isLogged')


module.exports = (app) => {

    app.use('/shoppingcart', isLogged );

    app.post('/shoppingcart', (req,res, next)=>
        dbPurchase.getShoppingCart(req,res, next)
    );

    app.put('/shoppingcart/:id', (req,res)=>
        dbPurchase.addItemToShoppingCart(req,res)
    );

    app.put('/shoppingcart/:cartId/:totalSum', isLogged, (req,res)=>
        dbPurchase.setNewItems(req,res)
    )

}