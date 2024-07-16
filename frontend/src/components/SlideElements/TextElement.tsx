import { useAuth } from "@/lib/AuthContext";
import { useStoreUpdate } from "@/lib/StoreContext";
import { SlideElementSchema } from "@/lib/StoreTypes";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const TextElement = ({
    element,
    presentationIndex,
    slideIndex,
    slideElementIndex: elementIndex,
    isDisabled,
}: {
    element: SlideElementSchema;
    presentationIndex: number;
    slideIndex: number;
    slideElementIndex: number;
    isDisabled: boolean;
}) => {
    const token = useAuth();
    const storeAction = useStoreUpdate();
    const [text, setText] = useState<string>(
        element.type === "text" ? element.text : ""
    );

    useEffect(() => {
        if (element.type === "text") setText(element.text);
    }, [element]);

    if (element.type !== "text") {
        return (
            <>
                This shouldn't happen based on how component is rendered, its
                just to make typescript happy
            </>
        );
    }

    const handleBlur = () => {
        storeAction({
            type: "updateSlideElement",
            presentationIndex,
            slideIndex,
            elementIndex,
            element: { ...element, text },
        });

        storeAction({
            type: "saveStore",
            token,
            callback: (request) => {
                if (!request.success) {
                    toast.error("We failed to update your element", {
                        description: `${request.error.message} - #${request.error.code}`,
                    });
                }
            },
        });
    };

    return (
        <div
            className={cn("flex h-full w-full overflow-hidden", {
                "border-dashed border border-slate-300": !isDisabled,
            })}
            data-cy="textelement"
        >
            {isDisabled ? (
                <span
                    className="select-none"
                    style={{
                        fontSize: `${element.fontSize}em`,
                        color: element.textColour,
                        fontFamily: element.fontFamily,
                    }}
                >
                    {text}
                </span>
            ) : (
                <textarea
                    style={{
                        fontSize: `${element.fontSize}em`,
                        color: element.textColour,
                        fontFamily: element.fontFamily,
                    }}
                    className="disable-drag w-full m-1 bg-transparent resize-none leading-normal overflow-hidden focus-visible:outline-none"
                    onChange={(e) => {
                        setText(e.target.value);
                    }}
                    onBlur={handleBlur}
                    value={text}
                    placeholder="Enter text"
                />

            )}
        </div>
    );
};

export default TextElement;
