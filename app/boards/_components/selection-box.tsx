"use client"

import { memo } from "react"

import { useSelf } from "@liveblocks/react/suspense"
import { useStorage } from "@liveblocks/react"

import { LayerType, Side, XYWH } from "@/types/canvas"

import { useSelectionBounds } from "@/hooks/use-selection-bounds"

interface SelectionBoxProps {
    onResizeHandlePointerDown: (side: Side, initialBounds: XYWH) => void
}

const HANDLE_WIDTH = 8

export const SelectionBox = memo(({ onResizeHandlePointerDown }: SelectionBoxProps) => {
    const soleLayerId = useSelf((me) =>
        me.presence.selection.length === 1 ? me.presence.selection[0] : null
    )

    const isShowingHandles = useStorage(
        (root) => soleLayerId && root.layers.get(soleLayerId)?.type !== LayerType.Path
    )

    const bounds = useSelectionBounds()

    if (!bounds) return null

    // All Resize Handles (Corners + Edges)
    const handles = [
        { side: Side.Top, x: bounds.x + bounds.width / 2, y: bounds.y, cursor: "ns-resize" },
        { side: Side.Bottom, x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height, cursor: "ns-resize" },
        { side: Side.Left, x: bounds.x, y: bounds.y + bounds.height / 2, cursor: "ew-resize" },
        { side: Side.Right, x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2, cursor: "ew-resize" },

        // Corners (Bitwise Combination of Two Sides)
        { side: Side.Top | Side.Left, x: bounds.x, y: bounds.y, cursor: "nwse-resize" },
        { side: Side.Top | Side.Right, x: bounds.x + bounds.width, y: bounds.y, cursor: "nesw-resize" },
        { side: Side.Bottom | Side.Left, x: bounds.x, y: bounds.y + bounds.height, cursor: "nesw-resize" },
        { side: Side.Bottom | Side.Right, x: bounds.x + bounds.width, y: bounds.y + bounds.height, cursor: "nwse-resize" },
    ] as const

    return (
        <>
            {/* Selection Box */}
            <rect
                className="fill-transparent stroke-blue-500 stroke-1 pointer-events-none"
                x={bounds.x}
                y={bounds.y}
                width={bounds.width}
                height={bounds.height}
            />

            {/* Resize Handles */}
            {isShowingHandles &&
                handles.map(({ side, x, y, cursor }) => (
                    <rect
                        key={side}
                        className="fill-white stroke-1 stroke-blue-500"
                        width={HANDLE_WIDTH}
                        height={HANDLE_WIDTH}
                        style={{
                            cursor,
                            transform: `translate(${x - HANDLE_WIDTH / 2}px, ${y - HANDLE_WIDTH / 2}px)`,
                        }}
                        onPointerDown={(e) => {
                            e.stopPropagation()
                            onResizeHandlePointerDown(side, bounds)
                        }}
                    />
                ))}
        </>
    )
})
