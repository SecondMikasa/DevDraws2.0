import { Kalam } from "next/font/google";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable"

import { NoteLayer } from "@/types/canvas";

import {
    cn,
    colorToCss,
    getContarstingTextColor
} from "@/lib/utils"

import { useMutation } from "@liveblocks/react/suspense";

const font = Kalam({
    subsets: ["latin"],
    weight: ["400"]
})

const calculateFontSize = (width: number, height: number) => {
    const maxFontSize = 96
    const scaleFactor = 0.15
    const fontSizeBasedOnHeight = height * scaleFactor
    const fontSizeBasedOnWidth = width * scaleFactor

    return Math.min(
        fontSizeBasedOnHeight,
        fontSizeBasedOnWidth,
        maxFontSize
    )
}

interface NoteProps {
    id: string;
    layer: NoteLayer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
    isViewOnly?: boolean;
}

export const Note = ({
    id,
    layer,
    onPointerDown,
    selectionColor,
    isViewOnly = false
}: NoteProps) => {

    const { x, y, width, height, fill, value } = layer

    const updateValue = useMutation((
        { storage },
        newValue: string
    ) => {
        const liveLayers = storage.get("layers")

        liveLayers.get(id)?.set("value", newValue)
    }, [])

    const handleContentChange = (e: ContentEditableEvent) => {
        updateValue(e.target.value)
    }

    const noOpChange = () => {
        // No-op function for view-only mode
    }

    return (
        <foreignObject
            x={x}
            y={y}
            width={width}
            height={height}
            onPointerDown={(e) => onPointerDown(e, id)}
            style={{
                outline: selectionColor ? `1px solid ${selectionColor}` : "none"
            }}
            className="shadow-md drop-shadow-xl"
        >
            <div
                className="w-full h-full flex items-center justify-center"
                style={{
                    backgroundColor: fill ? colorToCss(fill) : "#000"
                }}
            >
                <ContentEditable
                    html={value || "Text"}
                    onChange={isViewOnly ? noOpChange : handleContentChange}
                    disabled={isViewOnly}
                    className={cn(
                        "h-full w-full flex items-center justify-center text-center outline-none",
                        font.className,
                        isViewOnly && "pointer-events-none"
                    )}
                    style={{
                        fontSize: calculateFontSize(width, height),
                        color: fill ? getContarstingTextColor(fill) : "#000",
                    }}
                />
            </div>
        </foreignObject>

    )
}