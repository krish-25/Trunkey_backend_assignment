const mongoose = require('mongoose');
const {isEmail} = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Enter a valid email']
    },
    username:{
        type: String
    },
    contact:{
        type: Number
    },
    password:{
        type: String,
        required: true,
        minlength: [6, 'minimum length should be 6']
    } 
})

userSchema.post('save', function (doc, next){
    console.log('new user was created and saved', doc);
    next();
})

userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

module.exports = mongoose.model('User', userSchema);