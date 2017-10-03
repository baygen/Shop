const Purchase = require('../dbSchemas/purchase');
const Product = require('../dbSchemas/product');
const Discount = require('../dbSchemas/discount');
const _ = require('underscore');
const config = require('../config')
const Promise = require('bluebird');
const axios = require('axios')


exports.addItemToShoppingCart = (req, res) => {
  "use strict";
    let filter = { userId: req.user._id.toString(), status: 'shoppingCart' };

    Purchase.findOne(filter)
    .then(cart => {
        if (!cart) throw new Error('Cant find cart!')
        let exist = false;

        let items = _.filter(cart.items, _.isObject)
        cart.items = items;
        _.each( cart.items, (item, index) => {
            if (item._id === req.params.id) {
                exist = true;
                item.quantity += 1;
                }
                return item;
            });
        if (!exist) {
            let item = { _id: req.params.id, quantity: 1 };
            cart.items.push(item);
        }
        return cart.update({ $set: {items : cart.items }});
    }).then( data =>{
        res.json({ success : true })
    }).catch(err => {
        res.json({ success : false });
    })
}

exports.setNewItems = (req, res) => {
  "use strict";
    let updated = { items: req.body , purchasesSum : req.params.totalSum};

    Purchase.update({ userId: req.user._id.toString(), status: 'shoppingCart'},
        { $set: updated
    }).then( data => {
        if (data.nModified == 1)  {
            res.send({success: true})
        }else{
            res.send({success: false})
        }
    }).catch( err => {
        console.log(err.message)
        res.send({success: false})
    })
}

exports.getShoppingCart = (req, res) => {
  "use strict";
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
    }).then(products => {
            let result = _.map(products, product => {
                let item = _.find(cart.items, item => item._id == product._id);
                return _.extend({ quantity: item.quantity }, product);
            })
            res.json({ cartId : cart._id, result : result })
    }).catch(err => {
            console.log(err)
            res.json({ success : false});
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
            res.json({ success : true});
    }).catch(err => {
            res.json({success : false, error: err.message})
    });

}

exports.checkout = (req, res) => {
  "use strict";
    var cart;

    let filter = { userId: req.user._id.toString(),status: 'shoppingCart'}
    let productRej ='_id title img price discount accessible';

    Purchase.findOne( filter, 'items discount purchasesSum').lean()
    .then( data => {
        cart = data;
        let ids = _.map(data.items, item => item._id );
        return Promise.all([
                Product.find({ _id: { $in: ids }, accessible : true }, productRej).lean(),
                Discount.findOne({ disCode : data.discount })
            ])
    }).spread( (products, discount) => {

        let purchasesSum = 0,
            discountSum = 0;

        let itemsToBuy = _.map(products, product => {
            var item = _.find( cart.items, item => item._id == product._id);

            let cost = product.price * item.quantity;
            item.accessible = product.accessible;
            purchasesSum += cost;
            item.cost = cost;

            if( discount != null && discount.dateExpired > Date.now()){
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
                        img: product.img,
                        desc: product.desc,
                        title: product.title,
                        price: product.price,
                        }, item)
        });
        let sum = purchasesSum - discountSum;
        return { items : itemsToBuy,
                 purchasesSum : +sum,
                 discountSum : +discountSum };
    }).then ( refreshedData =>
        Purchase.findByIdAndUpdate(cart._id,{ $set: refreshedData }, {new : true})
    ).then( result => {
        if (!result) throw new Error("cannot update cart to buy")

        if(req.body.confirm){
            res.json({ purchasesSum: result.purchasesSum})
        }else{
            res.json(result);
        }
    }).catch(err => {
        console.log(err)
        res.send({success : false})
    });

}

exports.confirmPurchase = (req, res) => {
"use strict";
    var paidCartId;
    let filter = { userId : req.user._id.toString() , status : 'shoppingCart'};

    Purchase.findOne( filter
    ).then( cart =>{
        paidCartId = cart._id;
        cart.status = 'paid';
        cart.purchasedDate = Date.now();
        return cart.save();
    }).then( cart =>
        Purchase.create({
                userId: req.user._id,
                status: 'shoppingCart',
                date: Date.now() })
    ).then(newcart => res.send({ cartId : paidCartId })
    ).catch(err => {
        res.json({ error : err.message })
    })
}

exports.setDeliveryData = ( deliveryData, req, res)=>{
  "use strict";
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
        console.log(err)
        res.json({ error : err.message});
    })
}

exports.findUserHistory = (req, res) => {
  "use strict";
    let inputOrder = req.body.order || 'desc';
    let order = inputOrder ==='asc' ? 1 : -1 ;

    let sortedField = req.body.field || "purchasedDate" ;
    let limit = req.body.pageSize || 5 ;
    var skip = req.body.page ? (req.body.page - 1)*limit : 0 ;

    let filter = { userId: req.user._id , status: { $in: ['delivering','complete','paid'] } };
    let proj = '_id status purchasedDate purchasesSum delivery orderId';

    var listSize;

    Promise.all([
        Purchase.find(filter, proj).sort([[ sortedField , order ]]).skip(skip).limit(limit),
        Purchase.count(filter)
    ])
    .spread((carts, count) => {
        listSize = count;
        if( _.some(carts, cart => cart.status === 'delivering')) {
            return Promise.all(_.map( carts, checkDeliveryUpdate))
        }else{
            return carts;
        }
    }).then( data =>{
        return res.json({ dataLength : listSize, purchases : data })
    }).catch(err => console.log("error in find all carts", err))

    let checkDeliveryUpdate = (cart)=>{

        if(cart.status !== 'delivering' || typeof cart.delivery === undefined){
            return Promise.resolve( cart );
        }
        return axios.get(`${config.deliveryToCheckURL}/${cart.delivery.track}`)
                .then( response => {
                    if (response.data.status !== "completed")
                        return cart;
                    return Purchase.findByIdAndUpdate( cart._id,
                            { $set: { status: 'complete'}}, { new: true });
                }).catch( err => {
                console.log(err.message)
                return Promise.resolve(cart)
            })
    }

}

exports.findPurchaseById = ( req , res)=>{

    Purchase.findById( req.params.id
    ).then( cart => res.json({cart: cart, address: req.user.address}))
    .catch( err => console.log(err))
}

exports.getPreConfirmData = (req, res) => {
"use strict";
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
