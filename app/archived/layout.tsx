import AppHeader from '@/components/custom/dashboard/AppHeader'
import { AppSidebar } from '@/components/custom/dashboard/AppSideBar'
import { SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'

function ArchivedLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            {/* Archived boards live in the same app shell as the active dashboard. */}
            <AppSidebar />
            <div className="flex flex-1 flex-col">
                <AppHeader />
                <div className="p-5">
                    {children}
                </div>
            </div>
        </SidebarProvider>
    )
}

export default ArchivedLayout
