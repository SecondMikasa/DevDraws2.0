"use client"

import {
    useCallback,
    useMemo,
    useState,
    useEffect,
} from "react"

import { nanoid } from "nanoid"

import {
    CanvasState,
    CanvasMode,
    Camera,
    Color,
    Point,
    LayerType,
    Side,
    XYWH
} from "@/types/canvas"

import { Info } from "./info"
import { Participants } from "./participants"
import { Toolbar } from "./toolbar"
import { LayerPreview } from "./layer-preview"
import { SelectionBox } from "./selection-box"
import { CursorsPresence } from "./cursors-presence"
import { SelectionTools } from "./selection-tools"

import { Path } from "./subcomponents/path"

import { useSelf, useStorage } from "@liveblocks/react"
// import { useSelf } from "@liveblocks/react/suspense";
import {
    useHistory,
    useCanUndo,
    useCanRedo,
    useMutation,
    useOthersMapped
} from "@liveblocks/react/suspense";

import { LiveObject } from "@liveblocks/client"

import {
    colorToCss,
    connectionIdToColor,
    findIntersectingLayersWithRectangle,
    penPointsToPathLayer,
    pointerEventToCanvasPoint,
    resizeBounds
} from "@/lib/utils"

import { useDisableScrollBounce } from "@/hooks/use-disable-scroll-bounce"
import { useDeleteLayers } from "@/hooks/use-delete-layer"
import { useBoardLoading } from "@/providers/board-loading-provider"

interface CanvasProps {
    boardId: string;
}

const MAX_LAYERS = 100;

