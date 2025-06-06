import urlJoin from "url-join";
import VersionCard from "../../components/VersionCard"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button";
import { SiX } from "@icons-pack/react-simple-icons";
import axios from "axios";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ProductCard } from "./ProductCard";
import { ArrowLeftSquare } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import formatTweetText from "@/lib/formatTweet";
import PostModal from "@/components/PostModal";
const EXAMPLE_MAIN_URL = window.location.origin;


const Playground = () => {
    const {item_id, company_id} = useParams()
    const [modal, setModal] = useState({
        postModal: false
    })
    const [posted, setPosted] = useState('')
    const [twitterUser, setTwitterUser] = useState("")
    const [generatedText, setGeneratedText] = useState("")
    const [product, setProduct] = useState('')
    const [promptText, setPromptText] = useState('')
    const [loading, setLoading] = useState({
        postGeneration: false,
        twitterUser: false,
        general: false,
        posting: false
    })
    const navigate = useNavigate()


    useEffect(() => {
        getTwitterUser()
        fetchProduct(item_id)

    }, [])

    useEffect(() => {
        if (modal.postModal || modal.productSearch) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [modal.postModal]);

    const getTwitterUser = async () => {
        if(loading.twitterUser) return
        setLoading(prev => ({...prev,twitterUser: true }));

        try {

            const { data } = await axios.get(urlJoin(EXAMPLE_MAIN_URL, `/auth/${company_id}/twitter/me`))
            setTwitterUser(data)

        } catch (error) {

            console.log(error)
        } finally {

            setLoading(prev => ({...prev,twitterUser: false }));
        }
    }

    const fetchProduct = async (itemId) => {
        if(loading.general) return

        setLoading(prev => ({...prev, general: true }));
        try {

            const { data } = await axios.get(urlJoin(EXAMPLE_MAIN_URL, `/api/products/${company_id}/${itemId}`),{
                headers: {
                    "x-company-id": company_id,
                }
            });
            console.log(urlJoin(EXAMPLE_MAIN_URL, `/api/products/${company_id}/${itemId}`))
            console.log(data)
            setProduct(data.data)

        } catch (e) {
            console.error("Error fetching products:", e);
        } finally {
            setLoading(prev => ({...prev, general: false }));
        }
    };

    const postOnTwitter = async (text) => {
        if(!text?.trim()){
            toast.info('Post text cannot be empty')
            return
        }
        if(loading.posting) return
        setLoading(prev => ({...prev, posting:true}))
        try {
            const { data } = await axios.post(urlJoin(EXAMPLE_MAIN_URL, `auth/${company_id}/tweet`), {text})

            console.log(data)

            toast.success('Tweet Posted Successfully')
            setPosted(data.data)
            setModal(prev => ({...prev, postModal: true}))
            setGeneratedText('')
        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message || 'Something went wrong')
        } finally {

            setLoading(prev => ({...prev, posting:false}))

        }
    }

    const getGeneratedPost = async (product, prompt) => {
        if(loading.postGeneration) return
        setLoading(prev => ({...prev, postGeneration: true }));
        try {

            const { data } = await axios.post(urlJoin(EXAMPLE_MAIN_URL, '/post/generate'), {
                    product: {
                        name: product?.name,
                        short_description: product?.short_description || '',
                        primary_material: product?.primary_material || '',
                        category_slug: product?.category_slug || '',
                        country_of_origin: product?.country_of_origin || '',
                        item_code: product?.item_code,
                        net_quantity: product["net-quantity"],
                        slug: product.slug,
                        template_tag: product?.template_tag,
                        is_active: product?.is_active
                    },
                    prompt: prompt || ""

                },
                {
                    headers: {
                        "x-company-id": company_id,
                    }
                }
            )

            setGeneratedText(data.data)


        } catch (error) {
            console.log(error)

        } finally {
            setLoading(prev => ({...prev, postGeneration: false }));

        }
    }

    const connectTwitter = () => {
        const twitterAuthUrl = urlJoin(EXAMPLE_MAIN_URL + `/auth/${company_id}/twitter/login`)
        window.open(twitterAuthUrl, "_blank", "noopener,noreferrer");
    }

    const closePostModal = () => {
        setModal(prev => ({...prev, postModal: false}))
    }

    if(loading.general){
        return (
            <div className="h-dvh w-vw flex justify-center items-center">
                <p>Loading...</p>
            </div>
        )
    }


    return (
        <div className=" h-dvh w-vw px-4 lg:px-12 bg-stone-50 py-4">
            {modal.postModal &&
                    <PostModal post={posted} twitterUser={twitterUser} closeModal={closePostModal}/>
            }
            <div className=" flex justify-between w-full fixed left-0 px-4 lg:px-12">
                <div className="flex items-center gap-2">

                    <ArrowLeftSquare onClick={() => navigate(-1)} className="h-10 w-10 stroke-1 hover:fill-black hover:stroke-white cursor-pointer"/>
                    <p className="text-lg">Playground</p>
                </div>

                {twitterUser && <div className="flex items-center gap-8">
                    <div className="flex gap-3">
                        <Button
                            className="cursor-pointer"
                            disabled={loading.posting}
                            onClick={() => postOnTwitter(generatedText)}
                        >
                            {loading.posting ? 'Posting...' : 'Post'}
                        </Button>
                        {/* <button  className="px-4 py-1 rounded-xl bg-blue-500 text-white font-bold">Post</button> */}
                        {/* <button className="px-4 py-1 rounded-xl bg-black text-white">Schedule</button> */}
                    </div>
                    <div className="p-3 rounded-full bg-white border">
                        <SiX className="h-7 w-7"/>
                    </div>
                    {/* <img className="h-8 w-12 bg-gray-800 rounded-full" src="" alt="" /> */}
                </div>}
            </div>

            <div className="h-full flex pt-15 w-vw gap-4">
                <div className="flex-grow flex flex-col max-h-full items-center">
                    <div className="w-full bg-stone-50 flex-grow overflow-y-auto py-2 px-2 flex flex-col items-center gap-6 ">

                        <Textarea
                            value={generatedText}
                            rows={12}
                            className="lg:text-[17px] p-4 h-full bg-white rounded-3xl"
                            onChange={(e) => setGeneratedText(e.target.value)}
                        />

                    </div>

                    <div className=" w-full flex justify-center items-center">
                        <div className="w-full border rounded-xl bg-white flex flex-col gap-2 p-2">
                            <div className="bg-white rounded-lg">
                                <ProductCard className={'hover:bg-white cursor-auto'} product={product}/>
                            </div>
                            <div className="bg-white">
                                <Textarea
                                value={promptText}
                                onChange={(e) => setPromptText(e.target.value)}
                                rows={5}
                                className=" resize-none h-24 p-3 lg:text-[15px] overflow-auto scrollbar-thin"
                                placeholder="Write something..."
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button
                                disabled={loading.postGeneration}
                                className="cursor-pointer"
                                onClick={() => getGeneratedPost(product, promptText)}
                                >
                                {loading.postGeneration ? 'Generating...' : 'Generate Post'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                {
                    loading.twitterUser ? (
                        <div className="min-w-[450px]">
                            <p>Loading Twitter...</p>
                        </div>
                    ) : !twitterUser ? (
                        <div className="bg-stone-300 min-w-[450px] w-[450px] h-[200px] px-12 flex flex-col gap-4 justify-center items-center rounded-xl">
                            <SiX className="h-12 w-12 p-1 rounded-xl bg-white" />
                            <Button
                                onClick={() => connectTwitter()}
                                className="text-lg cursor-pointer rounded-full"
                            >
                                Connect X / Twitter
                            </Button>
                        </div>
                    ) : null
                }
                {twitterUser &&
                    <div className="min-w-[400px] w-[450px] h-full p-4 bg-blue-500/40 rounded-3xl overflow-y-auto">

                        <div className=" w-full min-h-45 rounded-3xl p-4 bg-white">
                            <div className="flex gap-2">
                                <img className="h-10 w-10 rounded-full" src={twitterUser?.profile_image_url} alt="" />
                                <div className="text-[15px]">
                                    <p className="text-sm text-[#0F1419] font-semibold dark:ext-[#E7E9EA]">{twitterUser?.name}</p>
                                    <p className="text-sm text-[#536471] dark:ext-[#71767B]">@{twitterUser?.username}</p>
                                </div>

                            </div>
                            <div>
                                <p className="pt-2 text-[17px] whitespace-pre-line dark:ext-[#E7E9EA]">
                                    {formatTweetText(generatedText)}
                                </p>
                            </div>
                        </div>

                    </div>
                }
            </div>
        </div>
    )
}

export default Playground
