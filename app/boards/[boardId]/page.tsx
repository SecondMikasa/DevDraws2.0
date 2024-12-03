import { Canvas } from "../_components/canvas"
import { Room } from "@/components/room";
import { Loading } from "../_components/subcomponents/canvas-loading";

interface BoardIdPageProps {
    params: {
        boardId: string;
    }
}

const BoardIdPage = ({
    params
}: BoardIdPageProps) => {
    return (
        <Room
            roomId={params.boardId}
            fallback={
                <div>
                    <Loading />
                </div>
            }
        >
            <Canvas boardId={params.boardId} />
        </Room>
    )
}

export default BoardIdPage