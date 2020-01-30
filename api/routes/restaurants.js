const express = require('express');
const RestaurantsController = require('../controllers/restaurants');
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

const router = express.Router();



router.get('/', RestaurantsController.getAllRestaurants);
router.get('/:restaurantId', RestaurantsController.getRestaurantById);
router.get('/getAllRestaurantLikes/:restaurantId',RestaurantsController.getAllRestaurantLikes);


router.delete('/:restaurantId',RestaurantsController.deleteRestaurant);
router.delete('/',RestaurantsController.deleteAllRestaurants);
router.delete('/deleteCusineById/:restaurantId/:cusineId', RestaurantsController.deleteCusineById);
router.delete('/deleteCusineByName/:restaurantId/:cusineName', RestaurantsController.deleteCusineByName);
router.delete('/deleteFoodByName/:cusineId/:foodName', RestaurantsController.deleteFoodByName);
router.delete('/deleteFoodById/:cusineId/:foodId', RestaurantsController.deleteFoodById);


router.post('/', uploads.single('restaurantImage'), RestaurantsController.createNewRestaurant);
router.post('/addfood/:restaurantId', uploads.single('foodImage'), RestaurantsController.addFood);
router.post('/addFoodSubMenu/:cusineId/:foodId', RestaurantsController.addFoodSubMenu);

router.patch('/likes/:userId/:restaurantId/:like', RestaurantsController.addToLikes);

module.exports = router;

