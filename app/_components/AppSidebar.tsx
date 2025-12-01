import React from 'react'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Calendar, Home, Inbox, Megaphone, Search, Settings, Wallet2 } from "lucide-react"
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useAuthContext } from '@/hooks/useAuthContext'
const items = [
    {
        title: "Home",
        url: "/app",
        icon: Home,
    },
    {
        title: "Creative Tools",
        url: "/creative-ai-tools",
        icon: Inbox,
    },
    {
        title: "My Ads",
        url: "/my-ads",
        icon: Megaphone,
    },
    {
        title: "Upgrade",
        url: "#",
        icon: Wallet2,
    },
    {
        title: "Profile",
        url: "#",
        icon: Settings,
    },
]

export function AppSidebar() {
    const path = usePathname();
    const { user, logout } = useAuthContext()
    
    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };
    return (
        <Sidebar>
            <SidebarHeader>
                <div className='p-4'>
                    <Image src={'/lg1.svg'} alt='logo' width={100} height={100}
                        className='w-full h-full' />
                    <h2 className='text-sm text-gray-400 text-center'>Build Awesome</h2>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>

                    <SidebarGroupContent>
                        <SidebarMenu className='mt-5'>
                            {items.map((item, index) => (
                                // <SidebarMenuItem key={item.title} className='p-2'>
                                //     <SidebarMenuButton asChild className=''>
                                <a href={item.url} key={index} className={`p-2 text-lg flex gap-2 items-center
                                 hover:bg-gray-100 hover:text-black rounded-lg ${path.includes(item.url) && 'bg-gray-200ß'}`}>
                                    <item.icon className='h-5 w-5' />
                                    <span>{item.title}</span>
                                </a>
                                //     </SidebarMenuButton>
                                // </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                {!user?
                <Link href={'/login'} >
                <Button className='w-full'>Sign In</Button>
                </Link>:
                <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
                <Image
                    src={'/prof.jpg'}
                    alt="User Avatar"
                    width={32}
                    height={32}
                    className="rounded-full"
                />
                <span className="text-sm font-medium">{user.displayName || "User"}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
            </Button>
        </div>
}
                <h2 className='p-2 text-gray-400 text-sm'>Content here</h2>
            </SidebarFooter>
        </Sidebar>
    )
}