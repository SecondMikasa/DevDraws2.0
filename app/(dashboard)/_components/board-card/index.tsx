"use client"
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { formatDistanceToNow } from "date-fns"
import { MoreHorizontal } from "lucide-react";

import { Overlay } from "./overlay";
import { Footer } from "./footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Actions } from "@/components/actions";
import { BoardCardLoadingOverlay } from "@/components/ui/loading-overlay";

import { useApiMutation } from "@/hooks/use-api-mutations";
import { api } from "@/convex/_generated/api";
import { useBoardLoading } from "@/providers/board-loading-provider";

import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
// import { useMutation } from "convex/react";
// import { Id } from "@/convex/_generated/dataModel";

interface BoardCardProps {
    id: string;
    title: string;
    authorName: string;
    authorId: string;
    createAt: number;
    imageUrl: string;
    orgId: string;
    isFavourite: boolean;
    side?: 'left' | 'right';
}

export const BoardCard = ({
    id,
    title,
    authorName,
    authorId,
    createAt,
    imageUrl,
    orgId,
    isFavourite,
}: BoardCardProps) => {
    const router = useRouter();
    const userId = useAuth();
    const { isLoading, setLoadingBoard, addLoadingState, removeLoadingState } = useBoardLoading();
    const timeoutRef = useRef<NodeJS.Timeout>();

    const authorLabel = userId.userId === authorId ? "You" : authorName
    const createAtLabel = formatDistanceToNow(createAt, {
        addSuffix: true
    })

    // Check if this specific board is loading
    const isBoardLoading = isLoading(id);

    // Cleanup timeout on unmount or when loading state changes
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Clear timeout when loading state is cleared externally
    useEffect(() => {
        if (!isBoardLoading && timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = undefined;
        }
    }, [isBoardLoading]);

    // Using convex to manage favourites directly will loose the loading state property feature
    // const handleFavourite = useMutation(api.board.Favourite)
    // const handleUnfavourite = useMutation(api.board.Unfavourite)

    const {
        mutate: onFavourite,
        pending: pendingFavourite
    } = useApiMutation(api.board.Favourite)

    const {
        mutate: onUnfavourite ,
        pending: pendingUnfavourite
    } = useApiMutation(api.board.Unfavourite)

    const toggleFavourite = () => {
        if (isFavourite) {
            // handleUnfavourite({ id: id as Id<"boards"> })
            onUnfavourite({ id })
                .catch(() => toast.error("Failed to unfavourite"))
        } else {
            // handleFavourite({ id: id as Id<"boards">, orgId })
            onFavourite({ id, orgId })
                .catch(() => toast.error("Failed to favourite"))
        }
    }

    const handleBoardClick = (e: React.MouseEvent) => {
        // Prevent navigation if already loading
        if (isBoardLoading) {
            e.preventDefault();
            return;
        }

        // Set immediate loading state
        setLoadingBoard(id);
        addLoadingState(id, 'navigation');
        
        // Set timeout to clear loading state if navigation takes too long (10 seconds)
        timeoutRef.current = setTimeout(() => {
            removeLoadingState(id);
        }, 10000);
        
        // Navigate to board
        router.push(`/boards/${id}`);
    };

    return (
        <div className="relative">
            <div
                onClick={handleBoardClick}
                className={`group aspect-[100/127] border rounded-lg flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-200 touch-manipulation ${
                    isBoardLoading ? 'opacity-75 pointer-events-none' : 'hover:shadow-md active:scale-95 sm:active:scale-100'
                }`}
            >
                <div
                    className="relative flex-1 bg-amber-100"
                >
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-fit"
                    />
                    <Overlay />
                    <Actions
                        id={id}
                        title={title}
                        side="right"
                    >
                        <button
                            className="absolute top-1 right-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 px-2 py-2 sm:px-3 sm:py-2 outline-none touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()} // Prevent triggering board navigation
                        >
                            <MoreHorizontal
                                className="text-white opacity-90 hover:opacity-100 transition-opacity h-5 w-5 sm:h-4 sm:w-4"
                            />
                        </button>
                    </Actions>
                </div>
                <Footer
                    isFavourite={isFavourite}
                    title={title}
                    authorLabel={authorLabel}
                    createAtLabel={createAtLabel}
                    onClick={toggleFavourite}
                    disabled={pendingFavourite || pendingUnfavourite}
                />
            </div>
            
            {/* Loading overlay */}
            <BoardCardLoadingOverlay 
                isVisible={isBoardLoading}
                className="rounded-lg"
            />
        </div>
    )
}

BoardCard.Skeleton = function BoardCardSkeleton() {
    return (
        <div
            className="aspect-[100/127] border rounded-lg overflow-hidden"
        >
            <Skeleton
                className="h-full w-full"
            />
        </div>
    )
}
