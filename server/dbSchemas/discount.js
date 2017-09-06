const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
   disCode:
   { type: String, unique:true, required:true },
   dateExpired:
   { type: Date, default:Date.now },
   product: [
       {
           _id:false,
           prodTitle: String,
           discount: Number
       }
   ]
});

module.exports = mongoose.model('Discount', schema);