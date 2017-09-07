const Purchase = require('../dbSchemas/purchase');
const Product = require('../dbSchemas/product');
const Discount = require('../dbSchemas/discount');
const _ = require('underscore')


exports.addItemToShoppingCart = (req, res) => {

    Purchase.findOne({
        userId: req.user._id.toString(),
        status: 'shoppingCart'
    }).then(cart => {
        if (!cart) throw new Error('Cant find cart!')
        let exist = false;

        _.map(cart.items, (item => {
            if (item._id === req.params.id) {
                exist = true;
                item.quantity += 1;
            }
        }));
        if (!exist) {
            let item = { _id: req.params.id, quantity: 1 };
            cart.items.push(item);
        }
        Purchase.update({ _id: cart._id }, { $set: { items: cart.items } }, { new: true },
            ((err, cart) => { if (cart) res.send() }
                )
            );
    }).catch(err => {
        console.log(err);
    })
}

exports.setNewItems = (req, res) => {

    Purchase.update({ userId: req.user._id.toString(), status: 'shoppingCart'},
            { $set: 
                { items: req.body , purchasesSum : req.params.totalSum} 
            },(err, data) => {
            if (data)  res.send();
        });
}

exports.getShoppingCart = (req, res) => {
    let cartItems;
    var cart;
    Purchase.findOne({
                userId: req.user._id.toString(),
                status: 'shoppingCart'
            },
            'items'
        ).lean()
        .then(data => {
            cart = data;
            if (!data) throw new Error('Cart not found.');
            let ids = _.map(cart.items, item => item._id);
            return Product.find({ _id: { $in: ids } }).lean();
        })
        .then(products => {
            let result = _.map(products, product => {
                let item = _.find(cart.items, item => item._id == product._id);
                return _.extend({ quantity: item.quantity }, product);
            })
            res.json({cartId : cart._id, result : result})
        })
        .catch(err => {
            console.log(err)
            res.send();
        })
}

exports.setDiscountToCart = ( req, res)=>{
    var expired = false;
    Discount.findOne({ disCode : req.params.discontcode }
    ).then( discount =>{
        if( !discount ) throw new Error ("discount didn't exist !");
        if(discount.dateExpired < Date.now()){
            expired = true;
        }
        return Purchase.findOne({ userId : req.user._id.toString(), status :'shoppingCart' },'_id discount')
    }).then( purchase => {
            purchase.discount = expired ? '' : req.params.discontcode;
            return purchase.save()
    }).then(  doc =>{
            if(expired) throw new Error('discount is outdated !');
            res.send();
    }).catch(err => {
            res.json(err.message)
    });
    
}

exports.checkout = (req, res) => {
    var cart;
    var productsInCart;
    var discData;

    Purchase.findOne({
        userId: req.user._id.toString(),
        status: 'shoppingCart'
    }, 'items discount').lean()
    .then(data => {
        cart = data;
        let ids = _.map(data.items, item => item._id);
        return Product.find({ _id: { $in: ids } }, '_id title img price accessible').lean();
    }).then(products => {
        productsInCart = products;
        if( cart.discount ){
            return Discount.findOne({ disCode : cart.discount });
        }else{
            return null;
        }
    }).then( discount =>{
        let purchasesSum = 0;
        // discountSum sum for discount values
        let discountSum = 0;
        let itemsToBuy = _.map(cart.items, item => {
            let product = _.find( productsInCart, product => item._id == product._id);
            if( product.accessible ){
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
            }else{
                item.cost = 0;
            }
            return _.extend({
                accessible : product.accessible,
                img: product.img,
                desc: product.desc,
                title: product.title,
                price: product.price
                }, item)
        });
        let sum = purchasesSum-discountSum;
        return { items : itemsToBuy, sum : sum, discountSum : discountSum};
    }).then ( updData =>
        Purchase.findByIdAndUpdate( cart._id , 
            { $set: { 
                items: updData.items , 
                purchasesSum : +updData.sum,
                discountSum : +updData.discountSum } 
            }, {new : true} )
    ).then( result => {
        if (!result) throw new Error("cannot update cart to buy")
        res.json(result)
    }).catch(err => console.log(err));

}

exports.confirmPurchase = (req, res) => {
var cartId;
    Purchase.findOne({ userId : req.user._id.toString() , status : 'shoppingCart'}
    ).then( cart =>
        Purchase.findByIdAndUpdate(cart._id, {
            $set: {
                status: 
                // 'complete',
                'delivering',
                purchasedDate: Date.now()
            }
        })
    ).then(cart => {
        if (!cart) throw new Error('Cannot confirm purchase')
        return Purchase.findById(cart._id)
    }).then( cart => { 
        cartId = cart._id;
        return cart.userId;
    }).then(user_id =>
        Purchase.create({
            userId: req.user._id.toString(),
            status: 'shoppingCart',
            date: Date.now()
        })
    ).then(newcart => {
        if (!newcart) throw new Error('Cant create new shop cart')
        res.send({cartId : cartId});
    }).catch(err => {
        res.json({ error : err.message })
    })
}

exports.setDeliveryData = ( delData, req, res)=>{
    let id = req.body.id;
    Purchase.findById( id ,'status purchasesSum')
    // .lean()
    .then( cart =>{
        cart.arrivedDate = delData.data.approxWillBeDelivered;
        // cart.deliveryToken = delData.data.track;
        return cart.save()
    }).then( savedCart => {
        if(!savedCart) throw new Error('Something wrong!')
        if(savedCart) {


            Purchase.findById( id, (err,doc)=>console.log(doc) )
            // console.log(savedCart)
            res.json({ trackcode: delData.data.track, arrivedTime: delData.data.approxWillBeDelivered })
        }
    }).catch( err => {
        console.log(err)
        // res.json({ error: err.message});
    })
}

exports.findUserHistory = (req, res) => {
    
    let sortedField = req.body.field ? req.body.field : "purchasedDate" ;
    let order = req.body.order ? req.body.order === 'asc' ? 1 : -1 
                                : -1 ;
    let beginOffset = req.body.beginOffset ? req.body.beginOffset : 0
    let endOffset = req.body.endOffset ? req.body.endOffset : 10


    Purchase.find({ userId: req.user._id , status : { $in : ['delivering','complete'] } }
        , '_id status purchasedDate purchasesSum ')
    .sort( [[sortedField , order ]])
    .exec( ( err, carts) => {
        if(err)  throw new Error(err.message)
        let data = {
            dataLength : carts.length,
            purchases : carts.slice(beginOffset, endOffset)
        }
        res.json(data)}
    ).catch(err => console.log("error in find all carts", err))
}

exports.findPurchaseById = ( id , res)=>{
    Purchase.findById(id
    ).then( cart =>{
        if(!cart) throw new Error(" Cart not found") 
        res.send(cart)
        }
    ).catch( err => console.log(err))
}

exports.delPurchase = (req, res) => {
    Purchase.remove({ _id: req.body._id }, (err) => {
        if (!err)
            this.findAllCart(req, res);
    })
}

exports.getConfirmData = (req, res) => {

    Purchase.findOne({ userId: req.user._id, status : 'shoppingCart' }, 'purchasesSum').then(purchase => {
        if (!purchase) throw new Error('Purchase not found')
        var data = { purchasesSum: purchase.purchasesSum };
        if (req.user.address) data.address = req.user.address;
        res.json(data);
    }).catch(err => console.log(err));
}