const axios = require('axios')
const express = require('express')
const generateProductPost = require('../utils/generateProductPost')
const ScheduledPost = require('../models/ScheduledPost.models')
const { postQueue, worker } = require('../redis/bullMQ')
const { json } = require('body-parser')
const Company = require('../models/company.models')
const Post = require('../models/post.models')
const { getNextPostTime } = require('../utils/getNextPostTime')
const TwitterPost = require('../models/twitterPost.models')

const postRoute = express.Router()

postRoute.post('/generate', async (req, res) => {
    const {product, prompt} = await req.body

    try {
        const text = await generateProductPost('generate', product, prompt)

        return res.status(200).json({success:true, data:text, message: 'Post text generated'})

    } catch (error) {
        return res.status(400).json({success: false, data: '', message: error?.response?.message || error?.message})
    }
})

postRoute.post('/automate', async (req, res) => {
    const {products, company_id, type, interval, intervalValue, time, endOption, until, times, postTo} = req.body

    if (!products?.length) {
        return res.status(400).json({ error: 'At least one product must be added.' });
    }

    if (!['products', 'collections', 'brands'].includes(type)) {
        return res.status(400).json({ error: 'Invalid type.' });
    }

    if (!['hourly', 'daily'].includes(interval)) {
        return res.status(400).json({ error: 'Invalid interval.' });
    }

    if (interval === 'daily' && !time) {
        return res.status(400).json({ error: 'Time is required for daily interval.' });
    }

    if (!['forever', 'times', 'until'].includes(endOption)) {
        return res.status(400).json({ error: 'Invalid end condition.' });
    }

    if (endOption === 'times' && !times) {
        return res.status(400).json({ error: 'Times is required for "times" end option.' });
    }

    if (endOption === 'until' && !until) {
        return res.status(400).json({ error: 'Until date is required for "until" end option.' });
    }

    const company = await Company.findOne({company_id})

    if(!company){
        return res.status(400).json({ error: 'company not found' });
    }

    let cron;

    if (interval === 'daily' && time) {
        const [hour, minute] = time.split(':');
        cron = `${minute} ${hour} * * *`;
    } else if (interval === 'hourly') {
        cron = `0 */${intervalValue} * * *`;
    }


    const textGenerated = await generateProductPost('generate', products[0])

    const postCreated = await Post.create({
        companyId: company.company_id,
        productId: products?.[0]?.uid,
        postSlug: products?.[0]?.slug,
        category: 'GENERATED',
        text: textGenerated,
        isApproved: true,
        isPublished: false,
        postAt: getNextPostTime(intervalValue, interval)
    })

    const newPost = await ScheduledPost.create({
        company: company._id,
        products,
        type,
        interval,
        intervalValue,
        time,
        endOption,
        currentIndex: 1,
        generatedPostId: postCreated._id,
        times: endOption === 'times' ? times : undefined,
        until: endOption === 'until' ? new Date(until) : undefined,
        postTo: postTo || ['twitter'],
    })



    await postQueue.add('post-scheduler',
        {
            postId: newPost._id.toString(),
        },
        {
            repeat: endOption === 'forever' ? { cron } :
                    endOption === 'times' ? { cron, limit: times } :
                    endOption === 'until' ? { cron, endDate: new Date(until) } : undefined,
            jobId: `post-${newPost._id}`,
        }
    );

    newPost.jobId = `post-${newPost._id}`;
    await newPost.save();

    return res.status(200).json({success: true, data: newPost, message: 'Post Automated'})
})


postRoute.get('/:company_id/scheduled-posts', async (req, res) => {
    const { company_id } = req.params

    try {
        const posts = await Post.find({companyId: company_id}).sort({postAt: 1})

        if(!posts){
            throw new Error('Post not found')
        }

        return res.status(200).json({success: true, data: posts, message: 'Posts retrieved successfully'})
    } catch (error) {
        return res.status(400).json({success: false, message: error?.message || 'Something went wrong while getting scheduled posts'})
    }
})

postRoute.get('/:company_id/posted', async (req, res) => {
    const { company_id } = req.params

    try {
        const company = await Company.findOne({company_id})

        if(!company){
            throw new Error('Company not found', {status: 400})
        }

        const posted = await TwitterPost.find({company: company._id}).sort({createdAt: -1})

        if(!posted){
            throw new Error('Post not found')
        }

        return res.status(200).json({success: true, data: posted, message: 'Posts retrieved successfully'})
    } catch (error) {
        return res.status(400).json({success: false, message: error?.message || 'Something went wrong while getting scheduled posts'})
    }
})

postRoute.delete('/scheduled', async (req, res) => {
    const { id } = req.params

    try {
        const post = await Post.findById(id)

        if(!post){
            throw new Error('post not found', {status: 400})
        }

        const deletedPost = await Post.findByIdAndDelete(post._id)

        return res.status(200).json({success: true, data: deletedPost, message: 'Post deleted successfully'})
    } catch (error) {
        return res.status(400).json({success: false, data: "", message: error?.message || 'something went wrong while deleting post'})

    }

})


postRoute.put('/revoke', async (req, res) => {
    const { id } = req.body

    try {
        const post = await Post.findById(id)

        if(!post){
            throw new Error('Post not found', {status: 400})
        }

        post.isApproved = false
        await post.save()

        return res.status(200).json({success: true, data: post, message: 'Post approval revoked'})
    } catch (error) {
        return res.status(400).json({success: false, data: '', message: error?.message || 'something went wrong while revoking approval'})
    }
})

postRoute.put('/approve', async (req, res) => {
    const { id } = req.body

    try {
        const post = await Post.findById(id)

        if(!post){
            throw new Error('Post not found', { status: 400 })
        }

        post.isApproved = true
        await post.save()

        return res.status(200).json({success: true, data: post, message: 'Post Approval success'})
    } catch (error) {

    }
})

module.exports = postRoute
