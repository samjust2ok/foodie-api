const Restaurant = require('../models/restaurant');
const User = require('../models/user');
const mongoose = require('mongoose');
const Handler = require('../../utils/handlers');
const cloudinary = require('cloudinary').v2;
const _ = require('lodash');


cloudinary.config({
    cloud_name:'samuelfelix',
    api_key:'481323874788742',
    api_secret:'p_38_krH3vDqXp3nND23YZ0aOZE',
})

exports.getAllRestaurants = (req,res,next)=>{
    Restaurant.find()
    .populate('likes','profilePicture')
    .exec()
    .then(restaurants=>{
        res.status(200).json({
            count:restaurants.length,
            restaurants: restaurants.map(restaurant=>{
                return {
                    ..._.omit(restaurant,['__v']),
                    request:{
                        type: 'GET',
                        url:process.env.BASE_URL + restaurant.id
                    }
                }
            })
        })
    })
    .catch(err=>Handler.errorHandler(err,"SOME_ERROR_OCCURED"))
}

 

exports.createNewRestaurant = (req,res,next)=>{ 
    Restaurant.findOne({name: req.body.name}).exec()
    .then(response=>{
        if(Boolean(response)){
            return res.status(401).json({
                message: "RESTAURANT EXISTS",
            })
        }else{
            cloudinary.uploader.upload(req.file.path,function(err,cloudinaryResult){
                if(err) {
                    res.status(500).json({
                        error: err
                    })
                }else{
                    const { city, name, state, street, postal_code, lat, lon, contact} = req.body;

                    const location = {
                        city,
                        state,
                        street,
                        postal_code,
                    }

                    const restaurant = new Restaurant({
                        _id: mongoose.Types.ObjectId(),
                        name,
                        address:{
                            ...location,
                            formatted_address: location
                        },
                        contact,
                        geo:{
                            lat,
                            lon
                        },
                        coverImage: cloudinaryResult.url,
                    })
                    restaurant
                    .save()
                    .then(restaurant =>{
                        res.status(200).json({
                            message: "RESTAURANT_CREATED",
                            restaurant,
                            request:{
                                method:'GET',
                                url: process.env.BASE_URL + 'restaurants/'+ restaurant._id
                            }
                        })
                    })
                    .catch(error=>{
                        res.status(401).json(Handler.errorHandler(error,"COULDN'T STORE TO DATABASE"))
                    });
                }

            }) 
        }
    }).catch(err=>{
         res.status(409).json({
             error:err,
             message: 'ERROR_OCCURED'
         })
    })
}


exports.deleteRestaurant = (req,res,next)=>{
    const ID = req.params.restaurantId;
    Restaurant.findByIdAndDelete(ID)
    .exec()
    .then(response=>{
        res.status(200).json({
            message:"RESTAURANT_DELETED",
            request:{
                type: 'GET',
                url: process.env.BASE_URL + 'restaurants'
            }
        })
    })
    .catch(err=>Handler.errorHandler(err,"CAN'T PERFORM OPERATION"))
}


exports.deleteAllRestaurants = (req,res,next)=>{
    Restaurant.deleteMany({})
    .exec()
    .then(response=>{
        res.status(200).json({
            message:"ALL_RESTAURANTS_DELETED",
            request:{
                type: 'GET',
                url: process.env.BASE_URL + 'restaurants'
            }
        })
    })
    .catch(err=>Handler.errorHandler(err,"CAN'T PERFORM OPERATION"))
}


exports.getRestaurantById = (req,res,next)=>{
    const ID = req.params.restaurantId;
    Restaurant.findById(ID)
    .populate('likes','profilePicture')
    .exec()
    .then(response=>{
        res.status(200).json({
            restaurant: response,
            request:{
                type: 'GET',
                url: process.env.BASE_URL + 'restaurants'
            }
        })
    })
    .catch(err=>{
        res.status(500).json({
            error:err,
        })
    })
}


exports.addFood = (req,res,next)=>{ 
    const _id = req.params.restaurantId;
           
            cloudinary.uploader.upload(req.file.path,function(err,cloudinaryResult){
                if(err) {
                    res.status(500).json({
                        error: err
                    })
                }else{
                    const { cusine_category, unit_desc, name, unit_price, description } = req.body;
                    const menu = {
                        name,
                        unit_price,
                        cusine_category,
                        _id: mongoose.Types.ObjectId(),
                        description,
                        unit_desc,
                        foodImage: cloudinaryResult.url
                    }

                    const cusineItems = [];
                    cusineItems.push(menu)

                    Restaurant.updateOne({
                        _id,
                        cusines: {$elemMatch: {cusine_name: cusine_category}},
                    },{$push: { 'cusines.$.items' : menu}})
                    .exec()
                    .then(response=>{
                        const cusine = {
                            cusine_name: cusine_category,
                            items: cusineItems
                        }
                        if(JSON.parse(response.nModified) === 0){
                           Restaurant.updateOne({_id},
                            {$push: { 'cusines': cusine}}, (err,response)=>{
                                if(err){
                                    res.status(409).json(
                                        {
                                            message:"UPDATE FAILED",
                                            response
                                        }
                                    )
                                }else{
                                    res.status(200).json(
                                        {
                                            message:"UPDATED SUCCESSFULLY",
                                            response
                                        }
                                    )
                                }
                            })
                        }else
                        res.status(200).json(
                            {
                                message:"UPDATED SUCCESSFULLY",
                                response
                            }
                    )})
                    .catch(error=>{
                        res.status(200).json(
                            {
                                message:"UPDATED FAILED",
                                error
                            })
                    })
                }
            })
    
}


