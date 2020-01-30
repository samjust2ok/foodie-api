const express = require('express');
const UsersController = require('../controllers/users')
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req,file,cb){
        cb(null,'./uploads')
    },
    filename: function(req,file,cb){
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname)
    }
})

const limit = {
    fileSize: 1024*1024*5
}

const fileFilter = (req,file,cb) =>{
    if(file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg'){
    cb(null,true)
    }else{
        cb(null,false)
    }
}

const uploads = multer({
    storage,
    limit,
    fileFilter
})



router.get('/', UsersController.getAllUsers);
router.get('/:userId', UsersController.getUserById);
router.get('/getAllMessages/:userId',UsersController.getAllMessages);

router.post('/sendMail',UsersController.sendMail);
router.post('/signup', UsersController.createNewUser);
router.post('/login', UsersController.signInUser);

router.delete('/:userId',UsersController.deleteUser);
router.delete('/',UsersController.deleteAllUsers);

router.patch('/verify/:userId',UsersController.verifyUser);
router.patch('/addMessage/:userId',UsersController.addMessage);
router.patch('/sendRatingToUser/:userId/:restaurantId',UsersController.sendRatingToUser);
router.patch('/updateRatingDetails/:userId/:restaurantId/:messageId/:value',UsersController.updateRatingDetails);
router.patch('/clearChat/:userId',UsersController.clearChat);
router.patch('/:userId', UsersController.updateUser)
router.patch('/setProfilePicture/:userId', uploads.single('profilePicture'), UsersController.setProfilePicture);
module.exports = router;

