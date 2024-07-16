import { useAuth } from "@/lib/AuthContext";
import { useStore, useStoreUpdate } from "@/lib/StoreContext";
import { getSlideElement } from "@/lib/StoreHelpers";
import { SlideElementPos } from "@/lib/StoreTypes";
import { useCallback, useEffect, useState } from "react";
import { Rnd } from "react-rnd";
import { useDetectClickOutside } from "react-detect-click-outside";
import ElementWrapper from "./ElementWrapper";
import { cn } from "@/lib/utils";

const resizeCornerHandle = (
    <div className="flex w-full h-full justify-center content-center items-center">
        <div className="outline outline-1 w-[5px] h-[5px]"></div>
    </div>
);

type ElementState = {
    x: number;
    y: number;
    width: number;
    height: number;
};
export function SlideElement({
    presentationIndex,
    slideIndex,
    slideElementIndex,
    slideWidth,
    slideHeight,
    selectedElement,
    onSlideElementSelect,
    onSlideElementDeselect,
    isDisabled,
    isThumbnail,
}: {
    presentationIndex: number;
    slideIndex: number;
    slideElementIndex: number;
    type: "text" | "image" | "video" | "code";
    slideWidth: number;
    slideHeight: number;
    selectedElement: number | null;
    onSlideElementSelect: (slideElementIndex: number) => void;
    onSlideElementDeselect: () => void;
    isDisabled: boolean;
    isThumbnail: boolean;
}) {
    const token = useAuth();
    const store = useStore();
    const storeAction = useStoreUpdate();

    // Selected is if the slideElementIndex (us), is equal to the currently selectedElement
    const selected = selectedElement === slideElementIndex;
    // This hook gives us a ref to pass to a HTML element. The HTML element will fire the
    // onTriggered function if a click is detected OUTSIDE the component. Note that we
    // only pass this ref to the SlideElement IF we are the currently selected element
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const ref = useDetectClickOutside({
        onTriggered: () => {
            // this is some hacky stuff, but it's possible for a click event to fire
            // outside of the SlideElement on drag end, which de-selects the element (undesirable behaviour)
            // so we only fire a deselect if we are NOT dragging, and on drag/resize End, we set a 200ms
            // timeout before setting isDragging to false.
            if (!isDragging) {
                onSlideElementDeselect();
            }
        },
    });

    // this is the positional data of the slide element in terms of PROPORTION of the slide
    // this does not affect the position of the slide element, unless the parent slide width/height changes
    const [rect, setRect] = useState<ElementState | null>(null);

    // this is the positional data of the slide element in terms of PIXELS,
    // where x: 0, y: 0 is the top left corner of the slide
    // this state variable is directly tied to the position of the slide element.
    const [state, setState] = useState<ElementState | null>(null);

    // calculate the new slide element position in state (PIXELS), by using the PROPORTION (rect)
    // multiplied by the slideWidth and slideHeight.
    const calculateElementState = useCallback(
        (slideWidth: number, slideHeight: number) => {
            if (rect) {
                const { x, y, width, height } = rect;

                setState({
                    x: Math.floor(x * slideWidth),
                    y: Math.floor(y * slideHeight),
                    width: Math.floor(width * slideWidth),
                    height: Math.floor(height * slideHeight),
                });
            }
        },
        [rect]
    );

    // this updates the slide element position when slideWidth and slideHeight changes.
    // note that rect is not in the dependency array!
    useEffect(() => {
        calculateElementState(slideWidth, slideHeight);
    }, [calculateElementState, slideWidth, slideHeight]);

    // Set the inital position based on the slideIndex
    useEffect(() => {
        const element = getSlideElement(
            store,
            presentationIndex,
            slideIndex,
            slideElementIndex
        );

        if (!element) {
            throw new Error("Invalid slide element.");
        }

        const { x, y, width, height } = element.pos;

        // set initial state
        setRect({
            x,
            y,
            width,
            height,
        });
        setState({
            x: Math.floor(x * slideWidth),
            y: Math.floor(y * slideHeight),
            width: Math.floor(width * slideWidth),
            height: Math.floor(height * slideHeight),
        });
    }, [
        store,
        presentationIndex,
        slideIndex,
        slideElementIndex,
        slideHeight,
        slideWidth,
    ]);

    // save the given pos to the store (does not save the store)
    function savePosToStore(pos: SlideElementPos) {
        storeAction({
            type: "updateSlideElemPos",
            presentationIndex,
            slideIndex,
            slideElementIndex,
            newPos: pos,
        });
    }

    return (
        <>
            {state && rect && (
                <Rnd
                    style={{ zIndex: slideElementIndex }}
                    disableDragging={!selected || isDisabled}
                    enableResizing={
                        !isDisabled &&
                        selected && {
                            top: false,
                            bottom: false,
                            left: false,
                            right: false,
                            topLeft: true,
                            topRight: true,
                            bottomLeft: true,
                            bottomRight: true,
                        }
                    }
                    size={{ width: state.width, height: state.height }}
                    position={{ x: state.x, y: state.y }}
                    bounds="parent"
                    className={cn("", {
                        "outline-dotted outline-1": selected && !isDisabled,
                    })}
                    cancel=".disable-drag"
                    resizeHandleComponent={{
                        topRight: resizeCornerHandle,
                        bottomRight: resizeCornerHandle,
                        bottomLeft: resizeCornerHandle,
                        topLeft: resizeCornerHandle,
                    }}
                    onDragStart={() => {
                        setIsDragging(true);
                    }}
                    // not sure why, but underscoring position doesn't remove the warning
                    // from my linter. -ian
                    onDragStop={(_e, d) => {
                        setTimeout(() => {
                            setIsDragging(false);
                        }, 100);

                        setState({
                            ...state,
                            x: d.x,
                            y: d.y,
                        });

                        const newPos = {
                            ...rect,
                            x: d.x / slideWidth,
                            y: d.y / slideHeight,
                        };
                        setRect(newPos);
                        savePosToStore(newPos);
                        storeAction({
                            type: "saveStore",
                            token,
                            callback: () => {
                                return;
                            },
                        });
                    }}
                    onResizeStart={() => {
                        setIsDragging(true);
                    }}
                    onResize={(_e, _direction, ref, _delta, position) => {
                        setState({
                            width: ref.offsetWidth,
                            height: ref.offsetHeight,
                            ...position,
                        });
                        setRect({
                            width: ref.offsetWidth / slideWidth,
                            height: ref.offsetHeight / slideHeight,
                            x: position.x / slideWidth,
                            y: position.y / slideHeight,
                        });
                    }}
                    onResizeStop={(_e, _direction, ref, _delta, position) => {
                        setTimeout(() => {
                            setIsDragging(false);
                        }, 100);

                        savePosToStore({
                            width: ref.offsetWidth / slideWidth,
                            height: ref.offsetHeight / slideHeight,
                            x: position.x / slideWidth,
                            y: position.y / slideHeight,
                        });
                        storeAction({
                            type: "saveStore",
                            token,
                            callback: () => {
                                return;
                            },
                        });
                    }}
                >
                    <div
                        className={cn("h-full w-full", {
                            "cursor-pointer": !selected && !isDisabled,
                        })}
                        onClick={() => {
                            // When the slide element is clicked, it becomes selected.
                            onSlideElementSelect(slideElementIndex);
                        }}
                        ref={selected ? ref : null}
                    >
                        <ElementWrapper
                            slideElementIndex={slideElementIndex}
                            presentationIndex={presentationIndex}
                            slideIndex={slideIndex}
                            isDisabled={isDisabled}
                            isThumbnail={isThumbnail}
                        />
                    </div>
                </Rnd>
            )}
        </>
    );
}
