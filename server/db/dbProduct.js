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
    var minPrice = req.query.minPrice ? req.query.minPrice*100 : 0;
    var maxPrice = req.query.maxPrice ? req.query.maxPrice*100 : 1000000;
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
//  TODO accesible
    /*Find in BD*/
    Product.find({
        $and: [{ $or: 
                [{ title: { $regex: regex } }, { desc: { $regex: regex } }]},
                {price: { $gte: minPrice, $lte: maxPrice },}, { $or: a }
                , { accessible : true} 
            ]
    }).then( (doc)=> {
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