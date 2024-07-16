import { useAuth } from "@/lib/AuthContext";
import { useStore, useStoreUpdate } from "@/lib/StoreContext";
import { CircleX } from "lucide-react";
import { MouseEvent } from "react";
import { toast } from "sonner";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { getSlide } from "@/lib/StoreHelpers";

export default function DeleteSlideBtn({
    presentationIndex,
    slideIndex,
    onSlideDelete,
}: {
    presentationIndex: number;
    slideIndex: number;
    onSlideDelete: (newSlide: number) => void;
}) {
    const store = useStore();
    const token = useAuth();
    const storeAction = useStoreUpdate();

    if (!getSlide(store, presentationIndex, slideIndex)) {
        return;
    }

    const handleClick = (e: MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();

        const newSlide = slideIndex === 0 ? 0 : slideIndex - 1;
        onSlideDelete(newSlide);

        if (store.presentations[presentationIndex].data.slides.length === 1) {
            toast.error("Cannot delete last slide");
            return;
        }

        storeAction({
            type: "deleteSlide",
            presentationIndex,
            slideIndex,
        });

        storeAction({
            type: "saveStore",
            token,
            callback: (request) => {
                if (request.success) {
                    toast.success(`Slide deleted`);
                } else {
                    toast.error("We failed to delete a slide", {
                        description: `${request.error.message} - #${request.error.code}`,
                    });
                }
            },
        });
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger
                    className="flex justify-center mt-5"
                    onClick={handleClick}
                    data-cy="button"
                >
                    <CircleX color="#d60000" className="w-10 h-10" />
                </TooltipTrigger>
                <TooltipContent>
                    <p>Delete slide</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
