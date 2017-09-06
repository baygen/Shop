const Product = require('../dbSchemas/product');
var PER_PAGE = 10;
const _ = require('underscore')

function getPaginatedItems(items, offset) {
    return items.slice(offset, offset + 12);
}
exports.findAll = (req, res) => {
    Product.find({},
        (err, data) => { if (data) res.json(data) }
    )
}

exports.listProduct = (req, res) => {
    var offset = req.query.page ? parseInt(req.query.page, 10) : 0;
    var nextOffset = offset + 10;
    var previousOffset = (offset - 10 < 1) ? 0 : offset - 10;
    return Product.find(function(error, doc) {
        if (error) {
            console.log('err' + error);
        } else {
            var data = { doc: getPaginatedItems(doc, offset), total_count: doc.length };
            res.send(data);
        }
    });
}

exports.createProduct = (data) => {
    const product = new Product({
        title: data.title,
        desc: data.desc,
        price: data.price,
        tags: data.tags,
        img: data.img,
        properties: data.properties,
        accessible: data.accessible
    });
    return product.save((function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log('Added new! \n' + product);
        }
    }));
}

exports.editProduct = (id, data) => {
    return Product.findById(id, function(err, edited) {
        if (err) {
            console.log(err)
        }
        edited.title = data.title;
        edited.desc = data.desc;
        edited.price = data.price;
        edited.tags = data.tags;
        edited.img = data.img;
        edited.accessible = data.accessible;
        edited.properties = data.properties;

        edited.save(function(err) {
            if (err) {
                console.log(err);
            }
        })
    });

}


exports.deleteProduct = (id) => {
    return Product.findById(id).remove((function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log('deleted! id:' + id);
        }
    }));
}


exports.findItem = (id, res) => {
    return Product.findById(id, function(err, data) {
        if (err) console.log(err);
        res.json(data)
    });
}

exports.listItem = (req, res) => {

    var offset = req.query.page ? parseInt(req.query.page, 10) : 0;
    var nextOffset = offset + PER_PAGE;
    var previousOffset = (offset - PER_PAGE < 1) ? 0 : offset - PER_PAGE;
    var filter = req.query.search ? req.query.search : '';
    var minPrice = req.query.minPrice ? req.query.minPrice : 0;
    var maxPrice = req.query.maxPrice ? req.query.maxPrice : 1000000;
    var props = req.query.props ? JSON.parse(req.query.props) : [];

    
    if (props.length > 0) {
        var a = _.map(props, p => {
            return {
                'properties.name': p.name,
                'properties.value': { $in: p.value }
            }
        })
    } else {
        var a = [{}];
    }

    /*serch filter*/
    var flag = 'gi'
    filter = "^(.*?)(" + filter + ")(.*)$";
    var regex = new RegExp(filter, flag);

    /*Find in BD*/
    Product.find({
        $and: [{ $or: [{ title: { $regex: regex } }, { desc: { $regex: regex } }] }, {
            price: { $gte: minPrice, $lte: maxPrice }
        }, { $or: a }]
    }).then(function(doc) {
        var data = { doc : getPaginatedItems(doc, offset), total_count: Math.ceil( doc.length / 12) };
        //.sort({price:1})
        res.send(data);
    })
}

/* Get properties */
exports.listProps = (req, res) => {
    Product.distinct("properties.name").then(prop => {
        res.send(prop);
    })
}
    /* Get value */
exports.listValue = (req, res) => {
    let arr = [];

    Product.distinct("properties").then(prop => {
        reqProp = req.query.prop;
        var numberSort = !!(reqProp == "Total Installed Memory");

        for (let i = 0, len = prop.length; i < len; i++) {
            if (prop[i].name == reqProp) arr.push(prop[i].value);
        }

        numberSort ? arr.sort((a, b) => (+a.slice(0, -2)) - (+b.slice(0, -2))) :
            arr.sort();
        res.send(arr);
    })

}