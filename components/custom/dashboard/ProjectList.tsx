"use client"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Lock, Share2, Trash2 } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import CreateNewBoardDialog from './CreateNewBoardDialog'
import axios from 'axios'
import moment from 'moment'
import { toast } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'
type Project = {
    projectName: string,
    id: number,
    projectId: string,
    createdAt: string,
    previewImage: string | null,
    updatedAt: string | null,
    userEmail: string,
    isShareable: boolean | null
}

function ProjectList() {

    const [projectList, setProjectList] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter();
    useEffect(() => {
        // Fetch active boards when the dashboard list first mounts.
        GetProjectList();
    }, [])

    const GetProjectList = async () => {
        setLoading(true);
        try {
            // Without query params the projects API returns non-archived boards for the current user.
            const result = await axios.get('/api/projects');
            setProjectList(result.data);
        } finally {
            setLoading(false);
        }
    }

    const handleDeleteProject = async (projectId: string) => {
        // Regular delete is a soft delete; the board moves to the archive page.
        await axios.delete('/api/projects', {
            data: {
                projectId: projectId
            }
        })
        toast.add({
            type: 'success',
            title: 'Move Projected to Archived!'
        });
        GetProjectList();
    }

    if (loading) {
        return (
            <div className="mt-10">
                <div>
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="mt-3 h-4 w-72 max-w-full" />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div
                            key={index}
                            className="overflow-hidden rounded-xl border bg-white"
                        >
                            <Skeleton className="aspect-[4/3] w-full rounded-none" />
                            <div className="p-4">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="mt-3 h-3 w-1/2" />
                                <div className="mt-4 flex items-center justify-between border-t pt-3">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (projectList.length === 0) {
        return (
            <Empty className="mt-5 rounded-xl border bg-white">
                <EmptyHeader>
                    <EmptyMedia>
                        <Image src="/folder.png" alt="Folder" width={90} height={90} />
                    </EmptyMedia>
                    <EmptyTitle className="text-2xl font-bold">No Boards Found</EmptyTitle>
                    <EmptyDescription>
                        Create your first board to start brainstorming and planning.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <CreateNewBoardDialog />
                </EmptyContent>
            </Empty>
        )
    }

    return (
        <div>
            <div className="mt-10">
                <div>
                    <h2 className="text-2xl font-bold">Your Boards</h2>
                    <p className="mt-1 text-sm text-gray-400">
                        Create, organize and continue working on your ideas
                    </p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
                    {projectList.map((project: Project) => {
                        // Prefer updatedAt when a board has saved whiteboard content, otherwise show creation time.
                        const editedLabel = project.updatedAt
                            ? `Edited ${moment(project.updatedAt).fromNow()}`
                            : `Created ${moment(project.createdAt).fromNow()}`;

                        return (
                            <div
                                key={project.projectId}
                                className="group hover:cursor-pointer overflow-hidden rounded-xl border bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                            >
                                {/* Dashboard previews come from the latest saved whiteboard thumbnail. */}
                                <div onClick={() => router.push('/workspace/' + project?.projectId)} className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50">
                                    <Badge
                                        variant="outline"
                                        className={`absolute left-3 top-3 z-10 border bg-white/95 shadow-sm backdrop-blur-sm ${project.isShareable
                                            ? 'border-emerald-200 text-emerald-700'
                                            : 'border-gray-200 text-gray-500'
                                            }`}
                                    >
                                        {project.isShareable ? <Share2 /> : <Lock />}
                                        {project.isShareable ? 'Shared' : 'Private'}
                                    </Badge>

                                    {project?.previewImage ? (
                                        <Image
                                            src={project.previewImage}
                                            alt={project.projectName}
                                            fill
                                            className="object-cover border-b transition-transform duration-300 group-hover:scale-[1.02]"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-sm text-gray-400">
                                            No preview
                                        </div>
                                    )}
                                </div>

                                {/* Stop delete clicks from also opening the board card. */}
                                <div className="p-4">
                                    <h2 className="truncate font-semibold text-gray-900">
                                        {project.projectName}
                                    </h2>

                                    <p className="mt-1 text-xs text-gray-400">
                                        {editedLabel}
                                    </p>

                                    <div className="mt-4 flex items-center justify-between border-t pt-3">
                                        <span className="text-xs font-medium text-gray-400">
                                            Whiteboard
                                        </span>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDeleteProject(project.projectId)
                                            }}
                                            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

        </div >
    )
}

export default ProjectList
