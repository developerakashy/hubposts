import formatTweetText from "@/lib/formatTweet";
import axios from "axios"
import { useEffect, useState } from "react"
import urlJoin from "url-join"
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { formatDateAndTime } from "@/lib/utils";
import { toast } from "sonner";
const EXAMPLE_MAIN_URL = window.location.origin;


export default function PostModal({product:productPost, twitterUser, post:posted, closeModal}){
    const [product, setProduct] = useState(productPost || '')
    const [post, setPost] = useState(posted || '')
    const [loading, setLoading] = useState({
        deleting: false,
        revoking: false,
        approving: false
    })

    const deletePostScheduled = async (id) => {
        if(loading.deleting) return
        try {
            setLoading(prev => ({...prev, deleting: true}))
            const res = await axios.delete(urlJoin(EXAMPLE_MAIN_URL, '/post/scheduled'), {
                params: {
                    id
                }
            })
            console.log(res)
            toast.success('Scheduled post deleted successfully')
            closeModal()
        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message || 'something went wrong')
        } finally {
            setLoading(prev => ({...prev, deleting: false}))
        }
    }

    const deletePostPosted = async (id) => {
        if(loading.deleting) return
        try {
            setLoading(prev => ({...prev, deleting: true}))
            const res = await axios.delete(urlJoin(EXAMPLE_MAIN_URL, `/auth/delete/${id}`))

            console.log(res)
            toast.success('Post deleted successfully')
            closeModal()
        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message || 'something went wrong')
        } finally {
            setLoading(prev => ({...prev, deleting: false}))
        }
    }

    const revokeApproval = async (postId) => {
        try {
            const res = await axios.put(urlJoin(EXAMPLE_MAIN_URL, '/post/scheduled'), {
                id
            })
        } catch (error) {

        }
    }

    return (
        <>
            <button onClick={closeModal} className="cursor-pointer group fixed top-8 right-8 z-60 p-1 rounded-full border-2 border-zinc-50 hover:bg-zinc-50"><X className="group-hover:stroke-black stroke-white stroke-2 h-5 w-5"/></button>
            <div onClick={(e) => {
                e.stopPropagation()
                closeModal()
            }} className="fixed inset-0 overflow-hidden bg-slate-500/50 backdrop-blur-sm z-50 flex h-dvh  justify-center gap-2 pt-12">
                <div onClick={(e) => {
                    e.stopPropagation()
                }} className="min-w-[400px] w-[450px] h-fit p-4 bg-blue-500 rounded-3xl flex flex-col gap-4">
                    <div className="ml-2 flex justify-between items-center">
                        <p className="text-white  font-semibold">{product ?  product?.postSlug : post?.post_id}</p>
                        {
                            post?.post_id ?
                            <Button onClick={() => deletePostPosted(post?.post_id)} variant="destructive" disabled={loading.deleting} className="rounded-full">{loading.deleting ? 'Deleting...' : 'Delete'}</Button>:
                            product ?
                            <Button onClick={() => deletePostScheduled()} variant="destructive" className="rounded-full">Delete</Button> :
                            null
                        }
                    </div>
                    <div className="w-full min-h-45 rounded-3xl p-4 bg-white">
                        <div className="flex gap-2">
                            <img className="h-10 w-10 rounded-full" src={twitterUser?.profile_image_url} alt="" />
                            <div className="text-[15px]">
                                <p className="text-sm text-[#0F1419] font-semibold dark:ext-[#E7E9EA]">{twitterUser?.name}</p>
                                <p className="text-sm text-[#536471] dark:ext-[#71767B]">@{twitterUser?.username}</p>
                            </div>

                        </div>
                        <div>
                            <p className="pt-2 text-[17px] whitespace-pre-line dark:ext-[#E7E9EA]">
                                {formatTweetText(product ? product?.text : post?.text)}
                            </p>
                        </div>
                    </div>

                    <div  className="flex gap-4 min-w-[400px]">
                        {post?.post_id ?
                            <div className="flex gap-2">

                                <Button onClick={(e) => {
                                    e.stopPropagation()
                                }} className="rounded-full">
                                    <a
                                        className=""
                                        href={`https://x.com/${twitterUser.usernmae}/status/${post?.post_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        view on X
                                    </a>
                                </Button>
                            </div>
                            : null
                        }

                        {product?.isApproved ?
                            <div>
                                <div className="flex gap-2">
                                    <Button variant="destructive" className="bg-red-200 text-red-900 hover:bg-red-300 font-semibold rounded-full">Revoke Approval</Button>

                                </div>
                                <p className="px-2 mt-2 text-sm bg-green-200 rounded-full">will be posted by: <span className="text-normal font-semibold">{formatDateAndTime(product?.postAt)}</span></p>
                            </div>:
                            product ?
                            <div>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="rounded-full">Approve</Button>
                                    <Button variant="destructive" className="rounded-full">Delete</Button>
                                </div>
                                <p className="px-2 mt-2 text-sm bg-green-200 rounded-full">Posting date is: <span className="text-normal font-semibold">{formatDateAndTime(product?.postAt)}</span></p>
                            </div> : null
                        }



                    </div>
                </div>

            </div>
        </>
    )
}
