const  mongoose = require('mongoose')

const twitterPostSchema = new mongoose.Schema({
    post_id: {
        type: String,
        required: true
    },
    company: {
        type: mongoose.Types.ObjectId,
        ref: 'Comapny',
        required: true
    },
    text: {
        type: String
    }
}, {timestamps: true})

const TwitterPost = mongoose.model('TwitterPost', twitterPostSchema)

module.exports = TwitterPost
