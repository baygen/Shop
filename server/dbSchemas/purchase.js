var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const autoIncrement = require('mongoose-auto-increment')

var Purchase = new Schema({

    userId: { type: String, require: true, unique: false },
    date: { type: Date, default: Date.now, unique: false },
    status: { type: String, require: true, unique: false },
    items: [],
    discount: { type: String, unique: false },
    delivery : {},
    purchasesSum: { type: Number, default: 0, unique: false },
    purchasedDate: { type: Date, unique: false }
});

Purchase.plugin( autoIncrement.plugin,{
    model: 'Book',
    field: 'orderId',
    type: 'String',
    startAt: 100000,
    incrementBy: 1
})

module.exports = mongoose.model('purchases', Purchase);