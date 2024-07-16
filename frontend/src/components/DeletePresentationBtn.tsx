import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { APIReturn } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { useStore, useStoreUpdate } from "@/lib/StoreContext";
import { getPresentation } from "@/lib/StoreHelpers";
import { useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function DeletePresentationButton({
    presentationIndex,
}: {
    presentationIndex: number;
}) {
    const navigate = useNavigate({ from: "/dashboard/p/$index" });
    const token = useAuth();
    const store = useStore();
    const storeAction = useStoreUpdate();

    if (!getPresentation(store, presentationIndex)) {
        throw new Error("Invalid presentation index");
    }

    function handleDelete() {
        storeAction({
            type: "deletePresentation",
            presentationIndex,
        });

        toast.promise(
            new Promise((resolve, reject) => {
                storeAction({
                    type: "saveStore",
                    token,
                    callback: (request) => {
                        if (request.success) {
                            resolve(request);
                            navigate({ to: "/dashboard" });
                        } else {
                            reject(request);
                        }
                    },
                });
            }),
            {
                loading: "Deleting...",
                success: () => {
                    return "Presentation deleted successfully";
                },
                error: (request: APIReturn) => {
                    if (request.success) return; // satisfy typescript

                    return `We failed to delete your presentation: ${request.error.message} - #${request.error.code}`;
                },
            }
        );
    }

    return (
        <AlertDialog>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <AlertDialogTrigger asChild>
                            <div className="p-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md hover:cursor-pointer" data-cy="deletePresentationBtn">
                                <Trash2 />
                            </div>
                        </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Delete presentation</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the presentation and all slide data.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>No</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} data-cy="deletePresentationConfirmBtn">
                        Yes
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
