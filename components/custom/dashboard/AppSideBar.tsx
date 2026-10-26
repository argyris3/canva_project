"use client"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenuButton,
} from "@/components/ui/sidebar"
import { useUser } from "@clerk/nextjs"
import { Archive, LayoutGrid, Settings, Sparkles, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation";
import CreateNewBoardDialog from "./CreateNewBoardDialog"
import { useContext } from "react"
import { UserDetailContext } from "@/context/UserDetailContext"

export function AppSidebar() {

    const path = usePathname();
    const { user } = useUser();
    const { userDetail, setUserDetail } = useContext(UserDetailContext);
    // Credits are displayed as a simple usage meter until billing or plan limits are added.
    const totalMaxCredits = 10;
    return (
        <Sidebar>
            <SidebarHeader className="p-4">
                <div className="flex items-center gap-2">
                    <Image src="/logo.svg" alt="Logo" width={40} height={40} />
                    <h2 className="text-xl font-bold">WhizBoard</h2>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup >
                    <CreateNewBoardDialog />
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>My Boards</SidebarGroupLabel>
                    {/* Active route checks keep sidebar state in sync with Next navigation. */}
                    <SidebarMenuButton className="p-5" isActive={path === '/dashboard'} render={<Link href="/dashboard" />} >
                        <LayoutGrid />
                        <span>All Files</span>
                    </SidebarMenuButton>
                    {/* <SidebarMenuButton className="p-5 mt-2" isActive={path === '/shared-files'} >
                        <Users />
                        <span>Shared</span>
                    </SidebarMenuButton> */}
                    <SidebarMenuButton className="p-5 mt-2" isActive={path === '/archived'} render={<Link href="/archived" />} >
                        <Archive />
                        <span>Archived</span>
                    </SidebarMenuButton>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Others</SidebarGroupLabel>
                    <SidebarMenuButton className="p-5" isActive={path === '/ai'} render={<Link href="/ai" />} >
                        <Sparkles />
                        <span>AI Helper</span>
                    </SidebarMenuButton>
                    <SidebarMenuButton className="p-5" isActive={path === '/settings'} render={<Link href="/settings" />} >
                        <Settings />
                        <span>Settings</span>
                    </SidebarMenuButton>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter >
                {/* Duplicate create action keeps board creation available near the usage meter. */}
                <CreateNewBoardDialog />

                <div className="p-4 my-1 border rounded-md">
                    {/* The schema starts users with 3 credits, but this meter shows usage against a planned max. */}
                    <h2 className="text-sm flex justify-between mb-1">{totalMaxCredits - userDetail?.credits} files created <span>Total {totalMaxCredits}</span></h2>

                    <Progress value={((totalMaxCredits - userDetail?.credits) / totalMaxCredits) * 100} className="h-2 mt-2" />
                </div>

                <div className="flex items-center gap-2 p-4 border rounded-md">
                    {user?.imageUrl && (
                        <Image src={user.imageUrl} alt="User Image" width={40} height={40}
                            className="rounded-full"
                        />
                    )}
                    <h2>{user?.firstName} {user?.lastName}</h2>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
