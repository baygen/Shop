const dbPurchase = require('../db/dbPurchase')
const isLogged = require('../middleWare/isLogged')


module.exports = (app) => {

    app.use('/shoppingcart', isLogged );

    app.post('/shoppingcart', (req,res )=>
        dbPurchase.getShoppingCart(req,res)
    );

    app.post('/shoppingcart/:discontcode', (req,res)=>
        dbPurchase.setDiscountToCart( req, res)
    )

    app.put('/shoppingcart/:id', (req,res)=>
        dbPurchase.addItemToShoppingCart(req,res)
    );

    app.put('/shoppingcart/:cartId/:totalSum', isLogged, (req,res)=>
        dbPurchase.setNewItems(req,res)
    )

}