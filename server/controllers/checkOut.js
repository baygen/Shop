const dbPurchase = require('../db/dbPurchase')
const isLogged = require('./isLogged');
const config = require('../config')
const axios = require('axios')

var confirm = (req, res, next) => {
    res.redirect('/checkout')
}

module.exports = (app) => {

    app.use('/checkout', isLogged)
    app.get('/confirm', confirm)

    app.post('/checkout', (req, res) => {
        dbPurchase.checkout(req, res)
    })


    // // tests ====TEST====
    // app.get('/checkout/:cartId', (req, res) => {
    //     console.log('get checkout on server')
    //     req.params.data = " was in server"
    //         // res.setHeader('Content-Type', 'application/json, text/plain, */*');
    //     console.log(' params ====== ', req.params)
    //     console.log(' body ====== ', req.body)
    //         // res.writeHead(res.statusCode);
    //     dbPurchase.checkout(req, res)

    //     // res.write('get checkout success');

    // })

    app.post('/confirm', (req, res) => {
        dbPurchase.getConfirmData(req, res)
    })

    app.put('/confirm', (req, res) => {
        const data = req.body;
        data.targetAccount = config.targetAccount;
        axios.post(config.bankURL, data)
            .then(response => {
                if (response.data.message) res.json({ error: response.data.message })
                if (response.data.token) dbPurchase.confirmPurchase(req, res);
            }).catch(err => res.json({ error: err }))
    })

    app.put('/confirm/:address', (req,res)=>{

        const data = {
            from : config.shopAddress,
            to : req.params.address,
            email : req.user.email
        }
        let url = config.deliveryUrl+`?from=${config.shopAddress}&to=${req.params.address}&email=${req.user.email}`;
        axios.post(url).then( res=>{
            if(res.data.success === true) res.json({ trackcode : res.data.trackcode });
            if(res.data.error ) res.json( res.data.error )
        })
    })

}