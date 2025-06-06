const Post = require('../models/post.models');
const { PostEnum } = require('../constants');
const fs = require('fs');
const path = require("path");

const slugify = require('slugify');

async function generatePost(promptText, retries = 3, delay = 2000){

    for (let i = 0; i < retries; i++) {
        try {
            const genai = await import('@google/genai');

            const ai = new genai.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

            const contents = [
                {
                    role: 'user',
                    parts: [{ text: promptText }]
                }
            ];


            const res = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents
            })

            const text = res.text
            console.log(text)
            const outputPath = path.join(__dirname, 'output.txt');
            fs.writeFileSync(outputPath, text, 'utf-8');
            console.log('✅ Response saved to output.txt');

            return text

        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error.message || error);
            if (i === retries - 1) throw new Error('Gemini model unavailable after retries');
            await new Promise(res => setTimeout(res, delay * (i + 1)));
        }
    }
}


const generateProductPost = async (eventName, product, prompt) => {
    console.log("Body:", product, prompt)

    // const promptText = `
    //     You're a content writer. Based on the user's prompt and product information, create an engaging Twitter posts, tweet-length (280 characters max) post with emojis and the buy link.

    //     User Prompt: ${prompt ? prompt : ''}

    //     Use the following product information:

    //     - Name: ${product?.name}
    //     - Description: ${product?.short_description || ''}
    //     - Primary Material: ${product?.primary_material || ''}
    //     - Category: ${product?.category_slug || ''}
    //     - Country of Origin: ${product?.country_of_origin || ''}
    //     - Item Code: ${product?.item_code}
    //     - Net Quantity: ${product?.net_quantity?.value} ${product?.net_quantity?.unit}
    //     - Buy Link: https://akash.fynd.io/product/${product?.slug}

    //     🛑 Output only the tweet text.
    //     ✅ Use emojis, make it catchy, fun, and under 280 characters.
    //     ✅ End with the buy link.
    //     ✅ Also use relevant hash tags

    //     You can use bullet point's if needed

    // `
    const timestamp = Date.now();
    const randomSeed = Math.floor(Math.random() * 10000);

    const angles = [
        "focus on the problem this solves",
        "highlight the transformation it provides",
        "show the experience of using it",
        "create urgency or FOMO",
        "tell a mini success story",
        "ask an engaging question",
        "compare before/after scenarios",
        "focus on seasonal relevance"
    ];

    const tones = [
        "excited friend sharing a find",
        "helpful reviewer being honest",
        "trendy influencer recommending",
        "practical person solving problems",
        "enthusiastic early adopter"
    ];

    const randomAngle = angles[Math.floor(Math.random() * angles.length)];
    const randomTone = tones[Math.floor(Math.random() * tones.length)];

    const promptText = `
    UNIQUE SESSION: ${timestamp}_${randomSeed}

    You are a creative social media expert. Create a COMPLETELY UNIQUE Twitter post for product promotion every time.

    APPROACH: ${randomAngle}
    TONE: Write like a ${randomTone}

    User Request: ${prompt || 'Create an engaging product post'}

    Product Details:
    - Name: ${product?.name}
    - Description: ${product?.short_description || ''}
    - Material: ${product?.primary_material || ''}
    - Category: ${product?.category_slug || ''}
    - Origin: ${product?.country_of_origin || ''}
    - Quantity: ${product?.net_quantity?.value} ${product?.net_quantity?.unit}
    - Link: https://akash.fynd.io/product/${product?.slug}

    REQUIREMENTS:
    🎯 Use the "${randomAngle}" approach
    ✨ Write with "${randomTone}" energy
    📱 Under 280 characters total
    😊 Use 2-3 emojis naturally
    🏷️ Include 1-2 hashtags on new line
    🔗 End with product link on separate line
    ❌ NO asterisks (*) or markdown formatting
    📝 Use line breaks for easy reading
    🔄 Make it COMPLETELY DIFFERENT from previous posts
    ✅ Also use relevant hash 4 to 5 tags related to product

    Format:
    Hook sentence here! 🔥

    Key benefit or detail
    Another line if needed

    https://product-link

    #Hashtags


    GENERATE A FRESH, UNIQUE ANGLE EVERY TIME!
    Output post text only
`;


    const text = await generatePost(promptText)

    if(eventName === 'generate'){
        return text
    }

    const postSaved = await saveGeneratedPost(text, product.company_id, product.uid, product.slug, product.media)

    console.log(postSaved)
}

const saveGeneratedPost = async (text, companyId, productId, product_slug, media) => {

    try {
        const postSlug = product_slug
            || slugify(text.slice(0, 50), { lower: true, strict: true })
            || `post-${Date.now()}`;

        const post = await Post.create({
            companyId,
            text,
            productId,
            category: PostEnum.generated,
            postSlug,
            media
        })

        return post
    } catch (error) {
        console.log('Product error: ', error)
    }

}


module.exports = generateProductPost
