import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { useDrag } from "react-dnd";
import { slideOrderDragType } from "./SlideOrderPanel";
import { useNavigate } from "@tanstack/react-router";

export function SlideOrderDraggable({
    slideIndex,
    children,
    presentationIndex,
}: {
    slideIndex: number;
    children?: ReactNode;
    presentationIndex: number;
}) {
    const navigate = useNavigate();
    const [{ isDragging }, drag] = useDrag(() => ({
        type: slideOrderDragType,
        item: { slideIndex },
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }));
    return (
        <div
            ref={drag}
            className={cn(
                "w-[90%] h-full hover:drop-shadow-lg transition duration-200",
                isDragging ? "opacity-50" : "opacity-100"
            )}
            onClick={() => {
                navigate({
                    to: "/dashboard/presentation/$pIndex/slide/$sIndex",
                    params: {
                        pIndex: presentationIndex.toString(),
                        sIndex: slideIndex.toString(),
                    },
                });
            }}
        >
            {children}
        </div>
    );
}
