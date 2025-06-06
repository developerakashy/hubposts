const { Schema, default: mongoose } = require('mongoose')

const twitterCredentials = new Schema({
    access_token: {
        type: String,
        required: true
    },
    refresh_token: {
        type: String,
        required: true
    },
    company: {
        type: mongoose.Types.ObjectId,
        ref: 'Company',
        required: true
    }

}, {timestamps: true})

const TwitterCred = mongoose.model('TwitterCred', twitterCredentials)

module.exports = TwitterCred
