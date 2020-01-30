const mongoose = require('mongoose');



const sub_menu_item = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    name: {type: String, required:true},
    unit_price: { type: Number, default:null},
    available:{type:Boolean, default:true},
    category:{type: String, required:true}
})


const sub_menu = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    category: {type:String,required:true},
    multiSelect: { type: Boolean, required: true},
    items:[sub_menu_item]
})


const menu = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    name: {type: String, required: true},
    unit_price: {type: Number, required: true},
    cusine_category: { type: String, required: true},
    sub_menus: { type: [sub_menu], default: null},
    available:{type:Boolean, default:true},
    description: String,
    foodImage: String,
    unit_desc: String,
})

const restaurantSchema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    name:{ type: String, required:true},
    geo:{
        lon: { type: Number, required: true},
        lat: { type: Number, required: true}
    },
    dateCreated: { type: Date, default: Date.now},
    address: {
        city: { type: String, required:true},
        state: { type: String, required:true},
        street: { type: String, required:true},
        postal_code: String,
        formatted_address:{
            type: String,
            set: v=> `${v.street} ${v.city}, ${v.state}, ${v.postal_code||''}`,
        },

        formatted_short_address:{
            type: String,
            set: v=> `${v.street} ${v.city}`,
        }
    },
    coverImage: {type:String, required:true},
    contact: {type:String, required:true},
    amountSold: {type: Number, default:0},
    orders: {type: Number, default:0},
    cusines:[{cusine_name: {
        type: String,
        required: true,
    }, items:{
        type: [menu],
        required: true
    }}],
    rating:{
        aggregate: { type: Number, default: 0},
        no_of_rates: {type: Number, default:0}
    },
    likes: [{type: mongoose.Types.ObjectId, ref: 'User'}]
});

module.exports =  mongoose.model('Restaurant',restaurantSchema);