const redisClient = require("./connection")
const MINS_TO_REQUEST_ALL_RSS = 5;

exports.fillNewsCache =  function (lastNews){
    redisClient.set('LAST_NEWS', JSON.stringify(lastNews), {
        EX: MINS_TO_REQUEST_ALL_RSS * 60, // Tiempo de expiración en segundos
    });
}

exports.getNewsCache =  async function (){
   return await redisClient.get('LAST_NEWS');
}





