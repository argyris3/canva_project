"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useUser } from '@clerk/nextjs'
import { Bell, Bot, Palette, Save, User } from 'lucide-react'
import React, { useState } from 'react'

function SettingToggle({
    title,
    description,
    defaultChecked = true,
}: {
    title: string
    description: string
    defaultChecked?: boolean
}) {
    // Settings are currently local UI state; wire these switches to persistence when preferences are added.
    const [checked, setChecked] = useState(defaultChecked)

    return (
        <div className="flex items-center justify-between gap-4 border-b py-4 last:border-b-0">
            <div>
                <h3 className="text-sm font-medium text-gray-950">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
            <Switch checked={checked} onCheckedChange={setChecked} />
        </div>
    )
}

function SettingsSection({
    icon: Icon,
    title,
    children,
}: {
    icon: React.ElementType
    title: string
    children: React.ReactNode
}) {
    // Reuse one section wrapper so settings groups stay visually consistent.
    return (
        <section className="rounded-xl border bg-white p-5">
            <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-primary">
                    <Icon className="h-4 w-4" />
                </div>
                <h2 className="font-semibold text-gray-950">{title}</h2>
            </div>
            {children}
        </section>
    )
}

function SettingsPage() {
    // Clerk owns the authoritative profile values shown in the profile fields.
    const { user } = useUser()

    return (
        <div className="mx-auto max-w-4xl">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-950">Settings</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Manage your workspace, AI helper, and notification preferences.
                    </p>
                </div>
                <Button className="w-fit gap-2">
                    <Save className="h-4 w-4" />
                    Save
                </Button>
            </div>

            <div className="grid gap-5">
                <SettingsSection icon={User} title="Profile">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" defaultValue={user?.fullName || ''} placeholder="Your name" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" defaultValue={user?.primaryEmailAddress?.emailAddress || ''} placeholder="you@example.com" />
                        </div>
                    </div>
                </SettingsSection>

                <SettingsSection icon={Bot} title="AI Helper">
                    <SettingToggle
                        title="Show AI helper"
                        description="Keep the AI helper available inside the whiteboard."
                    />
                    <SettingToggle
                        title="Focus generated content"
                        description="Move the canvas view to new AI output automatically."
                    />
                </SettingsSection>

                <SettingsSection icon={Palette} title="Canvas">
                    <SettingToggle
                        title="Clean board style"
                        description="Start new boards with a simple canvas."
                    />
                </SettingsSection>

                <SettingsSection icon={Bell} title="Notifications">
                    <SettingToggle
                        title="Board updates"
                        description="Show useful updates about board activity."
                    />
                </SettingsSection>
            </div>
        </div>
    )
}

export default SettingsPage
