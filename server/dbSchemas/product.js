const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    title: { type: String },
    desc: { type: String },
    price: { type: Number },
    img: [String],
    tags: [String],
    accessible: { type: Boolean, default: true },
    properties: [{
        _id: false,
        name: String,
        value: String
    }]
});

module.exports = mongoose.model('Product', schema);