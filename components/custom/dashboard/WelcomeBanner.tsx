"use client"

import { Button } from "@/components/ui/button"
import { useUser } from "@clerk/nextjs"
import { ArrowRight, Sparkles } from "lucide-react"
import CreateNewBoardDialog from "./CreateNewBoardDialog"

function WelcomeBanner() {
    // Clerk supplies the first name for a personal dashboard greeting.
    const { user } = useUser()

    return (
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-violet-50 via-white to-blue-50 px-7 py-5">

            {/* Background glow keeps the banner visually distinct from the board grid below. */}
            <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-violet-200/40 blur-3xl" />

            {/* Dot pattern lightly hints at the whiteboard canvas texture. */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, #000 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                }}
            />

            <div className="relative z-10 flex items-center justify-between gap-6">

                {/* Main call-to-action area for quickly creating a board. */}
                <div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-medium text-violet-600">
                        <Sparkles className="h-3.5 w-3.5" />
                        Your creative workspace
                    </div>

                    <h2 className="text-2xl font-bold tracking-tight">
                        Welcome back,{" "}
                        <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                            {user?.firstName || "Creator"}
                        </span>
                        👋
                    </h2>

                    <p className="mt-1.5 text-sm text-muted-foreground">
                        Turn your ideas into diagrams, notes and visuals on an
                        infinite canvas.
                    </p>

                    <div className="mt-4 flex items-center gap-2">
                        <CreateNewBoardDialog />

                        <Button
                            variant="outline"
                            size="lg"
                            className="gap-2  bg-white/70"
                        >
                            <Sparkles className="h-4 w-4 text-violet-600" />
                            Ask AI
                        </Button>
                    </div>
                </div>

                {/* Static mini preview reinforces what users create after clicking the CTA. */}
                <div className="relative hidden h-[115px] w-[210px] shrink-0 rounded-xl border bg-white/80 p-3 shadow-lg md:block">

                    <div className="flex gap-1">
                        <div className="h-2 w-2 rounded-full bg-red-400" />
                        <div className="h-2 w-2 rounded-full bg-yellow-400" />
                        <div className="h-2 w-2 rounded-full bg-green-400" />
                    </div>

                    <div className="absolute left-4 top-10 rotate-[-3deg] rounded-md bg-yellow-100 px-3 py-2 text-[10px] font-medium">
                        New Idea ✨
                    </div>

                    <div className="absolute right-3 top-10 rotate-[2deg] rounded-md bg-violet-100 px-3 py-2 text-[10px] font-medium">
                        AI Brainstorm
                    </div>

                    <div className="absolute bottom-3 left-12 rounded-md bg-blue-50 px-3 py-1.5 text-[9px] font-medium">
                        Design → Build → Ship
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WelcomeBanner
