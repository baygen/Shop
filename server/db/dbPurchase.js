const Purchase = require('../dbSchemas/purchase');
const Product = require('../dbSchemas/product');
const Discount = require('../dbSchemas/discount');
const _ = require('underscore');
const config = require('../config')
const Promise = require('bluebird');


exports.addItemToShoppingCart = (req, res) => {

    Purchase.findOne({
        userId: req.user._id.toString(),
        status: 'shoppingCart'
    })
    // .lean()
    .then(cart => {
        // console.log(cart)
        if (!cart) throw new Error('Cant find cart!')
        let exist = false;
        // var indDelete = [];
         _.map(cart.items, ((item, index) => {
            // if(item !== null && typeof item !== 'undefined'){
            if (item._id === req.params.id) {
                exist = true;
                item.quantity += 1;
                }
                return item ;
            // }else{ indDelete.push(index)}
        }));
        if (!exist) {
            let item = { _id: req.params.id, quantity: 1 };
            cart.items.push(item);
        }
        // if(!!indDelete){
        //     _.forEach(indDelete, index => cart.items.splice(indDelete,1) )
        // }
        // console.log(cart)
        return Purchase.update({ _id: cart._id }, { $set: { items: cart.items } })
        //  { new: true },
            // ((err, cart) => { if (cart) res.send() }
            //     )
            // );
    }).then( data =>{ 
        if(data.nModified != 1) throw new Error('Cant put item to cart')
        res.send()
    }).catch(err => {
        res.json({ error : err.message});
        console.log(err);
    })
}

exports.setNewItems = (req, res) => {

    Purchase.update({ userId: req.user._id.toString(), status: 'shoppingCart'},
            { $set: 
                { items: req.body , purchasesSum : req.params.totalSum} 
            },(err, data) => {
                console.log(data.nModified != 1)
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
            let ids = _.map(cart.items, item => item._id );
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

    Discount.findOne({ disCode : req.params.discontcode }
    ).then( discount =>{
        if( !discount ) throw new Error ("discount didn't exist !");
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
    var cart;
    var productsInCart;
    var discData;

    // let /

    Purchase.findOne({
        userId: req.user._id.toString(),
        status: 'shoppingCart'
    }, 'items discount').lean()
    .then(data => {
        cart = data;
        let ids = _.map(data.items, item => item._id );
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
        var notAccesible = [];
        let count = 0;
        let discountSum = 0;
        let itemsToBuy = _.map(cart.items, (item, index )=> {
            if( typeof item == 'undefined'|| item === null){ notAccesible.push(index); return}
            let product = _.find( productsInCart, product => item._id == product._id);
            if( product.accessible ){
                var cost = product.price * item.quantity;
                purchasesSum += cost;
                item.cost = cost;
                count += item.quantity;

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
            }else{
                notAccesible.push(index);
            }
            
        });
        // remove all not actual products
        _.forEach( notAccesible , index => itemsToBuy.splice(index,1) );
        let sum = purchasesSum - discountSum;
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
    let filter = { userId : req.user._id.toString() , status : 'shoppingCart'};

    Purchase.findOne( filter
    ).then( cart =>{
        let newData = { status: 'paid', purchasedDate: Date.now() }
        return Purchase.findByIdAndUpdate( cart._id, { $set: newData})
    }).then( cart => { 
        cartId = cart._id;
        return cart.userId;
    }).then(user_id =>  Purchase.create({
                                    userId: user_id,
                                    status: 'shoppingCart',
                                    date: Date.now()
                                })
    ).then(newcart => res.send({cartId : cartId})
    ).catch(err => {
        res.json({ error : err.message })
    })
}

exports.setDeliveryData = ( deliveryData, req, res)=>{
    let filter = { _id : req.body.id, status: 'paid'}

    Purchase.findOne( filter ,'status purchasesSum'
    ).then( cart =>{
        cart.status = 'delivering';
        cart.delivery = {
            arrivedTime : delData.data.approxWillBeDelivered,
            track : delData.data.track
        }
        return cart.save()
    }).then( savedCart => {
        console.log(savedCart)
        if(!savedCart) throw new Error('Something wrong!')
        // Purchase.findById( id, (err,doc) => console.log(doc) )
        res.json({ 
            trackcode: deliveryData.data.track, 
            arrivedTime: deliveryData.data.approxWillBeDelivered 
        })
    }).catch( err => {
        console.log(err)
        // res.json({ error : err.message});
    })
}

exports.findUserHistory = (req, res) => {
    
    let sortedField = req.body.field || "purchasedDate" ;
    let order = req.body.order ? req.body.order === 'asc' ? 1 : -1 
                                : -1 ;
    
    let limit = (req.body.pageSize || 10)
    var skip = req.body.page ? (req.body.page - 1)*limit : 0 ;

    let filter = { userId: req.user._id , status: { $in: ['delivering','complete','paid'] } };
    let proj = '_id status purchasedDate purchasesSum';

    var listSize;
    var findWithFilter = Purchase.find(filter, proj).sort([[ sortedField , order ]]).skip(skip).limit(limit);
    Promise.all([
        findWithFilter,
        // Purchase.find(filter, proj).sort([[ sortedField , order ]]).skip(skip).limit(limit),
        Purchase.count(filter)
    ])
    .spread((carts, count) => {
        listSize = count;
        let delivering = _.map( carts, cart => cart.status == 'delivering')
        
        console.log(delivering)
        // return Promise.all(_.map( carts, checkDeliveryUpdate)
        let data = {
            dataLength : count,
            purchases : carts
        }
        res.json(data)
    // }).then( data =>{
    //     return
    })
    .catch(err => console.log("error in find all carts", err))

    let checkDeliveryUpdate = (cart)=>{
        if(cart.status != 'delivering') return cart;
        axios.post(`/pathToDelivery/${cart.delivery.track}`)
            .then( response =>{
                if(!response.data.status) return cart;
                return Purchase.findByIdAndUpdate(cart._id, 
                        {$set:{status:'complete'}},{new: true});
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