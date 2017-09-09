const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, index: { unique: false } },
    phone: { type: String, index: { unique: false } },
    address: { type: String, index: { unique: false }, default : '' },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, index: { unique: false } },
    bankCart: { type: Number, unique: false },
});


module.exports = mongoose.model('users', userSchema);