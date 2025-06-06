const IORedis = require('ioredis')
const {Queue, Worker} = require('bullmq')
const ScheduledPostModel = require('../models/ScheduledPost.models')
const { default: axios } = require('axios')
const generateProductPost = require('../utils/generateProductPost')
const Post = require('../models/post.models')
const Company = require('../models/company.models')
const { getNextPostTime } = require('../utils/getNextPostTime')
require('dotenv').config()
const connection = new IORedis({maxRetriesPerRequest: null})
const postQueue = new Queue('postQueue', { connection })



const worker = new Worker('postQueue', async (job) => {
    const {postId} = job.data

    try {
        const ScheduledPost = await ScheduledPostModel.findById(postId)

        if(!ScheduledPost){
            throw new Error('Automation not found', {status: 400})
        }

        if(!ScheduledPost.generatedPostId){
            throw new Error('Post was not found', {status: 400})
        }

        const company = await Company.findById(ScheduledPost.company)

        const post = await Post.findById(ScheduledPost.generatedPostId)

        if(!post.isApproved){
            return 
        }

        const res = await axios.post(`https://mortgages-hobbies-purchases-prices.trycloudflare.com/auth/${company?.company_id}/tweet`, {
            text: post.text
        })

        console.log(res.data)

        post.isPublished = true
        await post.save()

        const currentIndex = ScheduledPost.currentIndex
        const product = ScheduledPost.products[currentIndex]

        const textGenerated = await generateProductPost('generate', product, '')

        const postCreated = await Post.create({
            companyId: company.company_id,
            productId: product?.uid,
            postSlug: product?.slug,
            category: 'GENERATED',
            text: textGenerated,
            isApproved: true,
            isPublished: false,
            postAt: getNextPostTime(ScheduledPost.intervalValue, ScheduledPost.interval)
        })


        ScheduledPost.generatedPostId = postCreated._id
        ScheduledPost.currentIndex = (currentIndex + 1) % ScheduledPost.products.length

        await ScheduledPost.save()

        return postCreated

    } catch (error) {
        return {error: error?.message, data: error?.response?.data}
    }


}, { connection })




worker.on('completed', async job => {
  console.log(`Tweet posted: ${job.id}`, job.returnvalue);
});

worker.on('failed', (job, err) => {
  console.error(`Failed posting tweet ${job.id}:`, err.message);
});

module.exports = { postQueue, worker }
