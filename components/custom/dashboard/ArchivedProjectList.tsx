"use client"

import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import axios from 'axios'
import { ArchiveRestore, FolderOpen, Trash2 } from 'lucide-react'
import moment from 'moment'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

type Project = {
    projectName: string,
    id: number,
    projectId: string,
    previewImage: string | null,
    updatedAt: string | null,
    createdAt: string,
    userEmail: string
}

function ArchivedProjectList() {
    const [projectList, setProjectList] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [busyProjectId, setBusyProjectId] = useState<string | null>(null)

    useEffect(() => {
        // Archived boards are loaded separately so the dashboard stays focused on active work.
        GetArchivedProjects();
    }, [])

    const GetArchivedProjects = async () => {
        setLoading(true);
        // archived=true tells the shared projects endpoint to return soft-deleted boards.
        const result = await axios.get('/api/projects?archived=true');
        setProjectList(result.data);
        setLoading(false);
    }

    const handleRestoreProject = async (projectId: string) => {
        // Track one busy project so repeated restore/delete clicks cannot race each other.
        setBusyProjectId(projectId);
        try {
            await axios.patch('/api/projects', {
                projectId,
                restore: true
            });
            toast.add({
                type: 'success',
                title: 'Project restored!'
            });
            await GetArchivedProjects();
        } finally {
            setBusyProjectId(null);
        }
    }

    const handlePermanentDeleteProject = async (projectId: string) => {
        // Hard delete is intentionally guarded by a browser confirmation.
        const confirmDelete = window.confirm('This will permanently delete the board and its whiteboard data. This cannot be undone.');

        if (!confirmDelete) {
            return;
        }

        setBusyProjectId(projectId);
        try {
            await axios.delete('/api/projects', {
                data: {
                    projectId,
                    permanent: true
                }
            });
            toast.add({
                type: 'success',
                title: 'Project permanently deleted!'
            });
            await GetArchivedProjects();
        } finally {
            setBusyProjectId(null);
        }
    }

    if (loading) {
        return (
            <div className="mt-10 rounded-xl border bg-white p-8 text-sm text-gray-500">
                Loading archived boards...
            </div>
        )
    }

    if (projectList.length === 0) {
        return (
            <div className="mt-10 flex flex-col items-center gap-3 rounded-xl border bg-white p-10 text-center">
                <FolderOpen className="h-12 w-12 text-gray-300" />
                <h2 className="text-2xl font-bold">No Archived Boards</h2>
                <p className="max-w-md text-muted-foreground">
                    Boards you move to archive will appear here with restore and permanent delete options.
                </p>
            </div>
        )
    }

    return (
        <div className="mt-10">
            <div>
                <h2 className="text-2xl font-bold">Archived Boards</h2>
                <p className="mt-1 text-sm text-gray-400">
                    Restore boards to your files or permanently remove them.
                </p>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border bg-white">
                {projectList.map((project: Project) => {
                    // Disable actions only on the row currently being updated.
                    const isBusy = busyProjectId === project.projectId;
                    const editedLabel = project.updatedAt
                        ? `Edited ${moment(project.updatedAt).fromNow()}`
                        : `Created ${moment(project.createdAt).fromNow()}`;

                    return (
                        <div
                            key={project.projectId}
                            className="grid gap-4 border-b p-4 last:border-b-0 sm:grid-cols-[96px_1fr_auto] sm:items-center"
                        >
                            <div className="relative h-24 w-full overflow-hidden rounded-lg bg-gray-50 sm:w-24">
                                {project.previewImage ? (
                                    <Image
                                        src={project.previewImage}
                                        alt={project.projectName}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-gray-300">
                                        <FolderOpen className="h-8 w-8" />
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0">
                                <h3 className="truncate font-semibold text-gray-900">{project.projectName}</h3>
                                <p className="mt-1 text-sm text-gray-400">{editedLabel}</p>
                                <p className="mt-2 text-xs font-medium uppercase tracking-wide text-gray-400">Archived whiteboard</p>
                            </div>

                            <div className="flex flex-wrap gap-2 sm:justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isBusy}
                                    onClick={() => handleRestoreProject(project.projectId)}
                                >
                                    <ArchiveRestore />
                                    Restore
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={isBusy}
                                    onClick={() => handlePermanentDeleteProject(project.projectId)}
                                >
                                    <Trash2 />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default ArchivedProjectList