export const Canvas = ({
    boardId
}: CanvasProps) => {

    // const info = useSelf((me) => me.info)
    // console.log(info)
    const pencilDraft = useSelf((me) => me.presence.pencilDraft)
    const { removeLoadingState } = useBoardLoading()

    // Retrieving info about all layers displayed on the canvas
    const layerIds = useStorage((root) => root.layerIds)

    // Mobile detection
    const [isMobile, setIsMobile] = useState(false)
    const [isViewOnly, setIsViewOnly] = useState(false)

    const [canvasState, setCanvasState] = useState<CanvasState>({
        mode: CanvasMode.None
    })

    // We are going to paint all layers with black color initially
    const [lastUsedColor, setLastUsedColor] = useState<Color>({
        r: 0,
        g: 0,
        b: 0,
    })

    const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)

    const history = useHistory()
    const canUndo = useCanUndo()
    const canRedo = useCanRedo()
    const deleteLayers = useDeleteLayers()
    useDisableScrollBounce()

    const insertLayer = useMutation((
        { storage, setMyPresence },
        layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Text | LayerType.Note,
        position: Point,
    ) => {

        const liveLayers = storage.get("layers")

        if (liveLayers.size >= MAX_LAYERS) {
            return
        }

        const liveLayerIds = storage.get("layerIds")

        const layerId = nanoid()
        const layer = new LiveObject({
            type: layerType,
            x: position.x,
            y: position.y,
            width: 100,
            height: 100,
            fill: lastUsedColor,
        })

        liveLayerIds.push(layerId)
        liveLayers.set(layerId, layer)

        setMyPresence({ selection: [layerId] }, { addToHistory: true })
        setCanvasState({ mode: CanvasMode.None })

    }, [lastUsedColor])

    const translateSelectedLayers = useMutation((
        { storage, self },
        point: Point,
    ) => {

        if (canvasState.mode !== CanvasMode.Translating) {
            return
        }

        const offset = {
            x: point.x - canvasState.current.x,
            y: point.y - canvasState.current.y
        }

        const liveLayers = storage.get("layers")

        for (const id of self.presence.selection) {
            const layer = liveLayers.get(id)

            if (layer) {
                layer.update({
                    x: layer.get("x") + offset.x,
                    y: layer.get("y") + offset.y
                })
            }
        }

        setCanvasState({
            mode: CanvasMode.Translating,
            current: point
        })

    }, [
        canvasState
    ])

    const unselectLayers = useMutation((
        { self, setMyPresence }
    ) => {

        if (self.presence.selection.length > 0) {
            setMyPresence({
                selection: []
            }, { addToHistory: true })
        }

    }, [])

    const updateSelectionNet = useMutation((
        { storage, setMyPresence },
        current: Point,
        origin: Point
    ) => {

        const layers = storage.get("layers").toImmutable()

        setCanvasState({
            mode: CanvasMode.SelectionNet,
            origin: origin,
            current
        })

        const ids = findIntersectingLayersWithRectangle(
            layerIds!,
            layers,
            origin,
            current
        )

        setMyPresence({ selection: ids })
    }, [layerIds])

    const startMultiSelection = useCallback((
        current: Point,
        origin: Point
    ) => {

        // SelectionNet Threshold
        if (
            Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5
        ) {
            console.log("Attempting to start selection net")
            setCanvasState({
                mode: CanvasMode.SelectionNet,
                origin,
                current
            })
        }
    }, [])

    const startDrawing = useMutation((
        { setMyPresence },
        point: Point,
        pressure: number
    ) => {
        setMyPresence({
            pencilDraft: [[point.x, point.y, pressure]],
            penColor: lastUsedColor
        })

        setCanvasState({ mode: CanvasMode.Pencil })
    }, [lastUsedColor])

    const continueDrawing = useMutation((
        { self, setMyPresence },
        point: Point,
        e: React.PointerEvent
    ) => {
        const { pencilDraft } = self.presence

        if (
            canvasState.mode !== CanvasMode.Pencil ||
            !pencilDraft
        ) {
            return
        }

        setMyPresence({
            cursor: point,
            pencilDraft: [
                ...pencilDraft,
                [point.x, point.y, e.pressure]
            ]
        })
    }, [canvasState.mode])

    const insertPath = useMutation((
        { storage, self, setMyPresence }
    ) => {
        const liveLayers = storage.get("layers")
        const { pencilDraft, penColor } = self.presence

        if (
            !pencilDraft ||
            pencilDraft.length < 2 ||
            liveLayers.size >= MAX_LAYERS
        ) {
            setMyPresence({ pencilDraft: null })
            return
        }

        const id = nanoid()
        const strokeColor = penColor || lastUsedColor

        liveLayers.set(
            id,
            new LiveObject(penPointsToPathLayer(
                pencilDraft,
                strokeColor
            ))
        )

        const liveLayerIds = storage.get("layerIds")
        liveLayerIds.push(id)

        setMyPresence({ pencilDraft: null })
        setCanvasState({ mode: CanvasMode.None })

    }, [lastUsedColor])

    const resizeSelectedLayer = useMutation((
        { storage, self },
        point: Point
    ) => {

        if (canvasState.mode !== CanvasMode.Resizing) {
            return
        }

        const bounds = resizeBounds(
            canvasState.initialBounds,
            canvasState.corner,
            point
        )

        const liveLayers = storage.get("layers")
        const layer = liveLayers.get(self.presence.selection[0])

        if (layer) {
            layer.update(bounds)
        }

    }, [canvasState])

    // Used for zooming in and out of the canvas
    const onWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault()

        if (isViewOnly) {
            // On mobile/view-only mode, use wheel for zooming
            if (e.ctrlKey || e.metaKey) {
                const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
                setZoom(prev => Math.max(0.1, Math.min(5, prev * zoomFactor)))
            } else {
                // Pan the canvas
                setCamera((camera) => ({
                    x: camera.x - e.deltaX,
                    y: camera.y - e.deltaY
                }))
            }
        } else {
            // Desktop behavior - pan only
            setCamera((camera) => ({
                x: camera.x - e.deltaX,
                y: camera.y - e.deltaY
            }))
        }

    }, [isViewOnly])

    const onPointersMove = useMutation((
        { setMyPresence },
        e: React.PointerEvent
    ) => {

        e.preventDefault()

        // Convert pointer event to canvas coordinates
        const current = pointerEventToCanvasPoint(e, camera)

        // In view-only mode, only allow panning
        if (isViewOnly && canvasState.mode === CanvasMode.Pressing) {
            const offset = {
                x: current.x - canvasState.origin.x,
                y: current.y - canvasState.origin.y
            }
            
            setCamera(prev => ({
                x: prev.x + offset.x,
                y: prev.y + offset.y
            }))
            return
        }

        // Regular desktop behavior
        if (!isViewOnly) {
            if (canvasState.mode === CanvasMode.Pressing) {
                startMultiSelection(current, canvasState.origin)
            }
            else if (canvasState.mode === CanvasMode.SelectionNet) {
                updateSelectionNet(current, canvasState.origin)
            }
            else if (canvasState.mode === CanvasMode.Translating) {
                translateSelectedLayers(current)
            }
            else if (canvasState.mode === CanvasMode.Resizing) {
                resizeSelectedLayer(current)
            }
            else if (canvasState.mode === CanvasMode.Pencil) {
                continueDrawing(current, e)
            }

            setMyPresence({ cursor: current })
        }

    }, [
        camera,
        canvasState,
        continueDrawing,
        updateSelectionNet,
        startMultiSelection,
        resizeSelectedLayer,
        translateSelectedLayers,
        isViewOnly
    ])

    const onPointersLeave = useMutation((
        { setMyPresence },
    ) => {

        setMyPresence({ cursor: null })

    }, [])

    const onPointersDown = useCallback((
        e: React.PointerEvent
    ) => {
        const point = pointerEventToCanvasPoint(e, camera)

        // If in view-only mode (mobile), only allow panning
        if (isViewOnly) {
            setCanvasState({
                origin: point,
                mode: CanvasMode.Pressing
            })
            return
        }

        if (canvasState.mode === CanvasMode.Pencil) {
            startDrawing(point, e.pressure)
            return
        }

        if (canvasState.mode === CanvasMode.Inserting) {
            return
        }

        setCanvasState({
            origin: point,
            mode: CanvasMode.Pressing
        })

    }, [
        camera,
        canvasState.mode,
        startDrawing,
        isViewOnly
    ])

    const onPointersUp = useMutation((
        { },
        e: React.PointerEvent
    ) => {

        const point = pointerEventToCanvasPoint(e, camera)

        // In view-only mode, just reset to None mode
        if (isViewOnly) {
            setCanvasState({ mode: CanvasMode.None })
            return
        }

        // Regular desktop behavior
        if (
            canvasState.mode === CanvasMode.None ||
            canvasState.mode === CanvasMode.Pressing
        ) {
            unselectLayers()
            setCanvasState({
                mode: CanvasMode.None
            })
        }
        else if (
            canvasState.mode === CanvasMode.Pencil
        ) {
            insertPath()
        }
        else if (
            canvasState.mode === CanvasMode.Inserting
        ) {
            insertLayer(canvasState.layerType, point)
        }
        else {
            setCanvasState({ mode: CanvasMode.None })
        }

        history.resume()

    }, [
        camera,
        canvasState,
        setCanvasState,
        history,
        insertPath,
        insertLayer,
        unselectLayers,
        isViewOnly
    ])

    const onLayerPointerDown = useMutation((
        { self, setMyPresence },
        e: React.PointerEvent,
        layerId: string
    ) => {

        // Prevent layer interaction in view-only mode
        if (isViewOnly) {
            return
        }

        if (
            canvasState.mode === CanvasMode.Pencil || canvasState.mode === CanvasMode.Inserting
        ) {
            return;
        }

        history.pause()
        e.stopPropagation()

        const point = pointerEventToCanvasPoint(e, camera)

        if (!self.presence.selection.includes(layerId)) {
            setMyPresence({ selection: [layerId] }, { addToHistory: true })
        }

        setCanvasState({ mode: CanvasMode.Translating, current: point })

    }, [isViewOnly])

    const onResizeHandlePointerDown = useCallback((
        corner: Side,
        initialBounds: XYWH
    ) => {

        // console.log({
        //     corner,
        //     initialBounds
        // })

        history.pause();

        setCanvasState({
            mode: CanvasMode.Resizing,
            initialBounds,
            corner
        })
    }, [history])

    // Used to track the presence of other users in the room.
    const selections = useOthersMapped((other) => other.presence.selection)

    const layerIdsToColorSelection = useMemo(() => {

        const layerIdsToColorSelection: Record<string, string> = {}

        for (const user of selections) {
            const [connectionId, selection] = user

            for (const layerId of selection) {
                layerIdsToColorSelection[layerId] = connectionIdToColor(connectionId)
            }
        }

        return layerIdsToColorSelection

    }, [selections])

    // Mobile detection and view-only mode setup
    useEffect(() => {
        const checkMobile = () => {
            const isMobileDevice = window.innerWidth < 1024 // lg breakpoint
            setIsMobile(isMobileDevice)
            setIsViewOnly(isMobileDevice)
        }
        
        checkMobile()
        window.addEventListener('resize', checkMobile)
        
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Clear loading state when canvas loads
    useEffect(() => {
        // Clear the loading state for this board when the canvas mounts
        removeLoadingState(boardId)
    }, [boardId, removeLoadingState])

    useEffect(() => {

        function onKeyDown(e: globalThis.KeyboardEvent) {
            switch (e.key) {

                //FIXME: While typing, backspace instead of removing alphabet removes the entire layer
                // case "Backspace":
                //     deleteLayers()
                //     break;

                case "z": {
                    if (e.ctrlKey || e.metaKey) {
                        if (e.shiftKey) {
                            history.redo()
                        } else {
                            history.undo()
                        }
                        break;
                    }
                }
            }
        }

        document.addEventListener("keydown", onKeyDown)

        return () => {
            document.removeEventListener("keydown", onKeyDown)
        }

    }, [
        deleteLayers,
        history
    ])

    return (
        <main className="h-full w-full relative bg-neutral-100 touch-none">
            <Info boardId={boardId} />
            <Participants />
            
            {/* Hide toolbar and selection tools in view-only mode */}
            {!isViewOnly && (
                <>
                    <Toolbar
                        canvasState={canvasState}
                        setCanvasState={setCanvasState}
                        canRedo={canRedo}
                        canUndo={canUndo}
                        undo={history.undo}
                        redo={history.redo}
                    />
                    <SelectionTools
                        camera={camera}
                        setLastUsedColor={setLastUsedColor}
                    />
                </>
            )}

            {/* Mobile zoom controls */}
            {isViewOnly && (
                <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-50">
                    <button
                        onClick={() => setZoom(prev => Math.min(5, prev * 1.2))}
                        className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg touch-manipulation active:scale-95 transition-transform"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setZoom(prev => Math.max(0.1, prev * 0.8))}
                        className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg touch-manipulation active:scale-95 transition-transform"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                    </button>
                    <button
                        onClick={() => {
                            setZoom(1)
                            setCamera({ x: 0, y: 0 })
                        }}
                        className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg touch-manipulation active:scale-95 transition-transform"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    </button>
                </div>
            )}

            {/* View-only indicator */}
            {isViewOnly && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-100 border border-blue-300 rounded-lg px-3 py-2 text-xs text-blue-800 z-50 max-w-xs text-center">
                    📱 View Only Mode - Drag to pan, use controls to zoom
                </div>
            )}

            <svg
                className={`h-[100vh] w-[100vw] ${isViewOnly ? 'cursor-grab active:cursor-grabbing' : ''}`}
                onWheel={onWheel}
                onPointerMove={onPointersMove}
                onPointerLeave={onPointersLeave}
                onPointerUp={onPointersUp}
                onPointerDown={onPointersDown}
            >
                <g
                    style={{
                        transform: `translate(${camera.x}px, ${camera.y}px) scale(${zoom})`
                    }}
                >
                    {layerIds?.map((layerId) => {
                        return (
                            <LayerPreview
                                key={layerId}
                                id={layerId}
                                onLayerPointerDown={onLayerPointerDown}
                                selectionColor={layerIdsToColorSelection[layerId]}
                                isViewOnly={isViewOnly}
                            />
                        )
                    })
                    }
                    
                    {/* Hide selection box and selection net in view-only mode */}
                    {!isViewOnly && (
                        <>
                            <SelectionBox
                                onResizeHandlePointerDown={onResizeHandlePointerDown}
                            />

                            {
                                canvasState.mode === CanvasMode.SelectionNet
                                && canvasState.current != null
                                && (
                                    <rect
                                        className="fill-blue-500/5 stroke-blue-500 stroke-1"
                                        x={Math.min(canvasState.origin.x, canvasState.current.x)}
                                        y={Math.min(canvasState.origin.y, canvasState.current.y)}
                                        width={Math.abs(canvasState.origin.x - canvasState.current.x)}
                                        height={Math.abs(canvasState.origin.y - canvasState.current.y)}
                                    />
                                )
                            }
                        </>
                    )}

                    <CursorsPresence />
                    {!isViewOnly && pencilDraft !== null && pencilDraft.length > 0 && (
                        <Path
                            points={pencilDraft}
                            fill={colorToCss(lastUsedColor)}
                            x={0}
                            y={0}
                        />
                    )}
                </g>
            </svg>
        </main>
    )
}