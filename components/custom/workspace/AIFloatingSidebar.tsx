"use client"

import React, { useRef, useState } from "react"
import { Monitor, Network, PencilRuler, Smartphone, Sparkles, Workflow, X, WandSparkles, ArrowUp, Loader2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types"
import axios from "axios"

type Props = {
    excalidrawApi: ExcalidrawImperativeAPI | null,
    closeAiHelper: any
}

const AiTools = [
    {
        name: "Generate Diagrams",
        desc: "Create visual diagrams",
        icon: PencilRuler,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        prompt: `
You are an expert visual diagram generation agent.

Your task is to convert the user's idea into a clear, structured, professional diagram.

Instructions:
- Understand the user's intent before generating.
- Identify the main entities, concepts, steps, and relationships.
- Create a clean visual hierarchy.
- Use rectangles for main concepts or processes.
- Use diamonds only for decisions.
- Use arrows to show relationships or direction.
- Keep labels short and readable.
- Avoid overlapping elements.
- Maintain consistent spacing between elements.
- Spread shapes with enough whitespace so labels and lines are easy to read.
- Leave at least 90 to 140 pixels between neighboring shapes.
- Organize the diagram from left-to-right or top-to-bottom depending on what is easiest to understand.
- Add groups or sections when the diagram contains multiple categories.
- Prefer simple layouts over overly complex diagrams.
- Every element must have a unique id.
- Return connections separately using from and to element IDs.
- Ensure every connection goes from one shape edge to another shape edge.
- Avoid routing arrows through unrelated shapes or labels.
- Output only valid JSON.
- Do not include markdown, explanations, or additional text outside the JSON.
`
    },
    {
        name: "Flowchart",
        desc: "Visualize workflows",
        icon: Workflow,
        color: "text-violet-600",
        bgColor: "bg-violet-50",
        prompt: `
You are an expert flowchart generation agent.

Convert the user's description into a professional flowchart.

Instructions:
- Identify the starting point, actions, decisions, branches, and ending points.
- Use ellipses for start and end nodes.
- Use rectangles for actions or processes.
- Use diamonds for decisions.
- Keep the primary workflow flowing from top to bottom.
- Branch secondary flows to the left or right.
- Keep node labels concise.
- Avoid overlapping elements.
- Avoid crossing arrows whenever possible.
- Maintain consistent node dimensions and spacing.
- Spread flowchart nodes so each step and branch is easy to see.
- Leave at least 100 pixels of whitespace between connected flowchart shapes.
- Every element must have a unique id.
- Connections must reference element IDs using from and to.
- Connections must attach to shape edges, not shape centers.
- Label decision connections such as Yes and No.
- Do not manually generate arrow elements inside elements.
- Return connections separately.
- Output only valid JSON.
- Do not return markdown or explanatory text.
`
    },
    {
        name: "Architecture",
        desc: "Design system architecture",
        icon: Network,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        prompt: `
You are a senior software architect and system design visualization agent.

Convert the user's application or system description into a clear system architecture diagram.

Instructions:
- Identify clients, frontend applications, backend services, APIs, databases, queues, storage, authentication systems, external services, and infrastructure.
- Group related components into logical sections.
- Show the direction of data flow using connections.
- Clearly label important connections when useful.
- Place users or client applications on the left or top.
- Place application services in the center.
- Place databases, storage, and infrastructure on the right or bottom.
- Place third-party APIs or external services separately.
- Use consistent component sizes.
- Keep architecture readable.
- Spread components into clear lanes or columns with enough whitespace between services.
- Keep lines connected edge-to-edge and avoid passing lines through other components.
- Include technologies mentioned by the user as labels.
- Avoid unnecessary technologies.
- Every element must have a unique id.
- Return connections separately using from and to IDs.
- Output only valid JSON.
- Do not return markdown, commentary, or explanations.
`
    },
    {
        name: "Web Mockup",
        desc: "Generate web wireframes",
        icon: Monitor,
        color: "text-cyan-600",
        bgColor: "bg-cyan-50",
        prompt: `
You are an expert product designer and web UI wireframe generation agent.

Convert the user's description into a professional desktop web application wireframe.

Instructions:
- Create the interface using simple wireframe-style elements.
- Assume a desktop viewport unless specified otherwise.
- Include navbar, sidebar, page titles, cards, forms, buttons, tables, search, filters and relevant content.
- Use rectangles for containers, cards, buttons, images and input fields.
- Use text elements for labels and content.
- Maintain strong spacing and alignment.
- Keep the design low-fidelity.
- Do not create decorative artwork unless requested.
- Every element must have a unique id.
- Output only valid JSON.
- Do not return markdown or explanations.
`
    },
    {
        name: "Mobile Mockup",
        desc: "Generate app wireframes",
        icon: Smartphone,
        color: "text-pink-600",
        bgColor: "bg-pink-50",
        prompt: `
You are an expert mobile product designer and mobile wireframe generation agent.

Convert the user's app idea into a professional mobile app wireframe.

Instructions:
- Design for a standard mobile screen size.
- Create a phone frame or clear screen boundary.
- Include app header, search, cards, lists, forms, navigation, tabs and relevant UI.
- Use rectangles for UI containers and controls.
- Use text elements for labels.
- Maintain consistent padding and spacing.
- Keep buttons touch friendly.
- Keep the design low-fidelity.
- If multiple screens are needed, arrange them horizontally.
- Every element must have a unique id.
- Output only valid JSON.
- Do not return markdown, explanations, or commentary.
`
    }
]

const AI_PLACEHOLDER_IDS = {
    container: "ai-placeholder-container",
    title: "ai-placeholder-title",
    subtitle: "ai-placeholder-subtitle",
    skeleton1: "ai-placeholder-skeleton-1",
    skeleton2: "ai-placeholder-skeleton-2",
    skeleton3: "ai-placeholder-skeleton-3"
}

const DIAGRAM_SPREAD_SCALE = 1.25

function AIFloatingSidebar({ excalidrawApi, closeAiHelper }: Props) {
    // The sidebar turns a prompt into JSON, then translates that JSON into editable Excalidraw elements.
    const [selectedTool, setSelectedTool] = useState("Generate Diagrams")
    const [userInput, setUserInput] = useState("")
    const [loading, setLoading] = useState(false)

    const placeholderPositionRef = useRef<{ x: number; y: number } | null>(null)

    const getSafeText = (value: unknown) => {
        if (typeof value === "string") return value
        if (typeof value === "number") return String(value)
        return ""
    }

    const getEmptyCanvasPosition = () => {
        if (!excalidrawApi) return { x: 100, y: 100 }

        const placeholderIds = Object.values(AI_PLACEHOLDER_IDS)

        // Ignore the temporary AI placeholder when searching for open canvas space.
        const elements = excalidrawApi.getSceneElements().filter(element => {
            return !element.isDeleted && !placeholderIds.includes(element.id)
        })

        if (elements.length === 0) return { x: 100, y: 100 }

        const maxRight = Math.max(...elements.map(element => element.x + element.width))
        const minTop = Math.min(...elements.map(element => element.y))

        return {
            x: maxRight + 150,
            y: minTop
        }
    }

    const addAiPlaceholder = async () => {
        if (!excalidrawApi) return

        // Place a visible loading skeleton where the generated diagram will appear.
        const { convertToExcalidrawElements } = await import("@excalidraw/excalidraw")
        const position = getEmptyCanvasPosition()

        placeholderPositionRef.current = position

        const placeholderElements = convertToExcalidrawElements([
            {
                type: "rectangle",
                x: position.x,
                y: position.y,
                width: 420,
                height: 250,
                backgroundColor: "#f5f3ff",
                strokeColor: "#8b5cf6",
                fillStyle: "solid",
                strokeWidth: 2,
                roughness: 0,
                roundness: { type: 3 }
            },
            {
                type: "text",
                x: position.x + 28,
                y: position.y + 28,
                text: "✨ Generating with AI",
                fontSize: 22,
                strokeColor: "#6d28d9"
            },
            {
                type: "text",
                x: position.x + 28,
                y: position.y + 65,
                text: "Preparing your diagram...",
                fontSize: 15,
                strokeColor: "#6b7280"
            },
            {
                type: "rectangle",
                x: position.x + 28,
                y: position.y + 115,
                width: 250,
                height: 18,
                backgroundColor: "#ddd6fe",
                strokeColor: "#ddd6fe",
                fillStyle: "solid",
                roughness: 0,
                roundness: { type: 3 }
            },
            {
                type: "rectangle",
                x: position.x + 28,
                y: position.y + 150,
                width: 330,
                height: 18,
                backgroundColor: "#ede9fe",
                strokeColor: "#ede9fe",
                fillStyle: "solid",
                roughness: 0,
                roundness: { type: 3 }
            },
            {
                type: "rectangle",
                x: position.x + 28,
                y: position.y + 185,
                width: 190,
                height: 18,
                backgroundColor: "#ddd6fe",
                strokeColor: "#ddd6fe",
                fillStyle: "solid",
                roughness: 0,
                roundness: { type: 3 }
            }
        ])

        const ids = [
            AI_PLACEHOLDER_IDS.container,
            AI_PLACEHOLDER_IDS.title,
            AI_PLACEHOLDER_IDS.subtitle,
            AI_PLACEHOLDER_IDS.skeleton1,
            AI_PLACEHOLDER_IDS.skeleton2,
            AI_PLACEHOLDER_IDS.skeleton3
        ]

        const placeholderElementsWithIds = placeholderElements.map((element, index) => ({
            ...element,
            id: ids[index]
        }))

        const currentElements = excalidrawApi.getSceneElements()

        excalidrawApi.updateScene({
            elements: [...currentElements, ...placeholderElementsWithIds]
        })

        excalidrawApi.scrollToContent(placeholderElementsWithIds, {
            fitToViewport: true,
            viewportZoomFactor: 0.8
        })
    }

    const removeAiPlaceholder = () => {
        if (!excalidrawApi) return

        // Remove loading skeleton elements by stable ids after success or failure.
        const placeholderIds = Object.values(AI_PLACEHOLDER_IDS)

        const elements = excalidrawApi.getSceneElements()

        const updatedElements = elements.filter(element => {
            return !placeholderIds.includes(element.id)
        })

        excalidrawApi.updateScene({
            elements: updatedElements
        })

        placeholderPositionRef.current = null
    }

    const getNodeCenter = (node: any) => {
        const width = Number(node.width) || 200
        const height = Number(node.height) || 80

        return {
            x: Number(node.x) + width / 2,
            y: Number(node.y) + height / 2
        }
    }

    const getBoundaryPoint = (node: any, target: { x: number; y: number }) => {
        const width = Number(node.width) || 200
        const height = Number(node.height) || 80
        const center = getNodeCenter(node)
        const dx = target.x - center.x
        const dy = target.y - center.y

        if (dx === 0 && dy === 0) {
            return center
        }

        const halfWidth = width / 2
        const halfHeight = height / 2
        const nodeType = String(node.type || "")

        // Pick the point where the arrow ray exits the shape so connectors attach to edges.
        if (nodeType === "ellipse") {
            const scale = 1 / Math.sqrt((dx * dx) / (halfWidth * halfWidth) + (dy * dy) / (halfHeight * halfHeight))

            return {
                x: center.x + dx * scale,
                y: center.y + dy * scale
            }
        }

        if (nodeType === "diamond") {
            const scale = 1 / (Math.abs(dx) / halfWidth + Math.abs(dy) / halfHeight)

            return {
                x: center.x + dx * scale,
                y: center.y + dy * scale
            }
        }

        const scale = Math.min(
            dx === 0 ? Number.POSITIVE_INFINITY : halfWidth / Math.abs(dx),
            dy === 0 ? Number.POSITIVE_INFINITY : halfHeight / Math.abs(dy)
        )

        return {
            x: center.x + dx * scale,
            y: center.y + dy * scale
        }
    }

    const getConnectionPoints = (fromNode: any, toNode: any) => {
        const fromCenter = getNodeCenter(fromNode)
        const toCenter = getNodeCenter(toNode)
        const start = getBoundaryPoint(fromNode, toCenter)
        const end = getBoundaryPoint(toNode, fromCenter)

        return {
            startX: start.x,
            startY: start.y,
            endX: end.x,
            endY: end.y
        }
    }

    const renderAIDiagram = async (diagram: any) => {
        if (!excalidrawApi) return

        const { convertToExcalidrawElements } = await import("@excalidraw/excalidraw")
        const placeholderPosition = placeholderPositionRef.current

        if (!placeholderPosition) {
            console.warn("Placeholder position not found")
            return
        }

        const aiElements = diagram?.elements || []
        const connections = diagram?.connections || []

        if (!aiElements.length) {
            removeAiPlaceholder()
            return
        }

        // Normalize AI coordinates so the generated diagram starts where the placeholder was shown.
        const minX = Math.min(...aiElements.map((element: any) => Number(element.x) || 0))
        const minY = Math.min(...aiElements.map((element: any) => Number(element.y) || 0))

        // Store final absolute positions because connections need the same translated coordinates.
        const positionedNodes = aiElements.map((element: any) => ({
            ...element,
            x: placeholderPosition.x + ((Number(element.x) || 0) - minX) * DIAGRAM_SPREAD_SCALE,
            y: placeholderPosition.y + ((Number(element.y) || 0) - minY) * DIAGRAM_SPREAD_SCALE,
            width: Number(element.width) || 200,
            height: Number(element.height) || 80
        }))

        const getNode = (id: string) => positionedNodes.find((element: any) => element.id === id)

        const shapeElements = positionedNodes.flatMap((element: any) => {
            if (!element?.type || !element?.id) return []

            const baseElement = {
                id: element.id,
                type: element.type,
                x: element.x,
                y: element.y,
                width: element.width,
                height: element.height,
                strokeColor: element.strokeColor || "#1e1e1e",
                backgroundColor: element.backgroundColor || "transparent",
                strokeWidth: Number(element.strokeWidth) || 2,
                strokeStyle: element.strokeStyle || "solid",
                fillStyle: element.fillStyle || "solid",
                roughness: element.roughness ?? 1,
                opacity: element.opacity ?? 100
            }

            if (element.type === "text") {
                return [{
                    ...baseElement,
                    text: getSafeText(element.text || element.label),
                    fontSize: Number(element.fontSize) || 18
                }]
            }

            const labelText = getSafeText(
                typeof element.label === "object" && element.label !== null
                    ? element.label.text
                    : element.label ?? element.text
            )

            return [{
                ...baseElement,
                ...(labelText && {
                    label: {
                        text: labelText,
                        fontSize: Number(element.fontSize) || 18
                    }
                })
            }]
        })

        const connectionElements = connections.map((connection: any, index: number) => {
            const fromNode = getNode(connection.from)
            const toNode = getNode(connection.to)

            if (!fromNode || !toNode) {
                console.warn("Unable to create connection:", connection)
                return null
            }

            const { startX, startY, endX, endY } = getConnectionPoints(fromNode, toNode)

            return {
                id: connection.id || `connection-${index}-${Date.now()}`,
                type: "arrow",
                x: startX,
                y: startY,
                width: endX - startX,
                height: endY - startY,
                start: {
                    id: connection.from
                },
                end: {
                    id: connection.to
                },
                strokeColor: connection.strokeColor || "#1e1e1e",
                strokeWidth: Number(connection.strokeWidth) || 2,
                strokeStyle: connection.strokeStyle || "solid",
                roughness: connection.roughness ?? 1,
                opacity: connection.opacity ?? 100,
                startArrowhead: null,
                endArrowhead: connection.endArrowhead || "arrow",
                ...(connection.label && {
                    label: {
                        text: getSafeText(connection.label),
                        fontSize: Number(connection.fontSize) || 16
                    }
                })
            }
        }).filter(Boolean)

        const newElements = convertToExcalidrawElements([
            ...shapeElements,
            ...connectionElements
        ] as any, {
            regenerateIds: false
        })

        // Swap the placeholder and generated diagram in one scene update to avoid a visual flicker.
        const placeholderIds = Object.values(AI_PLACEHOLDER_IDS)

        const currentElementsWithoutPlaceholder = excalidrawApi.getSceneElements().filter(element => {
            return !placeholderIds.includes(element.id)
        })

        excalidrawApi.updateScene({
            elements: [
                ...currentElementsWithoutPlaceholder,
                ...newElements
            ]
        })

        placeholderPositionRef.current = null

        // Focus after Excalidraw has applied the scene update.
        setTimeout(() => {
            excalidrawApi.scrollToContent(newElements, {
                fitToViewport: true,
                viewportZoomFactor: 0.8
            })
        }, 100)
    }

    const onClickGenerate = async () => {
        if (!userInput.trim() || loading || !excalidrawApi) return

        // Show canvas feedback before the API call so generation feels anchored to a board location.
        setLoading(true)

        try {
            await addAiPlaceholder()
            const currentAiTool = AiTools.find(tool => tool.name === selectedTool)

            const result = await axios.post("/api/ai", {
                userInput,
                type: currentAiTool?.name,
                systemPrompt: currentAiTool?.prompt
            })

            console.log("AI Result:", result.data)

            if (!result.data?.diagramResult) {
                throw new Error("AI did not return diagramResult")
            }

            await renderAIDiagram(result.data.diagramResult)
        } catch (error) {
            console.error("AI generation failed:", error)
            removeAiPlaceholder()
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="absolute right-6 bottom-20 z-[100] w-[420px] overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.16)]">
            <div className="border-b border-gray-100 bg-gradient-to-br from-violet-50/80 via-white to-blue-50/70 px-5 py-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-sm">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h2 className="text-[17px] font-semibold text-gray-900">AI Helper</h2>
                            <p className="mt-0.5 text-xs text-gray-500">Turn your ideas into visual content</p>
                        </div>
                    </div>
                    <button onClick={closeAiHelper} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700">
                        <X size={17} />
                    </button>
                </div>
            </div>

            <div className="p-5">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500">What do you want to create?</h3>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                    {AiTools.map(tool => {
                        const Icon = tool.icon
                        const isSelected = selectedTool === tool.name

                        return (
                            <button key={tool.name} onClick={() => setSelectedTool(tool.name)} className={`group relative flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 ${isSelected ? "border-violet-300 bg-violet-50/70 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm"}`}>
                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tool.bgColor} ${tool.color}`}>
                                    <Icon size={18} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="truncate text-sm font-medium text-gray-800">{tool.name}</h4>
                                    <p className="mt-0.5 truncate text-[11px] text-gray-400">{tool.desc}</p>
                                </div>
                                {isSelected && <div className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-violet-500" />}
                            </button>
                        )
                    })}
                </div>

                <div className="my-5 h-px bg-gray-100" />

                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-800">Describe your idea</h3>
                            <p className="mt-0.5 text-xs text-gray-400">AI will generate it directly on your canvas</p>
                        </div>
                        <WandSparkles size={17} className="text-violet-500" />
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50/70 transition focus-within:border-violet-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-violet-100">
                        <Textarea
                            value={userInput}
                            placeholder="E.g. Create a customer onboarding flow with signup, email verification and subscription decision..."
                            className="min-h-[110px] resize-none border-0 bg-transparent px-4 py-3 text-sm shadow-none outline-none focus-visible:ring-0"
                            onChange={event => setUserInput(event.target.value)}
                        />

                        <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2">
                            <span className="rounded-md bg-white px-2 py-1 text-[11px] font-medium text-gray-500 shadow-sm ring-1 ring-gray-200">
                                {selectedTool}
                            </span>

                            <Button size="sm" className="h-8 gap-1.5 rounded-lg bg-gray-900 px-3 text-xs text-white hover:bg-gray-800" onClick={onClickGenerate} disabled={loading || !userInput.trim()}>
                                {loading ? (
                                    <>
                                        <Loader2Icon size={14} className="animate-spin" />
                                        Generating
                                    </>
                                ) : (
                                    <>
                                        Generate
                                        <ArrowUp size={14} />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                    <p className="text-[11px] text-gray-400">AI generated content can be edited afterwards</p>
                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                        <Sparkles size={11} />
                        AI
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AIFloatingSidebar
