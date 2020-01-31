const User = require('../models/user');
const Restaurant = require('../models/restaurant');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Handler = require('../../utils/handlers');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const Mailer = require('../../emails/helpers');
const cloudinary = require('cloudinary').v2;


cloudinary.config({
    cloud_name:'samuelfelix',
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
})

exports.getAllUsers = (req,res,next)=>{
    User.find()
    .exec()
    .then(users=>{
        res.status(200).json({
            count:users.length,
            users: users.map(user=>{
                return {
                    ..._.omit(user,['__v']),
                    request:{
                        type: 'GET',
                        url:process.env.BASE_URL + user.id
                    }
                }
            })
        })
    })
    .catch(err=>Handler.errorHandler(err,"SOME_ERROR_OCCURED"))
}

//SIGN IN USER
exports.signInUser = (req,res,next)=>{
    const userAuthDetails = {
        email: req.body.email,
        password:req.body.password
    }

    User.findOne({email:userAuthDetails.email})
    .exec()
    .then(response=>{
       if(response){
           bcrypt.compare(userAuthDetails.password,response.password).then(valid=>{
               if(valid){
                   const payload = {
                    userId: response._id,
                    email: response.email
                    }

                    jwt.sign(payload,process.env.SECRET_KEY,{
                        expiresIn:'1h'
                    },(err,token)=>{
                        if(err){
                            return res.status(409).json(Handler.errorHandler(err,"TOKEN_GENERATION_FAILED"))
                        }
                        if(token){
                            res.status(200).json({
                                token:token,
                                user: response
                            })
                        }
                    })
               }else{
                return res.status(401).json({
                    message: "AUTHENTICATION_FAILED",
                    reason:"INVALID_DETAILS"
                })
               }
           }) 
       }else{
           return res.status(401).json({
               message: "AUTHENTICATION_FAILED",
               reason:"INVALID_DETAILS"
           })
       }
    })
    .catch(err=>Handler.errorHandler(err,"CAN'T PERFORM OPERATION"))
}


exports.createNewUser = (req,res,next)=>{
    const createAccountDetails = {
        email: req.body.email,
        password:req.body.password,
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        phoneNumber:req.body.phoneNumber,
    }

    User.findOne({email: createAccountDetails.email}).exec()
    .then(user=>{
        if(Boolean(user)){
            return res.status(401).json({
                message: "DETAILS_UNIQUENESS_FAILED",
                reason:"USER_EXISTS",
                userMessage:"Someone already created an account with this email address, kindly try to recover your password if you have forgotten it",
                error:err
            })
        }
        bcrypt.hash(createAccountDetails.password,10,(err,hash)=>{
            if(err){
                return res.status(401).json({
                    message:"SOME_ERROR_OCCURED",
                    userMessage: "Choose a separate password combination"
                })
            }

            if(hash){
                const user = new User({
                    ...createAccountDetails,
                    _id: mongoose.Types.ObjectId(),
                    password:hash,
                })
                user.save()
                .then(user=>{
                    res.status(200).json({
                        message:"USER_CREATED_SUCCESSFULLY",
                        createdUser:user,
                        request:{
                            type: 'GET',
                            url: process.env.BASE_URL + user._id
                        }
                    })
                })
                .catch(err=>{
                    res.status(500)
                    .json(Handler.errorHandler(err,"COULDN'T CREATE USER"))
                });
            }
        })
    })
    .catch(err=>{
        res.status(500)
        .json(Handler.errorHandler(err,"SOME ERROR OCCURED"))
    });
}

exports.deleteUser = (req,res,next)=>{
    const ID = req.params.userId;
    User.findByIdAndDelete(ID)
    .exec()
    .then(response=>{
        res.status(200).json({
            message:"USER_DELETED",
            request:{
                type: 'GET',
                url: process.env.BASE_URL + 'users'
            }
        })
    })
    .catch(err=>Handler.errorHandler(err,"CAN'T PERFORM OPERATION"))
}



exports.deleteAllUsers = (req,res,next)=>{
    User.deleteMany({})
    .exec()
    .then(response=>{
        res.status(200).json({
            message:"ALL_USERS_DELETED",
            request:{
                type: 'GET',
                url: process.env.BASE_URL + 'users'
            }
        })
    })
    .catch(err=>Handler.errorHandler(err,"CAN'T PERFORM OPERATION"))
}


