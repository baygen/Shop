const dbPurchase = require('../db/dbPurchase')
const isLogged = require('./isLogged');
const config = require('../config')
const axios = require('axios')

var confirm = (req, res, next) => {
    res.redirect('/checkout')
}

module.exports = (app) => {

    app.use('/checkout', isLogged)
    app.use('/confirm', isLogged)

    app.post('/checkout', (req, res) => {
        dbPurchase.checkout(req, res)
    })


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

    app.put('/confirm/:address', (req, res)=>{

        const data = {
            from : config.shopAddress,
            to : req.params.address,
            email : req.user.email
        }
        var arrivedDate = new Date(Date.now());
        arrivedDate.setMonth(10);
        console.log(arrivedDate)
        let url = config.deliveryUrl+`?from=${config.shopAddress}&to=${req.params.address}&email=${req.user.email}`;
        let response ={
            data : {
                success : true,
                error : 'Some error message',
                data : {
                    track : 'sometrackcode',
                    approxWillBeDelivered : arrivedDate
                }
            }
        }  
        // axios.post(url).then( response =>{
            if(response.data.success) {
                dbPurchase.setDeliveryData( response.data, req, res)
                // res.json({ trackcode : res.data.trackcode });
            }else{
                
                res.json( res.data.error );
            }
            
        // })
    })

}