"use client"

import EmptyBoards from "./empty-boards";
import EmptyFavourite from "./empty-favourites";
import EmptySearch from "./empty-search";

import { BoardCard } from "./board-card";
import { NewBoardButton } from "./new-board-button";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface BoardListProps {
    orgId: string;
    query: {
        search?: string;
        favourites?: string;
    }
}

const BoardList = ({
    orgId,
    query
}: BoardListProps) => {

    // Pass the OrgId and Search Query Params to the Get query function
    const data = useQuery(api.boards.Get, {
        orgId,
        ...query
    })

    // Data can only be undefined when it is in the loading phase
    if (data === undefined) {
        return (
            <div>
                <h2
                    className="text-xl sm:text-2xl lg:text-3xl font-semibold"
                >
                    {query.favourites ? "Favourite Boards" : "Team Boards"}
                </h2>
                <div
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5 mt-4 sm:mt-6 lg:mt-8 pb-6 sm:pb-8 lg:pb-10"
                >
                    <NewBoardButton orgId={orgId} disabled />
                    <BoardCard.Skeleton />
                    <BoardCard.Skeleton />
                    <BoardCard.Skeleton />
                    <BoardCard.Skeleton />
                </div>
            </div>
        )
    }

    // User searched for something that does not exist
    if (!data || !data.length && query.search) {
        return (
            <EmptySearch />
        )
    }

    if (!data || !data.length && query.favourites) {
        return (
            <EmptyFavourite />
        )
    }

    if (!data || !data.length) {
        return (
            <EmptyBoards />
        )
    }

    return (
        <div>
            <h2
                className="text-xl sm:text-2xl lg:text-3xl font-semibold"
            >
                {query.favourites ? "Favourite Boards" : "Team Boards"}
            </h2>
            <div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5 mt-4 sm:mt-6 lg:mt-8 pb-6 sm:pb-8 lg:pb-10"
            >
                <NewBoardButton
                    orgId={orgId}
                />
                {/* {JSON.stringify(data)} */}
                {data.map((board) => (
                    <BoardCard
                        key={board._id}
                        id={board._id}
                        title={board.title}
                        imageUrl={board.imageUrl}
                        authorId={board.authorId}
                        authorName={board.authorName}
                        createAt={board._creationTime}
                        orgId={board.orgId}
                        isFavourite={board.isFavourite}
                    />
                ))}
            </div>

        </div>
    )
}

export default BoardList
