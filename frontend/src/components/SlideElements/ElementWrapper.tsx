import TextElement from "./TextElement";
import ImageElement from "./ImageElement";
import VideoElement from "./VideoElement";
import CodeElement from "./CodeElement";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { getSlideElement } from "@/lib/StoreHelpers";
import { useStore, useStoreUpdate } from "@/lib/StoreContext";
import { EditTextModal } from "../SlideElementModals/EditTextModal";
import { EditImageModal } from "../SlideElementModals/EditImageModal";
import { EditVideoModal } from "../SlideElementModals/EditVideoModal";
import { EditCodeModal } from "../SlideElementModals/EditCodeModal";
import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";

const ElementWrapper = ({
    presentationIndex,
    slideIndex,
    slideElementIndex,
    isDisabled,
    isThumbnail,
}: {
    presentationIndex: number;
    slideIndex: number;
    slideElementIndex: number;
    isDisabled: boolean;
    isThumbnail: boolean;
}) => {
    const token = useAuth();
    const store = useStore();
    const storeAction = useStoreUpdate();
    const element = getSlideElement(
        store,
        presentationIndex,
        slideIndex,
        slideElementIndex
    );
    const [editing, setEditing] = useState<boolean>(false);

    if (!element) {
        return; // not throw, because we can delete ourselves lol
    }

    function handleEditElement() {
        setEditing(true);
    }

    function handleDeleteElement() {
        storeAction({
            type: "deleteSlideElement",
            presentationIndex,
            slideIndex,
            slideElementIndex,
        });

        storeAction({
            type: "saveStore",
            token,
            callback: () => {
                return;
            },
        });
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger disabled={isDisabled}>
                <div
                    className="w-full h-full"
                    onDoubleClick={!isDisabled ? handleEditElement : undefined}
                >
                    {
                        {
                            text: (
                                <TextElement
                                    element={element}
                                    presentationIndex={presentationIndex}
                                    slideIndex={slideIndex}
                                    slideElementIndex={slideElementIndex}
                                    isDisabled={isDisabled}
                                />
                            ),
                            image: (
                                <ImageElement
                                    element={element}
                                    presentationIndex={presentationIndex}
                                    slideIndex={slideIndex}
                                    slideElementIndex={slideElementIndex}
                                />
                            ),
                            video: (
                                <VideoElement
                                    element={element}
                                    presentationIndex={presentationIndex}
                                    slideIndex={slideIndex}
                                    slideElementIndex={slideElementIndex}
                                    isThumbnail={isThumbnail}
                                />
                            ),
                            code: (
                                <CodeElement
                                    element={element}
                                    presentationIndex={presentationIndex}
                                    slideIndex={slideIndex}
                                    slideElementIndex={slideElementIndex}
                                    isDisabled={isDisabled}
                                />
                            ),
                        }[element.type]
                    }

                    {
                        {
                            text: (
                                <EditTextModal
                                    presentationIndex={presentationIndex}
                                    slideIndex={slideIndex}
                                    slideElementIndex={slideElementIndex}
                                    open={editing}
                                    onOpenChange={setEditing}
                                />
                            ),
                            image: (
                                <EditImageModal
                                    presentationIndex={presentationIndex}
                                    slideIndex={slideIndex}
                                    slideElementIndex={slideElementIndex}
                                    open={editing}
                                    onOpenChange={setEditing}
                                />
                            ),
                            video: (
                                <EditVideoModal
                                    presentationIndex={presentationIndex}
                                    slideIndex={slideIndex}
                                    slideElementIndex={slideElementIndex}
                                    open={editing}
                                    onOpenChange={setEditing}
                                />
                            ),
                            code: (
                                <EditCodeModal
                                    presentationIndex={presentationIndex}
                                    slideIndex={slideIndex}
                                    slideElementIndex={slideElementIndex}
                                    open={editing}
                                    onOpenChange={setEditing}
                                />
                            ),
                        }[element.type]
                    }
                </div>
            </ContextMenuTrigger>

            <ContextMenuContent>
                <ContextMenuItem onClick={handleEditElement}>
                    Edit properties
                </ContextMenuItem>
                <ContextMenuItem onClick={handleDeleteElement}>
                    Delete
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
};

export default ElementWrapper;
