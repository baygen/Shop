const dbPurchase = require('../db/dbPurchase')
const isLogged = require('./isLogged');
const config = require('../config')
const axios = require('axios')

var confirm = (req , res, next)=>{
    res.redirect('/checkout')
}

module.exports = (app) => {
    
    app.use('/checkout', isLogged)
    app.get('/confirm', confirm)

    app.post('/checkout',  (req,res)=>{
        dbPurchase.checkout(req,res)
    })


    // tests ====TEST====
    app.get('/checkout/:cartId', (req, res )=>{
        console.log('get checkout on server')
        req.params.data = " was in server"
        // res.setHeader('Content-Type', 'application/json, text/plain, */*');
        console.log(' params ====== ',req.params)
        console.log(' body ====== ',req.body)
        // res.writeHead(res.statusCode);
        dbPurchase.checkout(req,res)
        
        // res.write('get checkout success');

    })
    
    app.post('/confirm', (req,res)=>{
        console.log('post confirm purchase')
        dbPurchase.getConfirmData(req,res)}
      )
    
    app.put('/confirm', (req, res )=>{
        const data = req.body;
        data.targetAccount = config.targetAccount;
        
        axios.post( config.bankURL, data)
          .then( response => {
                
            if(response.data.message) res.json({error : response.data.message})
            if(response.data.token ) dbPurchase.confirmPurchase(req, res);
          
          }).catch( err => {
              res.json({ error : err })
              console.log(err)
          })
    
        }
      )
    

}