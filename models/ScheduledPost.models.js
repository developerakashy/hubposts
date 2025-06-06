const mongoose = require('mongoose')

const ScheduledPostSchema = new mongoose.Schema({
    company:{
        type: mongoose.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    type: {
        type: String,
        enum: ['products', 'collections', 'brands'],
        required: true,
    },
    products: [
        {
            id: String,
            name: String,
            short_description: String,
            primary_material: String,
            category_slug: String,
            country_of_origin: String,
            item_code: String,
            net_quantity: String,
            slug: String,
            template_tag: String,
            is_active: Boolean
        }
    ],
    interval: {
        type: String,
        enum: ['hourly', 'daily'],
        required: true,
    },
    intervalValue: {
        type: Number,
        default: 1,
    },
    time: {
        type: String,
    },
    endOption: {
        type: String,
        enum: ['forever', 'times', 'until'],
        required: true,
    },
    times: {
        type: Number,
        required: function () {
        return this.endOption === 'times';
        },
    },
    until: {
        type: Date,
        required: function () {
        return this.endOption === 'until';
        },
    },
    postTo: {
        type: [String],
        default: ['twitter'],
    },
    jobId: {
        type: String,
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled',
    },
    currentIndex: {
        type: Number,
        required: true
    },
    generatedPostId: {
        type: mongoose.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const ScheduledPostModel =  mongoose.model('ScheduledPost', ScheduledPostSchema);

module.exports = ScheduledPostModel
