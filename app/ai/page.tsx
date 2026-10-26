import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
    ArrowRight,
    Monitor,
    Network,
    PencilRuler,
    Smartphone,
    Sparkles,
    Workflow,
} from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const aiFeatures = [
    {
        title: 'Generate Diagrams',
        description: 'Convert ideas into clean concept diagrams on the canvas.',
        icon: PencilRuler,
    },
    {
        title: 'Flowcharts',
        description: 'Map steps, decisions, and branches for any process.',
        icon: Workflow,
    },
    {
        title: 'Architecture',
        description: 'Create simple system diagrams for apps and services.',
        icon: Network,
    },
    {
        title: 'Web Mockups',
        description: 'Draft desktop wireframes before detailed design.',
        icon: Monitor,
    },
    {
        title: 'Mobile Mockups',
        description: 'Generate mobile app screens and quick layout ideas.',
        icon: Smartphone,
    },
]

function AiHelperPage() {
    // This page documents the tools exposed inside the in-canvas AI sidebar.
    return (
        <div className="mx-auto max-w-5xl">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
                        <Sparkles className="h-4 w-4" />
                        AI Helper
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-950">Create faster on the whiteboard</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                        Turn a short prompt into editable diagrams, flows, architecture maps, and wireframes directly on your board.
                    </p>
                </div>

                <Link href="/dashboard" className={cn(buttonVariants(), 'w-fit gap-2')}>
                    Open boards
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {aiFeatures.map(feature => {
                    // Resolve the icon component per card so the feature list can stay plain data.
                    const Icon = feature.icon

                    return (
                        <div key={feature.title} className="flex gap-4 rounded-xl border bg-white p-5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                                <Icon className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-950">{feature.title}</h2>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">{feature.description}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="mt-6 rounded-xl border bg-white p-5">
                <h2 className="font-semibold text-gray-950">How to use it</h2>
                <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-4">
                    <p>1. Open a whiteboard</p>
                    <p>2. Click AI Helper</p>
                    <p>3. Choose a type</p>
                    <p>4. Describe and generate</p>
                </div>
            </div>
        </div>
    )
}

export default AiHelperPage
