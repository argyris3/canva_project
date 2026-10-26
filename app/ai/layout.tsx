import AppHeader from '@/components/custom/dashboard/AppHeader'
import { AppSidebar } from '@/components/custom/dashboard/AppSideBar'
import { SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'

function AiLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            {/* The AI helper overview is informational, but it still belongs inside the authenticated app shell. */}
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

export default AiLayout
