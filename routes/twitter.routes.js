const axios = require('axios')
const express = require('express')
const { redisClient } = require('../redis/redis')
const Company = require('../models/company.models')
const TwitterCred = require('../models/twitter.models')
const TwitterPost = require('../models/twitterPost.models')

const twitterRoute = express.Router()

twitterRoute.get('/:company_id/twitter/login', (req, res) => {
    const { company_id } = req.params

    const redirectUrl = new URL("https://twitter.com/i/oauth2/authorize")

    const statePayload = {
        company_id
    };

    redirectUrl.searchParams.set("response_type", "code")
    redirectUrl.searchParams.set("client_id", process.env.TWITTER_CLIENT_ID)
    redirectUrl.searchParams.set("redirect_uri", process.env.TWITTER_REDIRECT_URI)
    redirectUrl.searchParams.set("scope", "tweet.read tweet.write users.read offline.access")
    redirectUrl.searchParams.set("state", encodeURIComponent(JSON.stringify(statePayload)))
    redirectUrl.searchParams.set("code_challenge", "challenge")
    redirectUrl.searchParams.set("code_challenge_method", "plain")

    res.redirect(redirectUrl.toString())
})

twitterRoute.get('/twitter/callback', async (req, res) => {

    const { searchParams } = new URL(req.url, `https://${req.headers.host}`)

    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if(!code) return res.status(400).json({success: 'false', error: 'code not found'})


    try {
        const parsed = JSON.parse(decodeURIComponent(state));
        const company_id = parsed.company_id;

        const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
            method: 'POST',
            headers: {
                "Content-type": "application/x-www-form-urlencoded",
                Authorization:
                    "Basic " +
                    Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString("base64"),
            },
            body: new URLSearchParams({
                code,
                grant_type: "authorization_code",
                redirect_uri: process.env.TWITTER_REDIRECT_URI,
                code_verifier: "challenge"
            })
        })

        const tokenData = await tokenRes.json()

        const company = await Company.findOne({company_id})

        if(!company) throw new Error('Company not found')

        const twitterCred = await TwitterCred.findOne({company: company._id})

        if(!twitterCred){
            await TwitterCred.create({
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token,
                company: company._id
            })
        } else {
            await TwitterCred.findOneAndUpdate(
                { company: company._id },
                {
                    access_token: tokenData.access_token,
                    refresh_token: tokenData.refresh_token
                },
                { upsert: true, new: true }
            )
        }

        const userRes = await axios.get('https://api.twitter.com/2/users/me?user.fields=profile_image_url', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`
            }
        })

        const userData = userRes.data.data

        const expiry = tokenData.expires_in > 120 ? tokenData.expires_in - 120 : tokenData.expires_in

        await redisClient.set(`company:twitter:${company._id.toString()}`, JSON.stringify({...userData}), { EX: expiry });

        console.log('Twitter connected you can now post')

        return res.status(200).json(userData)

    } catch (error) {
        console.log('token error: ', error)
    }
})

twitterRoute.get('/:company_id/twitter/me', async (req, res) => {
    const { company_id } = req.params

    try {
        const company = await Company.findOne({company_id})

        if(!company) return res.status(400).json({success: false, data: '', message: 'company not found'})

        const data = await redisClient.get(`company:twitter:${company._id.toString()}`)
        if(!data){
            const twitterCred = await TwitterCred.findOne({company: company._id})

            if(!twitterCred) return res.status(400).json({success:false, data: '', error: 'Connect Twitter'})
            const refresh_token = twitterCred.refresh_token

            const tokenRes = await axios.post(
                'https://api.twitter.com/2/oauth2/token',
                new URLSearchParams({
                    refresh_token,
                    grant_type: "refresh_token",
                    client_id: process.env.TWITTER_CLIENT_ID,
                }),
                {
                    headers: {
                        "Content-type": "application/x-www-form-urlencoded",
                        Authorization:
                        "Basic " +
                        Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString("base64"),
                    },
                }
            )

            const tokenData = tokenRes.data

            twitterCred.access_token = tokenData.access_token
            twitterCred.refresh_token = tokenData.refresh_token
            await twitterCred.save()

            const userRes = await axios.get('https://api.twitter.com/2/users/me?user.fields=profile_image_url', {
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`
                }
            })

            const userData = userRes.data.data

            const expiry = tokenData.expires_in > 120 ? tokenData.expires_in - 120 : tokenData.expires_in

            await redisClient.set(`company:twitter:${company._id.toString()}`, JSON.stringify(userData), { EX: expiry });

            return res.status(200).json(userData)

        }
        return res.status(200).json(JSON.parse(data))
    } catch (error) {

        console.error('Twitter /me error:', error.response?.data || error.message);
        return res.status(400).json({ success: false, data: '', message: 'Twitter error', error: error.response?.data || error.message });

    }
})



