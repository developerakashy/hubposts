import Sheet from "@/components/RightSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { ProductCard } from "./ProductCard";
import axios from "axios";
import urlJoin from "url-join";
import { Plus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
const EXAMPLE_MAIN_URL = window.location.origin;

export default function Automation(){
    const [productAdded, setProductAdded] = useState([])
    const [productList, setProductList] = useState([])
    const [searchQuery, setSearchQuery] = useState('')

    const [interval, setInterval] = useState('')
    const [intervalValue, setIntervalValue] = useState({
        daily: 1,
        hourly: 1
    })
    const [contentType, setContentType] = useState('')
    const [endOption, setEndOption] = useState('')
    const [time, setTime] = useState('')


    useEffect(() => {
        let timeout = setTimeout(() => {
            console.log('Debouncing')
            getProducts()
        }, 1000)

        return () => {
            clearTimeout(timeout)
        }
    }, [searchQuery])

    const handleProductRemove = (id) => {
        setProductAdded(prev =>
            prev.filter(product => product.id !== id)
        )
    }

    const handleProductAdd = (product) => {
        setProductAdded(prev => [...prev, {
            id: product?.id,
            uid: product?.uid,
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
        }])
    }

    const getProducts = async () => {
        try {
            const { data } = await axios.get(urlJoin(EXAMPLE_MAIN_URL, `/api/products?q=${searchQuery}`),{
                headers: {
                    "x-company-id": 10327,
                }
            });

            setProductList(data.items)
            console.log(data.items)

        } catch (error) {
            console.log(error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)



        const payload = {
            company_id: 10327,
            type: contentType,
            products: productAdded,
            interval: interval,
            intervalValue: interval === "daily" ? formData.get("interval_day") : formData.get("interval_hour"),
            time: formData.get("time") || null,
            endOption: endOption,
            times: formData.get("times") || null,
            until: formData.get("until") || null,
            platform: "twitter",
        };


        try {
            const res = await axios.post(urlJoin(EXAMPLE_MAIN_URL, '/post/automate'), payload, {
                headers: {
                    'x-company-id': 10327
                }
            })

            
            console.log(res)
        } catch (error) {
            console.log(error)
        }

    }

    const isIntervalValid = () => {
        console.log(interval, intervalValue, endOption)

        if (!interval) return false;
        if (interval === 'hourly' && !intervalValue.hourly) return false;
        if (interval === 'daily' && !intervalValue.daily) return false;
        // if (endOption === 'times' && !formData.get('times')) return false;
        // if (endOption === 'until' && !formData.get('until')) return false;
        return true;
    }


    return (
        <form onSubmit={handleSubmit} className="border min-h-dvh w-vw bg-slate-50">
            <div className="flex sticky top-0 justify-between px-12 py-4">
                <p className="font-semibold">Promote products</p>
                <div className="flex gap-4">
                    <Button variant="outline">Test</Button>
                    <Button
                        type="submit"
                        variant="default"
                        disabled={!contentType || productAdded.length < 2 || !isIntervalValid()}
                    >Publish</Button>
                </div>
            </div>
            <div className="mx-auto w-fit my-12">

                <div className="flex flex-col bg-white gap-4 px-4 py-4 border-4 rounded-3xl">
                    <p className="font-semibold">Select Type</p>
                    <div className="">
                        <Select value={contentType} onValueChange={setContentType}>
                            <SelectTrigger className="w-[280px]">
                                <SelectValue placeholder="Content Type"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Select one</SelectLabel>
                                    <SelectItem value="products">Products</SelectItem>
                                    <SelectItem value="collections">Collections</SelectItem>
                                    <SelectItem value="brands">Brands</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                </div>
                {contentType &&
                    <>
                        <div className="h-35">
                            <div className="h-full border-2 border-blue-500 mx-auto w-fit border-dashed">
                            </div>
                        </div>

                        <div className="relative flex flex-col bg-white gap-4 px-4 py-4 border-4 rounded-3xl">
                            <p className="font-semibold">Add product</p>
                            <div>
                                <p>Total: {productAdded.length}</p>
                            </div>
                            <div className="flex gap-4 justify-evenly">
                                <Sheet triggerName={'Add product'}  title={'Search product'}>
                                    <div className="p-4 overflow-auto">
                                        <Input
                                            className="mb-4"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />

                                        <div className="flex flex-col gap-2">
                                            {productList ?
                                                productList.map(product =>
                                                    <div key={product.id} className="relative">
                                                        <ProductCard product={product} isSmall={true} className={`p-2 pointer-events-none`}/>
                                                        { productAdded.find(prod => prod.id === product.id) ?
                                                            <button className="rounded-full cursor-pointer border-red-500 hover:bg-red-100 hover:border-red-100 border absolute top-2 right-2 p-1" onClick={() => handleProductRemove(product.id)}><X className="h-3 stroke-red-500 w-3"/></button> :
                                                            <button className="rounded-full cursor-pointer hover:bg-stone-100 border absolute top-2 right-2 p-2" onClick={() => handleProductAdd(product)}><Plus className="h-4 w-4"/></button>
                                                        }
                                                    </div>
                                                ) : null
                                            }
                                        </div>
                                    </div>
                                </Sheet>
                                <Sheet triggerName={'Added products'} variant="outline"  title={'Organize product'}>
                                    <div className="p-4 overflow-auto">
                                        <div className="flex flex-col gap-2">
                                            {productAdded ?
                                                productAdded.map(product =>
                                                    <div key={product.id} className="relative">
                                                        <ProductCard product={product} isSmall={true} className={`p-2 pointer-events-none`}/>
                                                        <button className="rounded-full cursor-pointer border-red-500 hover:bg-red-100 hover:border-red-100 border absolute top-2 right-2 p-1" onClick={() => handleProductRemove(product.id)}><X className="h-3 stroke-red-500 w-3"/></button>

                                                    </div>
                                                ) : null
                                            }
                                        </div>

                                    </div>
                                </Sheet>
                            </div>

                        </div>
                    </>
                }

                {productAdded.length > 0 &&
                    <>
                        <div className="h-35">
                            <div className="h-full border-2 border-blue-500 mx-auto w-fit border-dashed">
                            </div>
                        </div>

                        <div className="relative flex flex-col bg-white gap-4 px-4 py-4 border-4 rounded-3xl">
                            <p className="font-semibold">Select Interval</p>
                            <div className="flex flex-col gap-4">
                                <RadioGroup value={interval} onValueChange={setInterval}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="hourly" id="every_hour"/>
                                        <Label htmlFor="every_hour" className="flex items-center space-x-2">
                                            <span>Every</span>
                                            <Input
                                                className="w-14 p-2 h-8"
                                                type="number"
                                                value={intervalValue.hourly}
                                                min={1}
                                                max={23}
                                                name="interval_hour"
                                                onChange={(e) => setIntervalValue(prev => ({...prev, hourly: e.target.value}))}
                                                disabled={interval !== 'hourly'}
                                                required={interval === 'hourly'}
                                            />
                                            <span>hour</span>
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="daily" id="every_day"/>
                                        <Label htmlFor="every_day" className="flex items-center space-x-2">
                                            <span>Every</span>
                                            <Input
                                                className="w-14 p-2 h-8"
                                                type="number"
                                                defaultValue={1}
                                                min={1}
                                                max={30}
                                                onChange={(e) => setIntervalValue(prev => ({...prev, daily: e.target.value}))}
                                                name="interval_day"
                                                disabled={interval !== 'daily'}
                                                required={interval === 'daily'}

                                            />
                                            <span>day</span>
                                        </Label>
                                    </div>
                                </RadioGroup>

                                {
                                    (interval && interval !== 'hourly') &&
                                    <>
                                        <Separator/>

                                        <Label>
                                            At
                                            <Input
                                                className="w-30"
                                                type="time"
                                                name="time"
                                                id="time"
                                                onChange={(e) => setTime(e.target.value)}
                                            />
                                        </Label>
                                    </>
                                }

                                {
                                    ((interval && interval === 'hourly') || (interval && interval !== 'hourly' && time)) &&

                                    <>
                                        <Separator/>

                                        <RadioGroup value={endOption} onValueChange={setEndOption}>
                                            {/* <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="forever" id="forever"/>
                                                <Label htmlFor="forever" className="flex items-center space-x-2">
                                                    Forever
                                                </Label>
                                            </div> */}

                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="times" id="times"/>
                                                <Label htmlFor="times">

                                                    <Input
                                                        className="w-15"
                                                        type="number"
                                                        name="times"
                                                        min={1}
                                                        id="times"
                                                        disabled={endOption !== 'times'}
                                                        required={endOption === 'times'}

                                                    />

                                                    Times total
                                                </Label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="until" id="until"/>
                                                <Label>
                                                    Until
                                                    <Input
                                                        className="w-38"
                                                        type="date"
                                                        name="until"
                                                        id="until"
                                                        disabled={endOption !== 'until'}
                                                        required={endOption === 'until'}
                                                    />
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </>
                                }


                            </div>
                        </div>
                    </>
                }

                {productAdded.length > 0 && interval && endOption &&
                    <>
                        <div className="h-35">
                            <div className="h-full border-2 border-blue-500 mx-auto w-fit border-dashed">
                            </div>
                        </div>

                        <div className="relative flex flex-col bg-white gap-4 px-4 py-4 border-4 rounded-3xl">
                            <div>
                                <p className="font-semibold">Posting on:</p>
                                <p>Twitter</p>
                            </div>
                            <div>
                                {/* <Button>With Approval</Button> */}

                            </div>
                        </div>
                    </>
                }


            </div>
            <input type="hidden" name="interval" value={interval} />
            <input type="hidden" name="end_option" value={endOption} />
            <input type="hidden" name="content_type" value={contentType} />

        </form>
    )
}
