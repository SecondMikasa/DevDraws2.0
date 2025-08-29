"use client"

import { memo } from "react";

import { LayerType } from "@/types/canvas";

import { useStorage } from "@liveblocks/react";

import { Rectangle } from "./subcomponents/rectangle";
import { Ellipse } from "./subcomponents/ellipse";
import { Text } from "./subcomponents/text";
import { Note } from "./subcomponents/note";
import { Path } from "./subcomponents/path";
import { colorToCss } from "@/lib/utils";

interface LayerPreviewProps {
    id: string;
    onLayerPointerDown: (e: React.PointerEvent, layerId: string) => void;
    selectionColor?: string;
    isViewOnly?: boolean;
}

export const LayerPreview = memo(({
    id,
    onLayerPointerDown,
    selectionColor,
    isViewOnly = false
}: LayerPreviewProps) => {

    const layer = useStorage((root) => root.layers.get(id))

    // console.log({
    //     layer
    // }, "LAYER_PREVIEW")

    if (!layer) {
        return null
    }

    switch (layer.type) {
        case LayerType.Rectangle:
            return (
                <Rectangle
                    id={id}
                    layer={layer}
                    onPointerDown={onLayerPointerDown}
                    selectionColor={selectionColor}
                />
            );

        case LayerType.Ellipse:
            return (
                <Ellipse
                    id={id}
                    layer={layer}
                    onPointerDown={onLayerPointerDown}
                    selectionColor={selectionColor}
                />
            );

        case LayerType.Text:
            return (
                <Text
                    id={id}
                    layer={layer}
                    onPointerDown={onLayerPointerDown}
                    selectionColor={selectionColor}
                    isViewOnly={isViewOnly}
                />
            )

        case LayerType.Note:
            return (
                <Note
                    id={id}
                    layer={layer}
                    onPointerDown={onLayerPointerDown}
                    selectionColor={selectionColor}
                    isViewOnly={isViewOnly}
                />
            )

        case LayerType.Path: 
            return (
                <Path
                    key={id}
                    points={layer.points}
                    x={layer.x}
                    y={layer.y}
                    fill={layer.fill ? colorToCss(layer.fill) : "#000"}
                    onPointerDown={(e) => onLayerPointerDown(e, id)}
                    stroke={selectionColor}
                />
            )

        default:
            console.warn("Unknown Layer Type")
    }
})

LayerPreview.displayName = "LayerPreview"