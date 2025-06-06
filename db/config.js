const { DB_NAME } = require('../constants')
const mongoose = require('mongoose')

const connectDB = async () => {
    
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_DB_URI}/${DB_NAME}`)
        console.log('MongoDB connected: ', connectionInstance.connection.host)
    } catch (error) {
        console.log('Error connected DB: ', error)
    }

}

module.exports = connectDB
