import PostModal from "@/components/PostModal";
import { Button } from "@/components/ui/button";
import { formatDateAndTime } from "@/lib/utils";
import { SiX } from "@icons-pack/react-simple-icons";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import urlJoin from "url-join";
const EXAMPLE_MAIN_URL = window.location.origin;

export default function Scheduled(){
    const { company_id } = useParams();
    const [modal, setModal] = useState({
        productSearch: false,
        postModal: false
    })
    const [loading, setLoading] = useState({
        twitterUser: false
    })
    const [currentProductScheduled, setCurrentProductScheduled] = useState('')
    const [scheduledPosts, setScheduledPosts] = useState([])
    const [twitterUser, setTwitterUser] = useState('')


    useEffect(() => {
        if (modal.productSearch) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [modal.productSearch]);

    const closePostModal = () => {
        setModal(prev => ({...prev, postModal: false}))
    }

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
        getScheduledPosts()
        getTwitterUser()
    }, [])

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


    return(
        <div>
            <div className=" flex justify-between px-6 py-2">
                <h1 className="font-semibold">Scheduled</h1>
            </div>

            {modal.postModal &&
                <PostModal product={currentProductScheduled} twitterUser={twitterUser} closeModal={closePostModal}/>
            }

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
                                    setCurrentProductScheduled(scheduled)
                                    setModal(prev => ({...prev, postModal: true}))
                                }} className="rounded-full" variant="outline">view</Button>
                            </div>
                        </div>
                    )
                }

            </div>
        </div>
    )
}
