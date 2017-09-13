const dbPurchase = require('../db/dbPurchase')
const isLogged = require('../middleWare/isLogged')
    

module.exports = (app) => {

    app.use('/shoppinghistory', isLogged );
   
    app.post('/shoppinghistory', (req,res)=>{
        dbPurchase.findUserHistory(req,res);
    })
    
    app.post('/shoppinghistory/:id', (req,res)=>{
        dbPurchase.findPurchaseById( req , res );
    })
    
    
}