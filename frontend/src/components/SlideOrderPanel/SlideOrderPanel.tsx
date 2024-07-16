import { useStore } from "@/lib/StoreContext";
import { getPresentation } from "@/lib/StoreHelpers";
import { Slide } from "../Slide";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SlideOrderDraggable } from "./SlideOrderDraggable";
import { SlideOrderDropTarget } from "./SlideOrderDropTarget";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export const slideOrderDragType = "slideOrder";

export function SlideOrderPanel({
    presentationIndex,
    selectedSlide,
}: {
    presentationIndex: number;
    selectedSlide: number;
}) {
    const store = useStore();
    const presentation = getPresentation(store, presentationIndex);
    if (!presentation) {
        throw new Error("Invalid presentations.");
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <ScrollArea className="flex flex-col w-[75%] h-[87vh]">
                <SlideOrderDropTarget
                    presentationIndex={presentationIndex}
                    newSlideIndex={0}
                />
                {presentation.data.slides.map((_slide, index) => {
                    return (
                        <div key={index} className="relative">
                            <div className="flex gap-3 text-slate-500 pr-2">
                                <span className="w-[10%]">{index + 1}</span>
                                <SlideOrderDraggable
                                    slideIndex={index}
                                    presentationIndex={presentationIndex}
                                >
                                    <div
                                        className={cn(
                                            "h-full w-full rounded-sm",
                                            selectedSlide === index
                                                ? "ring-offset-2 ring-2 ring-slate-500"
                                                : ""
                                        )}
                                    >
                                        <Slide
                                            isDisabled={true}
                                            slideNumbers={false}
                                            presentationIndex={
                                                presentationIndex
                                            }
                                            slideIndex={index}
                                            isThumbnail={true}
                                        />
                                    </div>
                                </SlideOrderDraggable>
                            </div>
                            <SlideOrderDropTarget
                                presentationIndex={presentationIndex}
                                newSlideIndex={index + 1}
                            />
                        </div>
                    );
                })}
            </ScrollArea>
        </DndProvider>
    );
}
