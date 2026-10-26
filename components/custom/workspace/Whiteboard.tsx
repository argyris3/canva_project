"use client"
import dynamic from 'next/dynamic'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import "@excalidraw/excalidraw/index.css"
import axios from 'axios';
import { useParams } from 'next/navigation';
import './whiteboard.css'
import { ArrowRight, Circle, Diamond, Eraser, Hand, Image, Minus, MousePointer2, Pencil, Sparkles, Square, Type } from 'lucide-react';
import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import FloatingProperties from './FloatingProperties';
import AIFloatingSidebar from './AIFloatingSidebar';
import FloatingActionBar from './FloatingActionBar';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';

const Excalidraw = dynamic(
    () => import("@excalidraw/excalidraw").then((module) => module.Excalidraw),
    {
        ssr: false,
        loading: () => <div className="h-full w-full" aria-label="Loading whiteboard" />
    }
)

const tools = [
    {
        name: "selection",
        icon: MousePointer2,
        color: "text-purple-600"
    },
    {
        name: "hand",
        icon: Hand,
        color: "text-cyan-500"
    },
    {
        name: "rectangle",
        icon: Square,
        color: "text-blue-500"
    },
    {
        name: "diamond",
        icon: Diamond,
        color: "text-emerald-500"
    },
    {
        name: "ellipse",
        icon: Circle,
        color: "text-amber-500"
    },
    {
        name: "arrow",
        icon: ArrowRight,
        color: "text-violet-500"
    },
    {
        name: "line",
        icon: Minus,
        color: "text-pink-500"
    },
    {
        name: "freedraw",
        icon: Pencil,
        color: "text-orange-500"
    },
    {
        name: "text",
        icon: Type,
        color: "text-indigo-500"
    },
    {
        name: "image",
        icon: Image,
        color: "text-green-500"
    },
    {
        name: "eraser",
        icon: Eraser,
        color: "text-rose-500"
    },

]

type Props = {
    onApiReady: (api: ExcalidrawImperativeAPI) => void,
    onSaveReady: (saveWhiteboard: () => Promise<void>) => void,
    readOnly?: boolean
}

const NOTE_TEMPLATES = {
    "sticky-sun": {
        accent: "#f59e0b",
        background: "#fff7d6",
        border: "#f5c451",
        text: "#7c4a03",
        tag: "#ffe6a3"
    },
    "glass-note": {
        accent: "#2563eb",
        background: "#eff6ff",
        border: "#93c5fd",
        text: "#1d4ed8",
        tag: "#dbeafe"
    },
    "task-card": {
        accent: "#10b981",
        background: "#ecfdf5",
        border: "#6ee7b7",
        text: "#047857",
        tag: "#d1fae5"
    }
} as const

const NOTE_MIN_WIDTH = 248
const NOTE_MIN_HEIGHT = 208
const NOTE_PADDING_X = 18
const NOTE_PADDING_Y = 22

