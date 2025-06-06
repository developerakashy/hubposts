import { Link, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { SiX } from "@icons-pack/react-simple-icons"
import { PackageSearch, Plus, Search, XCircle } from "lucide-react"
import axios from "axios"
import urlJoin from "url-join"
import { ProductCard } from "@/src/pages/ProductCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatDateAndTime, getTimeRemaining } from "@/lib/utils"
import PostModal from "@/components/PostModal"
const EXAMPLE_MAIN_URL = window.location.origin;

export default function Home(){
    const [modal, setModal] = useState({
        productSearch: false,
        postModal: false
    })
    const [loading, setLoading] = useState({
        twitterUser: false,
        productList: false
    })
    const [productList, setProductList] = useState([])
    const [scheduledPosts, setScheduledPosts] = useState([])
    const [currentProductScheduled, setCurrentProductScheduled] = useState('')
    const [currentPost, setCurrentPost] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [resultText, setResultText] = useState('')
    const { company_id } = useParams();
    const [twitterUser, setTwitterUser] = useState('')
    const [posted, setPosted] = useState([])
    console.log(productList)


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

    useEffect(() => {
        if (modal.postModal || modal.productSearch) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [modal.postModal, modal.productSearch]);


    const fetchProducts = async (q = "") => {
        if(loading.productList) return
        setResultText(q)
        setLoading(prev => ({...prev,productList: true }));

        try {
            const { data } = await axios.get(urlJoin(EXAMPLE_MAIN_URL, `/api/products?q=${q}`),{
                headers: {
                    "x-company-id": company_id,
                }
            });
            console.log(urlJoin(EXAMPLE_MAIN_URL, '/api/products'))
            setProductList(data.items);
            console.log(data.items)
        } catch (e) {
            console.error("Error fetching products:", e);
        } finally {
            setLoading(prev => ({...prev,productList: false }));

            setSearchQuery("")
        }
    };

    const getScheduledPosts = async () => {
        try {
            const { data } = await axios.get(urlJoin(EXAMPLE_MAIN_URL, `/post/${company_id}/scheduled-posts`),{
                headers: {
                    "x-company-id": company_id,
                }
            });

            setScheduledPosts(data.data)
            console.log(data)
        } catch (error) {
            console.log(error)
        }
    }


    const getPosted = async () => {
        try {
            const { data } = await axios.get(urlJoin(EXAMPLE_MAIN_URL, `/post/${company_id}/posted`),{
                headers: {
                    "x-company-id": company_id,
                }
            });

            setPosted(data.data)
            console.log(data)
        } catch (error) {
            console.log(error)
            setPosted([])
        }
    }



    useEffect(() => {
        fetchProducts()
        getScheduledPosts()
        getTwitterUser()
        getPosted()
    }, [])

    const handleSearchRequest = (q) => {

        if(q?.trim()){
            fetchProducts(q.trim())

        }

    }

    const closePostModal = () => {
        setModal(prev => ({...prev, postModal: false}))
    }

    const deleteQueriedProduct = () => {
        setResultText('')
        fetchProducts('')
    }


    return(
        <>
            {modal.productSearch &&
                <div onClick={() => setModal(prev => ({...prev, productSearch: false}))} className="fixed bg-black/60 z-50 inset-0 flex justify-center items-center">
                    <div onClick={(e) => e.stopPropagation()} className="h-9/10 p-4 pt-0 overflow-y-auto w-[550px] rounded-xl bg-white flex flex-col gap-2 items-center">
                        <div className="w-full py-4 flex flex-col gap-2 sticky top-0 bg-white z-20">
                            <p className="font-semibold text-xl mb-2">Select product to create post on it</p>
                            <Label htmlFor="">Search Product</Label>
                            <div className="relative flex items-center gap-2">
                                <Input
                                    value={searchQuery}
                                    type="text"
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Button
                                    className="cursor-pointer"
                                    onClick={() => handleSearchRequest(searchQuery)}
                                    disabled={searchQuery?.trim() ? false : true}
                                >Fynd</Button>
                                {/* <Button  className={`${searchQuery?.trim() ? "hover:bg-blue-600 bg-blue-500" : "bg-blue-200"} cursor-pointer absolute right-2 px-3 py-1 text-md font-semibold  text-white  rounded-xl`}>GET</Button> */}

                            </div>

                        </div>

                        {
                            loading.productList ? 'Loading' :
                            <>
                                {resultText &&
                                    <div className="w-full flex justify-between">
                                        <p className="text-sm"><span className="font-bold">Result: </span> {resultText}</p>
                                        <XCircle onClick={deleteQueriedProduct} className="cursor-pointer stroke-red-500 h-5 w-5 hover:fill-red-200"/>
                                    </div>
                                }

                                <div className="w-full flex flex-col gap-4">
                                    {productList &&
                                        productList.map((product) =>
                                            <Link key={product.uid} to={`/playground/${company_id}/${product.uid}`}>
                                                <ProductCard  product={product}/>
                                            </Link>
                                        )
                                    }
                                </div>

                                <div>

                                </div>

                            </>
                        }
                    </div>
                </div>
            }

            {modal.postModal &&
                <PostModal post={currentPost} product={currentProductScheduled} twitterUser={twitterUser} closeModal={closePostModal}/>
            }


            <div className="px-4 py-2  ml-[230px] fixed top-0 inset-x-0">
                <h1 className="font-semibold">Home</h1>
            </div>

            <div className="mt-11">
                <div className=" px-4 py-8 flex gap-6">
                    <div onClick={() => setModal(prev => ({...prev, productSearch: true}))} className="cursor-pointer px-6 border-2 border-red-50 hover:border-red-300 py-4 flex flex-col items-center gap-4 rounded-lg bg-red-50">
                        {/* <div className="h-12 w-12 flex items-center justify-center bg-white backdrop-blur-md  rounded-full">
                            <PackageSearch/>
                        </div> */}
                        <div className="h-16 w-16  border-red-400 bg-red-200 backdrop-blur-lg rounded-full flex justify-center items-center">
                            <Plus className="h-10 w-10 stroke-red-400"/>
                        </div>

                        <p className="text-center font-semibold">Create Post</p>
                    </div>
                    <Link to='/automate' className="cursor-pointer px-6 border-2 border-red-50 hover:border-red-300 py-4 flex flex-col items-center gap-4 rounded-lg bg-red-50">
                        {/* <div className="h-12 w-12 flex items-center justify-center bg-white backdrop-blur-md  rounded-full">
                            <SiX className=""/>
                        </div> */}
                        <div className="h-16 w-16  border-red-400 bg-red-200 backdrop-blur-lg rounded-full flex justify-center items-center">
                            <Plus className="h-10 w-10 stroke-red-400"/>
                        </div>

                        <p className="text-center font-semibold">Automate Posting</p>
                    </Link>

                    {/* <Link to={'/new'}>
                        NewDashboard
                    </Link> */}



                </div>

                <div>
                    <div className=" flex justify-between px-6 py-2">
                        <h1 className="font-semibold">Scheduled</h1>
                    </div>

                    <div className="flex mx-4 flex flex-wrap gap-6 pb-4  overflow-x-auto">
                        {scheduledPosts &&
                            scheduledPosts.map(scheduled => scheduled.isPublished &&
                                <div className="px-4 py-4 flex gap-12 rounded-xl bg-green-200">
                                    <div className="flex flex-col justify-between gap-4">
                                        <div className="">
                                            <p className="px-2 mb-1 rounded-full w-fit bg-black text-white font-semibold text-sm">Scheduled</p>
                                            <p className="ml-1 font-semibold">{scheduled?.postSlug}</p>
                                            {/* <p className="ml-1 text-sm text-blue-500">{getTimeRemaining(scheduled.postAt)}</p> */}
                                        </div>
                                        <div>
                                            <p className="ml-1 text-xs">️will be posted by:</p>
                                            <p className="ml-1 text-sm font-semibold">{formatDateAndTime(scheduled?.postAt)}</p>
                                        </div>
                                    </div>

                                    <div className=" flex gap-3 flex-col justify-center items-center">
                                        <p className="text-sm font-bold">On</p>
                                        <div className="p-1 bg-white rounded-lg border">
                                            <SiX className="h-7 w-7"/>
                                        </div>
                                        <Button onClick={() => {
                                            setCurrentPost('')
                                            setCurrentProductScheduled(scheduled)
                                            setModal(prev => ({...prev, postModal: true}))
                                        }} className="rounded-full" variant="outline">view</Button>
                                    </div>
                                </div>
                            )
                        }

                    </div>
                </div>


                <div className="mb-12">
                    <div className=" flex justify-between px-6 py-2 pt-6">
                        <h1 className="font-semibold">Posted</h1>
                    </div>

                    <div className="flex mx-4 flex flex-wrap gap-6 pb-4  overflow-x-auto">
                        {posted &&
                            posted.map(post =>
                                <div className="px-4 py-4 flex gap-12 rounded-xl bg-blue-200">
                                    <div className="flex flex-col justify-between gap-4">
                                        <div className="">
                                            <p className="px-2 mb-1 rounded-full w-fit bg-black text-white font-semibold text-sm">Posted</p>
                                            <p className="ml-1 font-semibold">{post?.post_id}</p>
                                            {/* <p className="ml-1 text-sm text-blue-500">{getTimeRemaining(scheduled.postAt)}</p> */}
                                        </div>
                                        <div>
                                            <p className="ml-1 text-xs">Posted on:</p>
                                            <p className="ml-1 text-sm font-semibold">{formatDateAndTime(post?.createdAt)}</p>
                                        </div>
                                    </div>

                                    <div className=" flex gap-3 flex-col justify-center items-center">
                                        <p className="text-sm font-bold">On</p>
                                        <div className="p-1 bg-white rounded-lg border">
                                            <SiX className="h-7 w-7"/>
                                        </div>
                                        <Button onClick={() => {
                                            setCurrentProductScheduled('')
                                            setCurrentPost(post)
                                            setModal(prev => ({...prev, postModal: true}))
                                        }} className="rounded-full" variant="outline">view</Button>
                                    </div>
                                </div>
                            )
                        }

                    </div>
                </div>
            </div>
        </>
    )
}
