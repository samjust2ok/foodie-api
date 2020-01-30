const http = require('http');
const app = require('./app');

const PORT = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
const server = http.createServer(app);

try{
    server.listen(PORT)
    console.log("Listening on port ", PORT)
}catch(err){
    console.log(err)
}

module.exports = server;