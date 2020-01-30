const mongoose = require('mongoose');

    const adminSchema = mongoose.Schema({
        _id: mongoose.Types.ObjectId,
        fullName: {type: String, required:true},
        password: { type: String, required:true},
        email: {type: String, required:true},
    })

module.exports = mongoose.model('Admin',adminSchema)