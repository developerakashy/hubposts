const mongoose = require('mongoose')
const { PostEnum } = require('../constants')
const slugify = require('slugify')



const PostSchema = new mongoose.Schema({
    companyId: {
        type: String,
        required: true,
        index: true
    },
    productId: {
        type: String,
    },
    postId: {
        type: String
    },
    postSlug: {
        type: String,
        default: function(){
            if(this.text) return slugify(this.text.slice(0, 50), {lower: true, strict: true})
            return `post-${Date.now()}`
        }
    },
    media: [
        {
            type: {
                type: String,
                enum: ['image', 'video']
            },
            url: String
        },
    ],
    category: {
        type: String,
        enum: Object.values(PostEnum),
        required: true
    },
    text: {
        type: String,
        required: true
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    postAt: {
        type: Date
    }
}, {timestamps: true})

const Post = mongoose.model('Post', PostSchema)

module.exports = Post
