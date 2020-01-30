const Admin = require('../models/admin');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Handler = require('../../utils/handlers');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const checkTokenValid = require('../middleware/check-authentication'); 


exports.getAllAdmins = (req,res,next)=>{
    Admin.find()
    .exec()
    .select('-__V')
    .then(admins=>{
        res.status(200).json({
            count:admins.length,
            admins: admins.map(admin=>{
                return {
                    ...admin,
                    request:{
                        type: 'GET',
                        url:process.env.BASE_URL + admin.id
                    }
                }
            })
        })
    })
    .catch(err=>Handler.errorHandler(err,"SOME_ERROR_OCCURED"))
}

//SIGN IN ADMIN
exports.signInAdmin = (req,res,next)=>{
    const adminAuthDetails = {
        email: req.body.email,
        password:req.body.password
    }

    Admin.findOne({email:adminAuthDetails.email})
    .exec()
    .then(response=>{
       if(response){
           bcrypt.compare(adminAuthDetails.password,response.password).then(valid=>{
               if(valid){
                   const payload = {
                    adminId: response._id,
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
                                admin: response
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


exports.createAdmin = (req,res,next)=>{
    const createAccountDetails = {
        email: req.body.email,
        password:req.body.password,
        fullName:req.body.fullName,
    }
  
    Admin.findOne({email: createAccountDetails.email}).exec()
    .then(admin=>{
        if(Boolean(admin)){
            return res.status(401).json({
                message: "DETAILS_UNIQUENESS_FAILED",
                reason:"ADMIN_EXISTS",
                adminMessage:"Someone already created an account with this email address, kindly try to recover your password if you have forgotten it",
                error:err
            })
        }
        bcrypt.hash(createAccountDetails.password,10,(err,hash)=>{
            if(err){
                return res.status(401).json({
                    error:err,
                    message:"PASSWORD_ENCRYPT_FAILED",
                    adminMessage: "Choose a separate password combination"
                })
            }

            if(hash){
                const admin = new Admin({
                    ...createAccountDetails,
                    _id: mongoose.Types.ObjectId(),
                    password:hash,
                })
                admin.save()
                .then(admin=>{
                    res.status(200).json({
                        message:"ADMIN_CREATED_SUCCESSFULLY",
                        createdAdmin:admin,
                        request:{
                            type: 'GET',
                            url: process.env.BASE_URL + admin._id
                        }
                    })
                })
                .catch(err=>{
                    res.status(500)
                    .json(Handler.errorHandler(err,"COULDN'T CREATE ADMIN"))
                });
            }
        })
    })
    .catch(err=>{
        res.status(500)
        .json(Handler.errorHandler(err,"SOME ERROR OCCURED"))
    });
}

exports.deleteAdmin = (req,res,next)=>{
    const ID = req.params.adminId;
    Admin.findByIdAndDelete(ID)
    .exec()
    .then(response=>{
        res.status(200).json({
            message:"ADMIN_DELETED",
            request:{
                type: 'GET',
                url: process.env.BASE_URL + 'admins'
            }
        })
    })
    .catch(err=>Handler.errorHandler(err,"CAN'T PERFORM OPERATION"))
}


