const http = require('http');
const app = require('./app');

const PORT = process.env.PORT || 3001;
const server = http.createServer(app);

try{
    server.listen(PORT)
    console.log("Listening on port ", PORT)
}catch(err){
    console.log(err)
}

module.exports = server;