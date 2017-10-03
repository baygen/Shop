const dbPurchase = require('../db/dbPurchase')
const isLogged = require('../middleWare/isLogged');
const config = require('../config')
const axios = require('axios')

module.exports = (app) => {

    app.use('/checkout', isLogged)
    app.use('/confirm', isLogged)


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
            if (response.data.message) throw new Error('Bank says : '+ response.data.message );
            if (response.data.token) dbPurchase.confirmPurchase(req, res);
        }).catch(err => {
            console.log(err);
            res.json({ error: err.message })
        })
    })

    app.put('/confirmdeliver/:address', (req, res)=>{
"use strict"
        let url = config.deliveryToAddURL
                +`?from=${config.shopAddress}&to=${req.params.address}&email=${req.user.email}`;

        axios.get(url)
        .then( response =>{
            if( response.data.success === true) {
                let resData = response.data.data,
                    deliveryData = { track : resData.track,
                                    beDelivered : resData.beDelivered}
                dbPurchase.setDeliveryData( deliveryData, req, res)
            }
            if(response.data.error)throw new Error(response.data.error);
        }).catch( err => {
            res.json({error : 'Sorry, something unexpected happens!'});
        })
    })

}