exports.getUserById = (req,res,next)=>{
    const ID = req.params.userId;
    User.findById(ID)
    .exec()
    .then(response=>{
        res.status(200).json({
            user: _.omit(response,['__v']),
            request:{
                type: 'GET',
                url: process.env.BASE_URL + 'users'
            }
        })
    })
    .catch(err=>Handler.errorHandler(err,"CAN'T PERFORM OPERATION"))
}

exports.sendMail = (req,res,next)=>{
        Mailer.sendEmail(req.body)
        .then(response=>{
            res.status(200).json({
                message: "VERIFICATION_SENT_SUCCESSFULLY",
                response,
            })
        })
        .catch(error=>{
            res.status(500).json(Handler.errorHandler(error,"VERIFICATION_MESSAGE_FAILED"))
        });
}


exports.verifyUser = (req,res,next)=>{
    const _id = req.params.userId;
    User.findByIdAndUpdate(_id,{isVerified:true})
    .exec()
    .then(response=>{
        res.status(200).json({
            response
        })
    })
    .catch(err=>{
        res.status(500).json(Handler.errorHandler(error,"VERIFICATION_FAILED"))
    })
}



exports.updateUser = (req,res,next)=>{
        let userId = req.params.userId;
        let data = req.body
            User.updateOne({_id:userId},{$set: data})
            .exec()
            .then(response=>{
                User.findOne({_id:userId}).exec()
                .then(user=>{
                    res.status(200).json({
                        user
                    })
                })
            }).catch(e=>{
                res.status(500).json({
                    error:e
                })
        })
}


exports.setProfilePicture = (req,res,next)=>{ 
    const _id = req.params.userId;
            cloudinary.uploader.upload(req.file.path,function(err,cloudinaryResult){
                if(err) {
                    res.status(500).json({
                        error: err
                    })
                }else{
                User.updateOne({_id},{
                    $set:{profilePicture:cloudinaryResult.url}
                })
                .exec()
                .then(result=>{
                    User.findOne({_id}).exec()
                        .then(user=>{
                    res.status(200).json({
                        user
                    })
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
    })
}


exports.addMessage = (req,res,next)=>{
    const _id = req.params.userId;
    const message = {
        _id: mongoose.Types.ObjectId(),
        ...req.body
    };
    User.updateOne({_id},{
        $push: {chat: message}
    }).exec()
    .then((response)=>{
        res.status(200).json({
            response
        })
    })
    .catch(error=>{
        res.status(500).json({
            error
        })
    })
}

exports.clearChat = (req,res,next)=>{
    const _id = req.params.userId;
    User.updateOne({_id},{
        $set: {chat: []}
    }).exec()
    .then((response)=>{
        res.status(200).json({
            response
        })
    })
    .catch(error=>{
        res.status(500).json({
            error
        })
    })
}


exports.getAllMessages = (req,res,next)=>{
    const _id = req.params.userId;
    User.findOne({_id}).exec()
    .then((response)=>{
        res.status(200).json({
            chat:response.chat
        })
    })
    .catch(error=>{
        res.status(500).json({
            error
        })
    })
}

exports.sendRatingToUser = (req,res,next)=>{
    const userId = req.params.userId; 
    const restaurantId = req.params.restaurantId;
    const messageObj = {
        type: 'FOODIE',
        restaurant: restaurantId,
        text: '',
        content_type: 'RATING',
        _id:mongoose.Types.ObjectId()
    }
    User.updateOne({_id:userId},{
        $push: {chat: messageObj}   
    })
    .then((response)=>{
        res.status(200).json({
            response
        })
    })
    .catch(error=>{
        res.status(500).json({
            error
        })  
    })
}

exports.updateRatingDetails = (req,res,next)=>{
    const {userId,messageId,value,restaurantId}= req.params;
    Restaurant.updateOne(
        {_id:restaurantId},
        {$inc: {'rating.no_of_rates':1,'rating.aggregate':Number(value)}}
    ).exec()
    .then(response=>{
        if(response.nModified > 0){
            User.updateOne(
                {_id: userId, 'chat._id': messageId},
                {$set: {'chat.$.rating_value':Number(value)}
            })
            .then(response=>{
                res.status(200).json({
                    response
                })
            })
            .catch(error=>{
                console.log(error)
                res.status(500).json({
                    error
                })  
            })
        }
    })
    .catch(error=>{
        console.log(error)
        res.status(500).json({
            error
        })  
    }) 
}
