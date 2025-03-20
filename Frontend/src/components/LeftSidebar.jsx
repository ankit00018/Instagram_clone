import {
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  TrendingUp,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar.tsx";
import React from "react";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const sidebarIcons = [
  { icon: <Home />, text: "Home" },
  { icon: <Search />, text: "Search" },
  { icon: <TrendingUp />, text: "Trending" },
  { icon: <MessageCircle />, text: "Messages" },
  { icon: <Heart />, text: "Notification" },
  { icon: <PlusSquare />, text: "Create" },
  {
    icon: (
      <Avatar className="w-6 h-6">
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    ),
    text: "Profile",
  },
  { icon: <LogOut />, text: "Logout" },
];

const LeftSidebar = () => {

    const navigate = useNavigate();

    const logoutHandler = async() =>{
        try {
            const res = await axios.get("http://localhost:8000/api/v1/users/logout",{withCredentials:true})
            if(res.data.success){
                navigate("/login")
                toast.success(res.data.message)
            }
        } catch (error) {
            toast.error(error.response.data.message)
        }
    }

    const sidebarHandler = (textType) =>{
        console.log("Clicked on:", textType);
        if(textType==='Logout') logoutHandler();
    }

    return (
        <div className="fixed top-0 z-10 left-0 px-4 border-r border-gray-400 w-[16%] h-screen">
            <div className="flex flex-col">
                <h1 className="my-8 pl-3 font-bold text-xl">LOGO</h1>
                <div>
            {
                 sidebarIcons.map((item,index) =>{
                    return (
                        <div onClick={() => sidebarHandler(item.text)} key={index} className="flex items-center gap-3 relative hover:bg-gray-100 cursor-pointer rounded-l-lg p-3 my-3">
                            {item.icon}
                            <span>{item.text}</span>
                        </div>
                    )
                })
            }
        </div>
        </div>
        </div>
    )
};

export default LeftSidebar;
