import ProjectList from '@/components/custom/dashboard/ProjectList'
import WelcomeBanner from '@/components/custom/dashboard/WelcomeBanner'
import { UserButton } from '@clerk/nextjs'
import React from 'react'

function DashboardPage() {
    return (
        <div>
            {/* Keep the dashboard focused on onboarding first, then the user's board list. */}
            <WelcomeBanner />

            {/* ProjectList owns loading, empty, and populated states for active boards. */}
            <ProjectList />
        </div>
    )
}

export default DashboardPage
