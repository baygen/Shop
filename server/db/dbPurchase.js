const Purchase = require('../dbSchemas/purchase');
const Product = require('../dbSchemas/product');
const Discount = require('../dbSchemas/discount');
const _ = require('underscore');
const config = require('../config')
const Promise = require('bluebird');
const axios = require('axios')


exports.addItemToShoppingCart = (req, res) => {

    let filter = { userId: req.user._id.toString(), status: 'shoppingCart' };
    
    Purchase.findOne(filter).then(cart => {
        if (!cart) throw new Error('Cant find cart!')
        let exist = false;

        let items = _.filter(cart.items, item => item!='undefined'&& item!=null)
         _.map( items, (item, index) => {
            if (item._id === req.params.id) {
                exist = true;
                item.quantity += 1;
                }
            return item ;
            });
        if (!exist) {
            let item = { _id: req.params.id, quantity: 1 };
            items.push(item);
        }
        return Purchase.update({ _id: cart._id }, { $set: { items: items } })
    }).then( data =>{ 
        if(data.nModified != 1) throw new Error('Cant put item to cart')
        res.send()
    }).catch(err => {
        res.json({ error : err.message});
        console.log(err);
    })
}

exports.setNewItems = (req, res) => {
    let updated = { items: req.body , purchasesSum : req.params.totalSum}; 

    Purchase.update({ userId: req.user._id.toString(), status: 'shoppingCart'},
            { $set: updated }, (err, data) => {
            if (data.nModified == 1)  res.send();
    });
}

exports.getShoppingCart = (req, res) => {
    let cartItems;
    var cart;
    Purchase.findOne({
                userId: req.user._id.toString(),
                status: 'shoppingCart'
            },'items'
        ).lean()
        .then(data => {
            cart = data;
            if (!data) throw new Error('Cart not found.');
            let ids = _.map(cart.items, item => item._id );
            return Product.find({ _id: { $in: ids } }).lean();
        })
        .then(products => {
            let result = _.map(products, product => {
                let item = _.find(cart.items, item => item._id == product._id);
                return _.extend({ quantity: item.quantity }, product);
            })
            res.json({ cartId : cart._id, result : result })
        })
        .catch(err => {
            console.log(err)
            res.send();
        })
}

exports.setDiscountToCart = ( req, res)=>{

    Discount.findOne({ disCode : req.params.discontcode }
    ).then( discount =>{
        if( !discount ) throw new Error ("discount don't exist !");
        if( discount.dateExpired < Date.now()) throw new Error('discount is outdated !');
        return Purchase.findOne({ 
                        userId : req.user._id.toString(), 
                        status :'shoppingCart' },
                        '_id discount');
    }).then( purchase => {
        purchase.discount = req.params.discontcode;
        return purchase.save()
    }).then(  doc =>{
            res.send();
    }).catch(err => {
            res.json(err.message)
    });
    
}

exports.checkout = (req, res) => {
    let current = new Date(),
        startTime = current.getTime();
    var cart;

    let filter = { userId: req.user._id.toString(),status: 'shoppingCart'}

    Purchase.findOne( filter, 'items discount')
    .then(data => {
        cart = data;
        let ids = _.map(data.items, item => item._id );
        return Promise.all([
                Product.find({ _id: { $in: ids }, accessible : true }, '_id title img price discount')
                // .lean()
                ,
                Discount.findOne({ disCode : data.discount })
            ])
    }).spread( (products, discount) => {
        
        let purchasesSum = 0,
            discountSum = 0;

        let itemsToBuy = _.map(products, (product, index )=> {
            let item = _.find( cart.items, item => item._id == product._id);
                
            var cost = product.price * item.quantity;
            purchasesSum += cost;
            item.cost = cost;

            if( discount != null ){
                let discData = _.find( discount.product, prod => prod.prodTitle == product.title);
                if( typeof discData !== 'undefined'){
                    let priceWithDisc = Math.round(product.price * (100 - discData.discount)/100);
                    let costWithDisc = item.quantity * priceWithDisc;
                    discountSum += cost - costWithDisc;
                    item.priceWithDisc = priceWithDisc;
                    item.costWithDisc = costWithDisc;
                }
            }
            return _.extend({
                        accessible : product.accessible,
                        img: product.img,
                        desc: product.desc,
                        title: product.title,
                        price: product.price
                        }, item)            
        });

        let sum = purchasesSum - discountSum;
        return { items : itemsToBuy, 
                 purchasesSum : +sum,
                 discountSum : +discountSum };
    }).then ( refreshedData =>
        Purchase.findByIdAndUpdate( cart._id , 
            { $set: refreshedData }, {new : true} )
    ).then( result => {
        if (!result) throw new Error("cannot update cart to buy")
        res.json(result);
        let endTime = new Date();
        console.log(' Checkout, Promise.all() execute time is : ',endTime-startTime)
    }).catch(err => console.log(err));

}