twitterRoute.post('/:company_id/tweet', async (req, res) => {
    const { company_id } = req.params
    const { text } = await req.body
    console.log(company_id)

    try {
        const company = await Company.findOne({company_id})

        if(!company) return res.status(400).json({success: false, data: '', message: 'Company not found'})

        const twitterCred = await TwitterCred.findOne({company: company._id})
        if(!twitterCred) return res.status(400).json({success: false, data: '', messsage: 'Twitter credentials not found'})
        let access_token = twitterCred.access_token

        const user = await redisClient.get(`company:twitter:${company._id}`)

        if(!user){
            const twitterCred = await TwitterCred.findOne({company: company._id})

            if(!twitterCred) return res.status(400).json({success:false, data: '', error: 'Connect Twitter'})
            const refresh_token = twitterCred.refresh_token

            const tokenRes = await axios.post(
                'https://api.twitter.com/2/oauth2/token',
                new URLSearchParams({
                    refresh_token,
                    grant_type: "refresh_token",
                    client_id: process.env.TWITTER_CLIENT_ID,
                }),
                {
                    headers: {
                        "Content-type": "application/x-www-form-urlencoded",
                        Authorization:
                        "Basic " +
                        Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString("base64"),
                    },
                }
            )

            const tokenData = tokenRes.data

            access_token = tokenData.access_token
            twitterCred.access_token = tokenData.access_token
            twitterCred.refresh_token = tokenData.refresh_token
            await twitterCred.save()

            const userRes = await axios.get('https://api.twitter.com/2/users/me?user.fields=profile_image_url', {
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`
                }
            })

            const userData = userRes.data.data

            const expiry = tokenData.expires_in > 120 ? tokenData.expires_in - 120 : tokenData.expires_in

            await redisClient.set(`company:twitter:${company._id.toString()}`, JSON.stringify(userData), { EX: expiry });


        }


        const postRes = await axios.post(
            'https://api.twitter.com/2/tweets',
            {
                text
            },
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    "Content-Type": "application/json",
                },
            }
        )

        const tweetData = postRes.data.data;

        const postCreated = await TwitterPost.create({
            post_id: tweetData.id,
            text: tweetData.text,
            company: company._id
        })

        return res.status(200).json({
            success: true,
            message: 'Tweet posted successfully',
            data: postCreated,
        });



    } catch (error) {
        return res.status(400).json({ success: false, data: '', message: 'Twitter error', error: error.response?.data || error.message });
    }
})

twitterRoute.get("_healthz", async (req, res) => {
  try {
    const redis = await redisClient.set("health", "ok", {EX:100 })
    return res.json({
      status: "ok",
    });
  } catch (error) {
    return res.send(error)
  }
});

twitterRoute.delete('/delete/:id', async (req, res) => {
    const { id } = req.params

    try {
        const twitterPost = await TwitterPost.findOne({post_id: id})

        if(!twitterPost){
            throw new Error('Post not found', {status: 400})
        }
        const company = await Company.findById(twitterPost.company)

        if(!company) return res.status(400).json({success: false, data: '', message: 'Company not found'})

        const twitterCred = await TwitterCred.findOne({company: company._id})
        if(!twitterCred) return res.status(400).json({success: false, data: '', messsage: 'Twitter credentials not found'})
        let access_token = twitterCred.access_token

        const user = await redisClient.get(`company:twitter:${company._id}`)

        if(!user){
            const twitterCred = await TwitterCred.findOne({company: company._id})

            if(!twitterCred) return res.status(400).json({success:false, data: '', error: 'Connect Twitter'})
            const refresh_token = twitterCred.refresh_token

            const tokenRes = await axios.post(
                'https://api.twitter.com/2/oauth2/token',
                new URLSearchParams({
                    refresh_token,
                    grant_type: "refresh_token",
                    client_id: process.env.TWITTER_CLIENT_ID,
                }),
                {
                    headers: {
                        "Content-type": "application/x-www-form-urlencoded",
                        Authorization:
                        "Basic " +
                        Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString("base64"),
                    },
                }
            )

            const tokenData = tokenRes.data

            access_token = tokenData.access_token
            twitterCred.access_token = tokenData.access_token
            twitterCred.refresh_token = tokenData.refresh_token
            await twitterCred.save()
            const userRes = await axios.get('https://api.twitter.com/2/users/me?user.fields=profile_image_url', {
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`
                }
            })

            const userData = userRes.data.data

            const expiry = tokenData.expires_in > 120 ? tokenData.expires_in - 120 : tokenData.expires_in

            await redisClient.set(`company:twitter:${company._id.toString()}`, JSON.stringify(userData), { EX: expiry });


        }


        const twitterRes = await axios.delete(`https://api.twitter.com/2/tweets/${id}`, {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })

        await TwitterPost.findByIdAndDelete(twitterPost._id)

        return res.status(200).json({success: true, data: twitterRes.data, message: 'Post deleted successfully'})
    } catch (error) {
        return res.status(400).json({success: true, data: error?.message || 'Something went wrong while deleting post'})
    }
})



module.exports = twitterRoute
