const jwt = require('jsonwebtoken')

module.exports = (req, res, next)=>{
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        req.userData = decoded;
        next();
    }catch(error){
        return res.status(401).json({
            error_type: 'TOKEN_VALIDATION_FAILED'
        })
    }
    next();
}