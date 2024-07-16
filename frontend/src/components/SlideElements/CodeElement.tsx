import { SlideElementSchema } from "@/lib/StoreTypes";
import { useEffect, useState } from "react";
import detectLang from "lang-detector";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { useStoreUpdate } from "@/lib/StoreContext";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";

const CodeElement = ({
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

    const [code, setCode] = useState<string>(
        element.type === "code" ? element.code : ""
    );
    const [language, setLanguage] = useState(
        (
            detectLang(element.type === "code" ? element.code : "") as string
        ).toLowerCase()
    );

    useEffect(() => {
        if (element.type === "code") setCode(element.code);
    }, [element]);

    if (element.type !== "code") {
        return (
            <>
                This shouldn't happen based on how component is rendered, its
                just to make typescript happy
            </>
        );
    }

    const handleBlur = () => {
        let l = (detectLang(code) as string).toLowerCase();
        if (l === "unknown") {
            l = "javascript";
        }
        setLanguage(l);

        storeAction({
            type: "updateSlideElement",
            presentationIndex,
            slideIndex,
            elementIndex,
            element: { ...element, code },
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
        <div className="h-full w-full p-1" data-cy="codeelement">
            <CodeEditor
                disabled={isDisabled}
                value={code}
                language={language}
                placeholder="Please enter code."
                onChange={(evn) => setCode(evn.target.value)}
                onBlur={handleBlur}
                padding={15}
                className="disable-drag h-full w-full bg-[#f5f5f5] leading-relaxed"
                style={{
                    fontFamily:
                        "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
                    fontSize: `${element.fontSize}em`,
                }}
            />
        </div>
    );
};

export default CodeElement;
