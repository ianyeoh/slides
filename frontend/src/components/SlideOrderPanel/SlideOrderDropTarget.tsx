import { useDrop } from "react-dnd";
import { slideOrderDragType } from "./SlideOrderPanel";
import { ReactNode } from "react";
import { useStoreUpdate } from "@/lib/StoreContext";
import { useAuth } from "@/lib/AuthContext";

export function SlideOrderDropTarget({
    presentationIndex,
    newSlideIndex,
    children,
}: {
    presentationIndex: number;
    newSlideIndex: number;
    children?: ReactNode;
}) {
    const token = useAuth();
    const storeAction = useStoreUpdate();
    const [{ isOver, canDrop }, drop] = useDrop(
        () => ({
            accept: slideOrderDragType,
            drop: (item) => {
                try {
                    const slideIndex = (item as { slideIndex: number })
                        .slideIndex;

                    storeAction({
                        type: "reorderSlide",
                        presentationIndex,
                        slideIndex,
                        newSlideIndex,
                    });

                    storeAction({
                        type: "saveStore",
                        token,
                        callback: () => {
                            return;
                        },
                    });
                } catch {
                    throw new Error("Slide index not found in drag item.");
                }
            },
            canDrop: (item) => {
                try {
                    const slideIndex = (item as { slideIndex: number })
                        .slideIndex;

                    return !(
                        slideIndex === newSlideIndex ||
                        slideIndex + 1 === newSlideIndex
                    );
                } catch {
                    return false;
                }
            },
            collect: (monitor) => ({
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop(),
            }),
        }),
        [newSlideIndex]
    );

    return (
        <div ref={drop} className="w-full h-5 flex items-center">
            {children}

            {isOver && canDrop && (
                <div className="w-full h-[10%] bg-slate-400"></div>
            )}
        </div>
    );
}