function Whiteboard({ onApiReady, onSaveReady, readOnly = false }: Props) {
    // This component owns the live Excalidraw scene and exposes save/API hooks to the workspace route.
    const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
    const saveTimeRef = useRef<any>(null);
    const { projectid } = useParams();
    const [activeTool, setActiveTool] = useState('selection');
    const [selectedElement, setSelectedElemenet] = useState<any>(null);
    const [canvasState, setCanvasState] = useState<any>(null);
    const [ShowAiSidebar, setShowAiSidebar] = useState(false);

    const syncExpandableNotes = (elements: readonly any[]) => {
        if (!excalidrawAPI) return

        let hasUpdates = false

        const updatedElements = elements.map((element) => {
            const customData = element.customData as any

            if (customData?.type !== "floating-note-card") {
                return element
            }

            const noteId = customData.noteId
            const textElement = elements.find((currentElement) => {
                return currentElement.customData?.type === "floating-note-text"
                    && currentElement.customData?.noteId === noteId
                    && !currentElement.isDeleted
            })

            if (!textElement) return element

            // Note cards grow with their text child while keeping a usable minimum size.
            const targetWidth = Math.max(NOTE_MIN_WIDTH, textElement.width + NOTE_PADDING_X * 2)
            const targetHeight = Math.max(NOTE_MIN_HEIGHT, textElement.height + NOTE_PADDING_Y * 2)

            if (Math.abs(element.width - targetWidth) < 2 && Math.abs(element.height - targetHeight) < 2) {
                return element
            }

            hasUpdates = true

            return {
                ...element,
                width: targetWidth,
                height: targetHeight,
                version: element.version + 1,
                updated: Date.now()
            }
        })

        if (hasUpdates) {
            excalidrawAPI.updateScene({
                elements: updatedElements
            })
        }
    }

    const handleCanvasChange = (elements: readonly any[], appState: any, files: any) => {
        setCanvasState(appState);

        const selectedIds = Object.keys(appState.selectedElementIds || {});

        if (selectedIds.length === 1) {
            const element = elements.find((element) => element.id === selectedIds[0]);
            setSelectedElemenet(element || null);
        } else {
            setSelectedElemenet(null);
        }

        if (readOnly) {
            return
        }

        if (saveTimeRef.current) {
            clearTimeout(saveTimeRef.current);
        }

        // Snapshot current scene data so the debounced save persists the exact change that triggered it.
        const elementsToSave = [...elements];
        const appStateToSave = { ...appState };
        const filesToSave = { ...files };

        console.log("Starting save timer...");

        saveTimeRef.current = setTimeout(async () => {
            console.log("Saving canvas...");

            try {
                await SaveCanvasChanges(elementsToSave, appStateToSave, filesToSave);

                console.log("Canvas saved successfully");

                // toast.add({
                //     title: "Changes Saved",
                //     type: "success"
                // });
            } catch (error) {
                console.error("Canvas save failed:", error);

                toast.add({
                    title: "Failed to save changes",
                    type: "error"
                });
            }
        }, 1000);
    };

    const blobToBase64 = useCallback((blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()

            reader.onloadend = () => resolve(reader.result as string)
            reader.onerror = reject

            reader.readAsDataURL(blob)
        })
    }, [])

    const generatePreviewBase64 = useCallback(async (elements: readonly any[], appState: any, files: any) => {
        if (!elements.length) return null

        // Export a small canvas thumbnail for dashboard and archive cards.
        const { exportToBlob } = await import("@excalidraw/excalidraw")
        const blob = await exportToBlob({
            elements,
            appState: {
                ...appState,
                exportBackground: true,
                viewBackgroundColor: "#ffffff",
                exportWithDarkMode: false
            },
            files,
            mimeType: "image/png",
            quality: 1
        })

        return await blobToBase64(blob)
    }, [blobToBase64])

    const SaveCanvasChanges = useCallback(async (elements: readonly any[], appState: any, files: any) => {
        if (readOnly) return

        // Decorative note shadows are UI-only helpers and should not be stored or previewed.
        const elementsWithoutNoteShadows = elements.filter((element) => {
            return element.customData?.type !== "floating-note-shadow"
        })

        const base64ImagePreview = await generatePreviewBase64(elementsWithoutNoteShadows, appState, files);

        const response = await axios.post("/api/whiteboard", {
            elements: elementsWithoutNoteShadows,
            appState,
            files,
            projectId: projectid,
            base64ImagePreview
        });

        console.log("Save response:", response.data);

        return response.data;
    }, [generatePreviewBase64, projectid, readOnly]);

    const saveWhiteboard = useCallback(async () => {
        if (!excalidrawAPI || readOnly) return

        if (saveTimeRef.current) {
            // Manual save should win over a pending autosave to avoid duplicate writes.
            clearTimeout(saveTimeRef.current)
            saveTimeRef.current = null
        }

        try {
            await SaveCanvasChanges(
                excalidrawAPI.getSceneElements(),
                excalidrawAPI.getAppState(),
                excalidrawAPI.getFiles()
            )

            toast.add({
                title: "Changes Saved",
                type: "success"
            });
        } catch (error) {
            console.error("Manual canvas save failed:", error);

            toast.add({
                title: "Failed to save changes",
                type: "error"
            });
        }
    }, [SaveCanvasChanges, excalidrawAPI, readOnly])

    useEffect(() => {
        onSaveReady(saveWhiteboard)
    }, [onSaveReady, saveWhiteboard])
    const changeTool = (tool: any) => {
        if (!excalidrawAPI || readOnly) return;

        // Keep the custom toolbar and Excalidraw's internal active tool in sync.
        setActiveTool(tool);
        excalidrawAPI.setActiveTool({
            type: tool
        })
    }

    const getFloatingPosition = () => {
        if (!selectedElement || !canvasState) {
            return { left: 0, top: 0 }
        }

        const zoom = canvasState.zoom?.value ?? 1
        const scrollX = canvasState.scrollX ?? 0
        const scrollY = canvasState.scrollY ?? 0

        // Convert the selected Excalidraw element's canvas position into browser coordinates.
        const centerX = selectedElement.x + selectedElement.width / 2
        const screenX = (centerX + scrollX) * zoom
        const screenY = (selectedElement.y + scrollY) * zoom


        return {
            left: screenX,
            top: screenY - 60
        }
    }

    const handlePropertyChange = (property: string, value: any) => {
        if (!excalidrawAPI || !selectedElement || readOnly) return;

        const element = excalidrawAPI.getSceneElements();
        const updatedElement = element.map((element) => {
            if (element.id != selectedElement.id) {
                return element;
            }
            return {
                ...element,
                [property]: value,
                version: element.version + 1,
                updated: Date.now()
            }
        });

        excalidrawAPI.updateScene({
            elements: updatedElement
        })

    }

    const handleDeleteElement = () => {
        if (!excalidrawAPI || !selectedElement || readOnly) return;

        const elements = excalidrawAPI.getSceneElements();
        const updatedElements = elements.map((element) => {
            if (element.id === selectedElement.id) {
                return {
                    ...element,
                    isDeleted: true,
                    version: element.version + 1,
                    updated: Date.now()
                }
            }
            return element
        })
        excalidrawAPI.updateScene({
            elements: updatedElements
        })

        setSelectedElemenet(null)



    }

    const handleOnDuplicate = () => {
        if (!excalidrawAPI || !selectedElement || readOnly) return;

        const elements = excalidrawAPI.getSceneElements();
        const duplicateElement = {
            ...selectedElement,
            id: crypto.randomUUID(),
            x: selectedElement.x + 20,
            y: selectedElement.y + 20,
            seed: Math.floor(Math.random() * 1000000),
            version: 1,
            updated: Date.now(),
            isDeleted: false,

        };
        excalidrawAPI.updateScene({
            elements: [
                ...elements,
                duplicateElement
            ]
        })

    }

    const handleBringFrontBack = (type: string) => {
        if (!excalidrawAPI || !selectedElement || readOnly) return;

        console.log(type);

        const elements = excalidrawAPI.getSceneElements();
        // Excalidraw treats scene order as z-index, so moving the selected item in the array changes layering.

        const selected = elements.find((element) => element.id === selectedElement.id);

        if (!selected) return;
        const remainingElements = elements.filter((element) => element.id !== selectedElement.id);

        if (type == 'front') {
            excalidrawAPI.updateScene({
                elements: [

                    ...remainingElements,
                    selected
                ]
            })
        }
        else {
            excalidrawAPI.updateScene({
                elements: [
                    selected,

                    ...remainingElements,

                ]
            })
        }

    }

    const getInsertPosition = (width = 220, height = 160) => {
        if (!excalidrawAPI) return { x: 120, y: 120 }

        const elements = excalidrawAPI.getSceneElements().filter((element) => !element.isDeleted)

        if (elements.length === 0) {
            return { x: 120, y: 120 }
        }

        // New generated assets appear to the right of existing content instead of covering the current work.
        const maxRight = Math.max(...elements.map((element) => element.x + element.width))
        const minTop = Math.min(...elements.map((element) => element.y))

        return {
            x: maxRight + 120,
            y: minTop + Math.max(0, (220 - height) / 2)
        }
    }

    const appendElementsToScene = async (elementsToAdd: any[], regenerateIds = true) => {
        if (!excalidrawAPI || readOnly) return

        // Convert lightweight element definitions into full Excalidraw elements before inserting them.
        const { convertToExcalidrawElements } = await import("@excalidraw/excalidraw")
        const createdElements = convertToExcalidrawElements(elementsToAdd as any, {
            regenerateIds
        })
        const currentElements = excalidrawAPI.getSceneElements()

        excalidrawAPI.updateScene({
            elements: [...currentElements, ...createdElements]
        })

        setTimeout(() => {
            excalidrawAPI.scrollToContent(createdElements, {
                fitToViewport: false,
                viewportZoomFactor: 0.9
            })
        }, 50)
    }

    const handleAddNote = (templateId: string) => {
        const template = NOTE_TEMPLATES[templateId as keyof typeof NOTE_TEMPLATES]

        if (!template) return

        const position = getInsertPosition(260, 220)
        const noteId = crypto.randomUUID()

        appendElementsToScene([
            {
                id: `${noteId}-card`,
                type: "rectangle",
                x: position.x,
                y: position.y,
                width: NOTE_MIN_WIDTH,
                height: NOTE_MIN_HEIGHT,
                strokeColor: template.border,
                backgroundColor: template.background,
                fillStyle: "solid",
                strokeWidth: 2,
                roughness: 0,
                roundness: { type: 3 },
                customData: {
                    type: "floating-note-card",
                    noteId
                }
            },
            {
                id: `${noteId}-pin`,
                type: "rectangle",
                x: position.x + 18,
                y: position.y + 18,
                width: 78,
                height: 28,
                strokeColor: template.tag,
                backgroundColor: template.tag,
                fillStyle: "solid",
                roughness: 0,
                roundness: { type: 3 }
            },
            {
                id: `${noteId}-text`,
                type: "text",
                x: position.x + 18,
                y: position.y + 58,
                text: "",
                fontSize: 22,
                strokeColor: "#334155",
                width: 205,
                fontFamily: 1,
                customData: {
                    type: "floating-note-text",
                    noteId
                }
            }
        ], false)

        excalidrawAPI?.setActiveTool({
            type: "text"
        })
    }

    const handleAddEmoji = (emoji: string) => {
        const position = getInsertPosition(96, 96)

        appendElementsToScene([
            {
                type: "text",
                x: position.x,
                y: position.y,
                text: emoji,
                fontSize: 56,
                strokeColor: "#111827"
            }
        ])
    }

    const handleAddIcon = (icon: { id: string; label: string; svg: string; accent: string }) => {
        if (!excalidrawAPI || readOnly) return

        // Icons are stored as Excalidraw image files and then placed as image elements.
        const fileId = crypto.randomUUID() as any
        const dataURL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(icon.svg)}` as any

        const position = getInsertPosition(72, 72)

        excalidrawAPI.addFiles([
            {
                id: fileId,
                dataURL,
                mimeType: "image/svg+xml",
                created: Date.now()
            }
        ])

        appendElementsToScene([
            {
                type: "image",
                x: position.x,
                y: position.y,
                width: 72,
                height: 72,
                fileId,
                status: "saved"
            }
        ])
    }

    const floatingPosition = getFloatingPosition();


    return (
        <div style={{ height: "90vh" }} className='relative'>
            <Excalidraw
                //@ts-ignore
                excalidrawAPI={(api) => { setExcalidrawAPI(api); onApiReady(api) }}
                onChange={handleCanvasChange}
                initialData={{
                    appState: {
                        currentItemRoughness: 0,
                        viewModeEnabled: readOnly
                    }
                }}
                viewModeEnabled={readOnly}
            />
            {!readOnly && <div
                className='absolute left-4 top-1/2 z-50 -translate-y-1/2
            flex flex-col gap-1
            rounded-2xl bg-white border p-1.5 shadow-xl'
            >
                {tools.map((tool) => {
                    const Icon = tool.icon
                    return (
                        <button key={tool.name} className={`flex h-9 w-9 items-center justify-center rounded-xl transition
                        hover:bg-primary/10 hover:cursor-pointer
                        ${activeTool == tool.name ? "bg-primary/10" : null}`}
                            onClick={() => changeTool(tool.name)}
                        >
                            <Icon size="17" className={tool.color} strokeWidth={3} />
                        </button>
                    )

                })}
            </div>}

            {!readOnly && <FloatingProperties
                selectedElement={selectedElement}
                position={floatingPosition}
                onPropertyChange={(property, value) => handlePropertyChange(property, value)}
                onDelete={() => handleDeleteElement()}
                onDuplicate={() => handleOnDuplicate()}
                onBringToFront={() => handleBringFrontBack('front')}
                onSendToBack={() => handleBringFrontBack('back')}

            />}

            {!readOnly && <FloatingActionBar
                onAddNote={handleAddNote}
                onAddEmoji={handleAddEmoji}
                onAddIcon={handleAddIcon}
                onToggleAi={() => setShowAiSidebar(!ShowAiSidebar)}
                isAiOpen={ShowAiSidebar}
            />}

            {!readOnly && <div className='absolute right-15 bottom-3 z-50'>
                <Button size={'lg'} onClick={() => setShowAiSidebar(!ShowAiSidebar)}>
                    <Sparkles /> AI
                </Button>
            </div>}

            {!readOnly && ShowAiSidebar && <AIFloatingSidebar excalidrawApi={excalidrawAPI}
                closeAiHelper={() => setShowAiSidebar(false)} />}

        </div>
    )
}

export default Whiteboard
