"use client"

import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import { useApiMutation } from "@/hooks/use-api-mutations";

interface NewBoardButtonProps {
    orgId: string;
    disabled?: boolean
}

export const NewBoardButton = ({
    orgId,
    disabled
}: NewBoardButtonProps) => {

    const router = useRouter()

    const {mutate, pending} = useApiMutation(api.board.Create)

    const onClick = () => {
        mutate({
            orgId,
            title: "Untitled"
        })
            .then((id) => {
                toast.success(`Board Created Successfully`)
                // TODO: Redirect to "/boards/{id}"
                router.push(`/boards/${id}`)
            })
            .catch(() => 
                toast.error("Failed to create board")
            )
            
    }

    return (
        <>
            <button
                disabled={ pending || disabled}
                onClick={onClick}
                className={cn(
                    "col-span-1 aspect-[100/127] bg-blue-600 rounded-lg hover:bg-blue-800 active:scale-95 sm:active:scale-100 flex flex-col items-center justify-center py-4 sm:py-6 touch-manipulation transition-all duration-200",
                    (pending || disabled) && "opacity-75"
                )}
            >
                {/* Added div just to add some space */}
                <div />
                <Plus
                    className="h-10 w-10 sm:h-12 sm:w-12 text-white stroke-1"
                />
                <p
                    className="text-xs sm:text-sm text-white font-light mt-2"
                >
                    New Board
                </p>
            </button>
        </>
    )
}