const redis = require('redis')

const redisClient = redis.createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
})


redisClient.connect()
.then(() => {
    console.log('Redis connected successfully')
    redisClient.configSet('notify-keyspace-events', 'Ex')
})
.catch((err) => {
    console.log('Redis conncetion err: ', err)
})


const redisSubClient = redisClient.duplicate()

redisSubClient.connect()
.then(() => {
    console.log('Redis subClient connected successfully')
})
.catch((err) => {
    console.log('Redis subclient connection error: ', err)
})


module.exports = {redisClient, redisSubClient}
