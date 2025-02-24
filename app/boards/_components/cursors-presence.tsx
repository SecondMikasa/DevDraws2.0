"use client"

// Skip re-rendering a component when props are unchanged.
import { memo } from "react"

import {
    shallow,
    useOthersConnectionIds,
    useOthersMapped
} from "@liveblocks/react/suspense";

import { Cursor } from "./subcomponents/cursor";
import { Path } from "./subcomponents/path";

import { colorToCss } from "@/lib/utils";

const Cursors = () => {
    const ids = useOthersConnectionIds()

    return (
        <>
            {ids.map((connectionId) => (
                <Cursor
                    key={connectionId}
                    connectionId={connectionId}
                />
            ))}
        </>
    )
}

export const Drafts = () => {
    const others = useOthersMapped((other) => ({
        pencilDraft: other.presence.pencilDraft,
        penColor: other.presence.penColor
    }), shallow)

    return (
        <>
            {others.map(([key, other]) => {
                if (other.pencilDraft) {
                    return (
                        <Path
                            key={key}
                            x={0}
                            y={0}
                            points={other.pencilDraft}
                            fill={other.penColor ? colorToCss(other.penColor) : "#000"}
                        />
                    )
                }

                return null
            })}
        </>
    )
}

export const CursorsPresence = memo(() => {
    return (
        <>
            <Drafts />
            <Cursors />
        </>
    )
})

CursorsPresence.displayName = "CursorsPresence"