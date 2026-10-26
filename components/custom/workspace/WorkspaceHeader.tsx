"use client"
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import { Copy, DownloadIcon, Save, Share } from 'lucide-react'
import Link from 'next/link'
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/toast'

type Props = {
    selectedTab: any,
    onExport: any,
    projectName: string,
    onSave: any,
    projectId: string,
    isShareable: boolean,
    canEdit: boolean,
    onShareableChange: (isShareable: boolean) => void
}

function WorkspaceHeader({
    selectedTab,
    onExport,
    projectName,
    onSave,
    projectId,
    isShareable,
    canEdit,
    onShareableChange
}: Props) {
    const [origin, setOrigin] = useState('')
    const [isUpdatingShare, setIsUpdatingShare] = useState(false)

    useEffect(() => {
        // Share links need window.location, so compute the origin only after the client mounts.
        setOrigin(window.location.origin)
    }, [])

    const shareLink = useMemo(() => {
        // Memoize to avoid rebuilding the link on unrelated header state changes.
        return origin && projectId ? `${origin}/workspace/${projectId}` : ''
    }, [origin, projectId])

    const updateShareStatus = async (nextIsShareable: boolean) => {
        if (!projectId || isUpdatingShare) return

        // Share status is persisted on the project record because viewers use the same workspace URL.
        setIsUpdatingShare(true)

        try {
            const result = await axios.patch('/api/projects', {
                projectId,
                isShareable: nextIsShareable
            })

            onShareableChange(result.data.isShareable === true)

            toast.add({
                title: nextIsShareable ? 'Share link enabled' : 'Share link disabled',
                type: 'success'
            })
        } catch (error) {
            console.error('Failed to update share status:', error)

            toast.add({
                title: 'Failed to update sharing',
                type: 'error'
            })
        } finally {
            setIsUpdatingShare(false)
        }
    }

    const handleShareOpenChange = (open: boolean) => {
        // Opening the share popover enables link access automatically for owners.
        if (open && canEdit && !isShareable) {
            updateShareStatus(true)
        }
    }

    const copyShareLink = async () => {
        if (!shareLink) return

        try {
            // Clipboard writes are browser-only, so this component is intentionally client-side.
            await navigator.clipboard.writeText(shareLink)

            toast.add({
                title: 'Share link copied',
                type: 'success'
            })
        } catch (error) {
            console.error('Failed to copy share link:', error)

            toast.add({
                title: 'Failed to copy link',
                type: 'error'
            })
        }
    }

    return (
        <div className='p-3 border-b flex justify-between  items-center'>
            <Link href={'/dashboard'}>
                <div className='flex gap-2 items-center'>
                    <Image src={'/logo.svg'} alt='logo' width={35} height={35} />
                    <h2>{projectName}</h2>
                </div>
            </Link>
            {/* Tab state lives in the workspace page so the header can switch the main content area. */}
            <div className=''>
                <Tabs defaultValue="whiteboard" className=""
                    onValueChange={(value) => selectedTab(value)}
                >
                    <TabsList>
                        <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
                        <TabsTrigger value="doc">Doc</TabsTrigger>
                    </TabsList>

                </Tabs>
            </div>

            {/* Owners can save and share; all viewers can still export a PNG. */}
            <div className='flex gap-2'>
                {canEdit && <Button onClick={onSave}> <Save /> Save</Button>}
                {canEdit && (
                    <Popover onOpenChange={handleShareOpenChange}>
                        <PopoverTrigger render={<Button variant="outline" />}>
                            <Share /> Share
                        </PopoverTrigger>
                        <PopoverContent align='end' className='w-80'>
                            <PopoverHeader>
                                <PopoverTitle>Share board</PopoverTitle>
                                <PopoverDescription>
                                    Anyone with this link can view this project.
                                </PopoverDescription>
                            </PopoverHeader>

                            <div className='flex items-center justify-between gap-3 rounded-md border p-3'>
                                <div>
                                    <p className='text-sm font-medium'>Shareable link</p>
                                    <p className='text-xs text-muted-foreground'>
                                        {isShareable ? 'Link access is enabled.' : 'Link access is disabled.'}
                                    </p>
                                </div>
                                <Switch
                                    checked={isShareable}
                                    disabled={isUpdatingShare}
                                    onCheckedChange={(checked) => updateShareStatus(Boolean(checked))}
                                />
                            </div>

                            <div className='flex gap-2'>
                                <Input value={shareLink} readOnly aria-label='Share link' />
                                <Button
                                    size='icon'
                                    variant='outline'
                                    aria-label='Copy share link'
                                    onClick={copyShareLink}
                                    disabled={!shareLink}
                                >
                                    <Copy />
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
                <Button onClick={onExport}> <DownloadIcon /> Export</Button>

            </div>
        </div>
    )
}

export default WorkspaceHeader
