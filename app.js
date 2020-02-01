const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const mongoose = require('mongoose');
const userRoutes = require('./api/routes/users');
const restaurantRoutes = require('./api/routes/restaurants');
const adminRoutes = require('./api/routes/admins');
//VIEW ENGINE
app.set('view engine', 'hbs');

mongoose.connect("mongodb+srv://samjust2ok:samflex...@cluster0-zuot8.mongodb.net/test?retryWrites=true&w=majority",{
    useNewUrlParser:true,
    useUnifiedTopology:true
})



app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-type,Accept, Authorization')

    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')  
        return res.status(200).json({})
    }
    next();
});

app.use('/restaurants/uploads',express.static('./uploads'))
app.use(morgan('dev'))

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())


app.use('/users', userRoutes);
app.use('/restaurants', restaurantRoutes);
app.use('/admins', adminRoutes);



app.use((req,res,next)=>{
    const error = new Error('Not Found');
    error.status = 400
    next(error)
})

app.use((error,req,res,next)=>{
    res.status(error.status || 500);
    res.json({
        error:{
            message: error.message
        }
    })
})


module.exports = app