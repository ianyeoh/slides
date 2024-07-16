import { useAuth } from "@/lib/AuthContext";
import { useStoreUpdate } from "@/lib/StoreContext";
import { CirclePlus } from "lucide-react";
import { MouseEvent } from "react";
import { toast } from "sonner";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CreateSlideBtn({
    presentationIndex,
}: {
    presentationIndex: number;
}) {
    const token = useAuth();
    const storeAction = useStoreUpdate();

    // Does this need to be async?
    const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        storeAction({
            type: "createSlide",
            presentationIndex,
        });

        storeAction({
            type: "saveStore",
            token,
            callback: (request) => {
                if (!request.success) {
                    toast.error("We failed to create a slide", {
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
                    className="flex justify-center"
                    onClick={handleClick}
                    data-cy="createSlideBtn"
                >
                    <CirclePlus className="w-10 h-10" />
                </TooltipTrigger>
                <TooltipContent>
                    <p>Create new slide</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
