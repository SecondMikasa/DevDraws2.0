import { useSelf, useMutation } from "@liveblocks/react/suspense"

export const useDeleteLayers = () => {
    const selection = useSelf((me) => me.presence.selection) || []

    return useMutation(({ storage, setMyPresence }) => {
        if (selection.length === 0) return

        const liveLayers = storage.get("layers")
        const liveLayerIds = storage.get("layerIds")

        // Delete selected layers
        selection.forEach((id) => liveLayers.delete(id))

        // Filter out deleted layer IDs
        const updatedLayerIds = liveLayerIds.filter((id) => !selection.includes(id))
        storage.set("layerIds", updatedLayerIds)

        // Clear selection and add to history
        setMyPresence({ selection: [] }, { addToHistory: true })
    }, [selection])
}