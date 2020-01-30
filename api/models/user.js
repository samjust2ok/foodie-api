const mongoose = require('mongoose');

    const messageSchema = mongoose.Schema({
        _id: mongoose.Types.ObjectId,
        text: { type: String, required:true},
        time: {type:Date, default:Date.now()},
        type: {type: String, required:true},
        content_type: {type: String, required:true},
        restaurant: String,
        rating_value: { type: Number, default: null}
    })

    const userSchema = mongoose.Schema({
        _id: mongoose.Types.ObjectId,
        firstName: {type: String, required:true},
        lastName: {type: String, required:true},
        phoneNumber: {type: String, required:true},
        isVerified : {type: Boolean, default:false},
        password: { type: String, required:true},
        email: {type: String, required:true},
        profilePicture: String,
        chat:[messageSchema]
    })


module.exports = mongoose.model('User',userSchema)