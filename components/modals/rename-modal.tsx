"use client"

import { FormEventHandler, useEffect, useState } from "react"
import { useRenameModal } from "@/store/use-rename-modal"

import { useApiMutation } from "@/hooks/use-api-mutations"
import { api } from "@/convex/_generated/api"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogClose,
    DialogFooter,
    DialogTitle
} from "@/components/ui/dialog"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { toast } from "sonner"

export const RenameModal = () => {

    const { mutate, pending } = useApiMutation(api.board.Update)

    const {
        isOpen,
        onClose,
        initialValues
    } = useRenameModal()

    const [title, setTitle] = useState(initialValues.title)

    useEffect(() => {
        setTitle(initialValues.title)
    }, [initialValues.title])

    const onSubmit: FormEventHandler<HTMLFormElement> = (
        e,
    ) => {
        e.preventDefault()

        mutate({
            id: initialValues.id,
            title: title
        }).then(() => {
            onClose()
            toast.success("Board renamed successfully")
        }).catch(() => {
            toast.error("Board renaming failed")
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Edit Board Title
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    Enter a new title for the board
                </DialogDescription>
                <form onSubmit={onSubmit} className="space-y-6 sm:space-y-4">
                    <Input
                        disabled={pending}
                        required
                        maxLength={60}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Board Title"
                        autoFocus
                    />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" size="default">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button disabled={pending} type="submit" size="default">
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}