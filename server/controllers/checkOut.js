const dbPurchase = require('../db/dbPurchase')
const isLogged = require('../middleWare/isLogged');
const config = require('../config')
const axios = require('axios')

var confirm = (req, res, next) => {
    res.redirect('/checkout')
}

module.exports = (app) => {

    app.use('/checkout', isLogged)
    app.use('/confirm', isLogged, confirm)

    app.post('/checkout', (req, res) => {
        dbPurchase.checkout(req, res)
    })


    app.post('/confirm', (req, res) => {
        dbPurchase.getPreConfirmData(req, res)
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

    app.put('/confirmdeliver/:address', (req, res)=>{

        let url = config.deliveryToAddURL
                +`?from=${config.shopAddress}&to=${req.params.address}&email=${req.user.email}`;
        
        axios.get(url)
        .then( response =>{
            if( response.data.success === false) throw new Error(response.data.error);
                let resData = response.data.data;
                let deliveryData = { track : resData.track,
                                    beDelivered : resData.beDeliveredDateFormat||resData.beDelivered
                                }
                dbPurchase.setDeliveryData( deliveryData, req, res)
        }).catch( err => {
            console.log(err);
            res.json({error : 'Sorry, something unexpected happens!'});
        })
    })

}