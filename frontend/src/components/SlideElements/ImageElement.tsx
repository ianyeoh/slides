import { SlideElementSchema } from "@/lib/StoreTypes";

const ImageElement = ({
    element,
}: {
    element: SlideElementSchema;
    presentationIndex: number;
    slideIndex: number;
    slideElementIndex: number;
}) => {
    if (element.type !== "image") {
        return (
            <>
                This shouldn't happen based on how component is rendered, its
                just to make typescript happy
            </>
        );
    }

    return (
        <div className="h-full w-full overflow-hidden">
            <img
                src={element.src}
                alt={element.alt}
                className=""
                onDragStart={(e) => e.preventDefault()}
            />
        </div>
    );
};

export default ImageElement;
