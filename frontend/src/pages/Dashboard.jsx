import '@/src/styles/home.css'
import { Link, NavLink, Outlet } from 'react-router-dom'

const Dashbaord = () => {

    return (
        <div className={`flex`}>

            <div className=" h-dvh w-[230px] flex flex-col fixed bg-blue-50">
                <p className="mx-4 my-4 text-xl cursor-pointer">Social Autopilot</p>
                <NavLink to='' end className={({isActive}) => `${isActive ? 'bg-blue-200 font-semibold text-black' : 'hover:bg-blue-200' } p-2 mx-3 my-1 rounded`}>
                    Home
                </NavLink>
                <NavLink to='posted' className={({isActive}) => `${isActive ? 'bg-blue-200 font-semibold text-black' : 'hover:bg-blue-100' } p-2 mx-3 my-1 rounded`}>
                    Posted
                </NavLink>
                <NavLink to="scheduled" className={({isActive}) => `${isActive ? 'bg-blue-400 font-semibold text-black' : 'hover:bg-blue-200' } p-2 mx-3 my-1 rounded`}>
                    Scheduled
                </NavLink>
                <NavLink to="automated" className={({isActive}) => `${isActive ? 'bg-blue-400 font-semibold text-black' : 'hover:bg-blue-200' } p-2 mx-3 my-1 rounded`}>
                    Automated
                </NavLink>



            </div>

            <div className="flex-grow ml-[230px]">
                <Outlet/>
            </div>
        </div>
    )
}

export default Dashbaord
