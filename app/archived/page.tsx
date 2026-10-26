import ArchivedProjectList from '@/components/custom/dashboard/ArchivedProjectList'
import React from 'react'

function ArchivedPage() {
    return (
        <div>
            {/* ArchivedProjectList handles restore and permanent-delete workflows. */}
            <ArchivedProjectList />
        </div>
    )
}

export default ArchivedPage
