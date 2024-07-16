import { useStore } from "@/lib/StoreContext";
import { SlideElement } from "./SlideElements/SlideElement";
import { useMeasure } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";
import { getPresentation, getSlide } from "@/lib/StoreHelpers";

export function Slide({
    slideIndex,
    presentationIndex,
    isDisabled,
    slideNumbers = true,
    isThumbnail = false,
}: {
    slideIndex: number;
    presentationIndex: number;
    isDisabled: boolean;
    slideNumbers?: boolean;
    isThumbnail?: boolean;
}) {
    const store = useStore();

    // Stores the currently selected element on the slide
    const [selectedElement, setSelectedElement] = useState<number | null>(null);

    // Stores the dimensions of the slide in pixels (width + height)
    const [rect, setRect] = useState<{ width: number; height: number } | null>(
        null
    );

    // Measure the dimensions of the slide
    const [ref, { width, height }] = useMeasure();
    // When the above variables update, update our state too
    useEffect(() => {
        if (width && height) {
            setRect({ width, height });
        }
    }, [width, height]);
    
    // Do some checks
    const presentation = getPresentation(store, presentationIndex);
    if (!presentation) {
        throw new Error("Invalid presentations.");
    }

    const slide = getSlide(store, presentationIndex, slideIndex);
    if (!slide) {
        return;
        // throw new Error("Invalid slide.");
    }

    let color, isGradient;

    if (!slide.theme.color) {
        ({ color, isGradient } = presentation.data.theme);
    } else {
        ({ color, isGradient } = slide.theme);
    }

    // When a SlideElement is clicked, this should deselect the previously selected element.
    // This is detected by passing this function down to all SlideElements, which is called
    // whenever one of the SlideElements is selected.
    function onSlideElementSelect(slideElementIndex: number) {
        setSelectedElement(slideElementIndex);
    }

    function onSlideElementDeselect() {
        setSelectedElement(null);
    }

    return (
        <div
            ref={ref}
            style={{
                fontSize: `${width ? width / 40 : 10}px`,
                backgroundImage: isGradient ? color : "none",
                backgroundColor: !isGradient ? color : "none",
            }}
            className="aspect-[16/9] w-full bg-white drop-shadow-lg relative"
        >
            {rect &&
                slide.elements.map((element, elementIndex) => {
                    return (
                        <SlideElement
                            key={`${presentationIndex} ${elementIndex}`}
                            presentationIndex={presentationIndex}
                            slideIndex={slideIndex}
                            slideElementIndex={elementIndex}
                            type={element.type}
                            slideWidth={rect.width}
                            slideHeight={rect.height}
                            selectedElement={selectedElement}
                            onSlideElementSelect={onSlideElementSelect}
                            onSlideElementDeselect={onSlideElementDeselect}
                            isDisabled={isDisabled}
                            isThumbnail={isThumbnail}
                        />
                    );
                })}

            {slideNumbers && (
                <span
                    className="absolute bottom-2 left-2 text-sm select-none text-slate-500 text-[1em]"
                    data-cy="currentSlideNumber"
                >
                    {slideIndex + 1}
                </span>
            )}
        </div>
    );
}
