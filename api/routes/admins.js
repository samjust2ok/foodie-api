const express = require('express');
const AdminsController = require('../controllers/admins')
const router = express.Router();




router.get('/', AdminsController.getAllAdmins);


router.post('/signup', AdminsController.createAdmin);
router.post('/login', AdminsController.signInAdmin);

router.delete('/:adminId',AdminsController.deleteAdmin);


module.exports = router;