exports.deleteCusineById = (req,res,next)=>{
    const { restaurantId, cusineId} = req.params;
    Restaurant.updateOne(
        {_id: restaurantId},
        {$pull: {'cusines': { _id: cusineId}}},
        (err,response)=>{
            return err ? res.status(401).json(err):
            res.status(200).json(response)
        }
    )
}

exports.deleteCusineByName = (req,res,next)=>{
    const { restaurantId, cusineName} = req.params;
    Restaurant.updateOne(
        {_id: restaurantId},
        {$pull: {'cusines': { cusine_name: cusineName}}},
        (err,response)=>{
            return err ? res.status(401).json(err):
            res.status(200).json(response)
        }
    )
}

exports.deleteFoodById = (req,res,next)=>{
    const {cusineId,foodId} = req.params;
    Restaurant.update({
        'cusines': { $elemMatch: { _id: cusineId }}
    },
    {
        $pull: {'cusines.$.items' : { _id: foodId}}
    },
    (err,response)=>{
        return err ? res.status(401).json(err):
        res.status(200).json(response)
    })
}

exports.deleteFoodByName = (req,res,next)=>{
    const {cusineId,foodName} = req.params;
    Restaurant.update({
        'cusines': { $elemMatch: { _id: cusineId }}
    },
    {
        $pull: {'cusines.$.items' : { name: foodName}}
    },
    (err,response)=>{
        return err ? res.status(401).json(err):
        res.status(200).json(response)
    })
}

exports.addFoodSubMenu = (req,res,next)=>{
    const { multiSelect, unit_price, name, category,available } = req.body;
    const {foodId,cusineId} = req.params;


    
    const sub_menu_item_def = {
        name,
        category,
        unit_price:unit_price,
        id: mongoose.Types.ObjectId(),
        available
    }

   
    
    Restaurant.updateOne({
        cusines: {$elemMatch: { _id: cusineId}},
    },
    {$push: {'cusines.$[cusine].items.$[elem].sub_menus.$[cat].items' : sub_menu_item_def}},
    {
        multi: false,
        arrayFilters: [{'elem._id': foodId}, {'cat.category':category},{'cusine._id':cusineId}]
    },
    (err,response)=>{
        if(err){
            res.status(200).json(
                {
                    message:"UPDATED FAILED",
                    error:err
            })
        }else{
            if(JSON.parse(response.nModified) === 0){
                
                const sub_menu = {
                    _id: mongoose.Types.ObjectId(),
                    multiSelect,
                    category,
                    items: [sub_menu_item_def]
                }
                Restaurant.updateOne({
                    cusines: {$elemMatch: { _id: cusineId}},
                },
                    {$push: {'cusines.$[cusine].items.$[elem].sub_menus' : sub_menu}},
                    {
                        multi: false,
                        arrayFilters: [{'elem._id': foodId},{'cusine._id':cusineId}]
                    }, (err,response)=>{
                     if(err){
                        res.status(200).json(
                            {
                                message:"UPDATED FAILED",
                                error:err
                            }
                        )   
                     }else{
                         res.status(200).json(
                             {
                                 message:"UPDATED NEW SUCCESSFULLY",
                                 response
                             }
                         )
                     }
                 })
             }else
             res.status(200).json(
                 {
                     message:"UPDATED SUCCESSFULLY",
                     response
                 }
             )
        }
    })
}


exports.addToLikes = (req,res,next)=>{
    const {like,restaurantId,userId} = req.params;
        if(like==='true'){
            Restaurant.updateOne({_id:restaurantId},
                {
                    $addToSet:{likes: userId}
                }).exec()
            .then(r=>{
                res.status(200).json({
                    message:"ADDED TO LIKES"
                })
            })
            .catch(e=>res.status(500).json({
                error:e
            }))
        }
        if(like ==='false'){
            Restaurant.updateOne({_id:restaurantId},{
                $pull:{likes:userId}
            }).exec()
            .then(r=>{
                res.status(200).json({
                    message:"REMOVE_FROM_LIKES"
                })
            })
            .catch(e=>res.status(500).json({
                error:e
            }))
    }
}

exports.getAllRestaurantLikes = (req,res,next)=>{
    const _id = req.params.restaurantId;
    Restaurant
    .find({_id})
    .select('likes')
    .populate('likes','profilePicture')
    .exec()
    .then(result=>{
        res.status(200).json({
            likes
        })
    })
    .catch(err=>{
        console.log(err)
        res.status(409).json({
            err,
            message: 'ERROR_OCCURED'
        })
   })
}