exports.confirmPurchase = (req, res) => {
    
    var paidCartId;
    let filter = { userId : req.user._id.toString() , status : 'shoppingCart'};

    Purchase.findOne( filter
    ).then( cart =>{
        let newData = { status: 'paid', purchasedDate: Date.now() }
        return Purchase.findByIdAndUpdate( cart._id, { $set: newData})
    }).then( cart => { 
        paidCartId = cart._id;
        return cart.userId;
    }).then(user_id =>  Purchase.create({
                                    userId: user_id,
                                    status: 'shoppingCart',
                                    date: Date.now()
                                })
    ).then(newcart => res.send({ cartId : paidCartId })
    ).catch(err => {
        res.json({ error : err.message })
    })
}

exports.setDeliveryData = ( deliveryData, req, res)=>{
    let filter = { _id : req.body.id};

    Purchase.findOne( filter ,'status purchasesSum'
    ).then( cart =>{
        cart.status = 'delivering';
        cart.delivery = {
            arrivedTime : deliveryData.beDelivered,
            track : deliveryData.track
        }
        return cart.save()
    }).then( savedCart => {
        if(!savedCart) throw new Error('Something wrong!')
        res.json({
            track : savedCart.delivery.track, 
            beDelivered : savedCart.delivery.beDelivered 
        })
    }).catch( err => {
        res.json({ error : err.message});
    })
}

exports.findUserHistory = (req, res) => {
    
    let sortedField = req.body.field || "purchasedDate" ;
    let order = req.body.order ? req.body.order === 'asc' ? 1 : -1 
                                : -1 ;
    let limit = req.body.pageSize || 10 ;
    var skip = req.body.page ? (req.body.page - 1)*limit : 0 ;

    let filter = { userId: req.user._id , status: { $in: ['delivering','complete','paid'] } };
    let proj = '_id status purchasedDate purchasesSum delivery';

    var listSize;

    Promise.all([
        Purchase.find(filter, proj).sort([[ sortedField , order ]]).skip(skip).limit(limit),
        Purchase.count(filter)
    ])
    .spread((carts, count) => {
        listSize = count;
        let delivering = _.filter( carts, cart => cart.status == 'delivering')
        
        if( _.size(delivering) == 0) {
            return carts
        }else{
            return Promise.all(_.map( carts, checkDeliveryUpdate))
        }
    }).then( data =>{
        return res.json({ dataLength : listSize, purchases : data })
    }).catch(err => console.log("error in find all carts", err))

    let checkDeliveryUpdate = (cart)=>{
        return new Promise( resolve => {
            
            if(cart.status != 'delivering' || typeof cart.delivery == 'undefined'){
                return resolve( cart );
            }
            
            axios.get(`${config.deliveryToCheckURL}/${cart.delivery.track}`)
            .then( response => {
                if (response.data.status != "completed") return cart;
                return Purchase.findByIdAndUpdate( cart._id, 
                            { $set: { status: 'complete'}}, { new: true });
            }).then( data => resolve(data)
            ).catch( err => console.log(err.message))
        })    
    }

}

exports.findPurchaseById = ( id , res)=>{
    
    Purchase.findById( id
    ).then( cart => res.send(cart)
    ).catch( err => console.log(err))
}

exports.delPurchase = (req, res) => {
    Purchase.remove({ _id: req.body._id }, err => {
        if (!err) this.findAllCart(req, res);
    })
}

exports.getConfirmData = (req, res) => {

    let filter = { userId: req.user._id, status : 'shoppingCart' };

    Purchase.findOne( filter, 'purchasesSum'
    ).then(purchase => {
        if (!purchase) throw new Error('Purchase not found')
        let data = { 
            purchasesSum : purchase.purchasesSum,
            address : req.user.address,
            bankCart : req.user.bankCart
            };
        res.json(data);
    }).catch(err => console.log(err));
}