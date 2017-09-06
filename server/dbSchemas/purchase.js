var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Purchase = new Schema({

    userId: { type: String, require: true, unique: false },
    date: { type: Date, default: Date.now, unique: false },
    status: { type: String, require: true, unique: false },
    items: [],
    discount: { type: String, unique: false },
    // discountSum: { type: Number, default: 0, unique: false },
    purchasesSum: { type: Number, default: 0, unique: false },
    purchasedDate: { type: Date, unique: false }
});


module.exports = mongoose.model('purchases', Purchase);