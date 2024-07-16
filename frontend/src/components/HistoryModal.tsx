import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { MenubarItem } from "@/components/ui/menubar";
import { useAuth } from "@/lib/AuthContext";
import { useStore, useStoreUpdate } from "@/lib/StoreContext";
import { FolderClock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getPresentation } from "@/lib/StoreHelpers";
import TimeAgo from "react-timeago";

export const HistoryModal = ({
    presentationIndex,
    navigateToSlide0,
}: {
    presentationIndex: number;
    navigateToSlide0: () => void;
}) => {
    const [open, setOpen] = useState(false);
    const token = useAuth();
    const store = useStore();
    const storeAction = useStoreUpdate();

    const presentation = getPresentation(store, presentationIndex);
    if (!presentation) {
        throw new Error("Invalid presentation");
    }

    const restoreVersion = (versionIndex: number) => {
        navigateToSlide0();

        // hack lol, need to let the navigation happen first then delete from store,
        // otherwise the store update triggers a re-render before the navigation has happened?
        setTimeout(() => {
            storeAction({
                type: "restoreVersion",
                presentationIndex,
                versionIndex,
            });

            storeAction({
                type: "saveStore",
                token,
                callback: (request) => {
                    if (!request.success) {
                        toast.error("We failed to restore your version", {
                            description: `${request.error.message} - #${request.error.code}`,
                        });
                    }
                },
            });
        }, 5);

        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <MenubarItem
                    className="gap-2"
                    onSelect={(e) => e.preventDefault()}
                    data-cy="dialogTrigger"
                >
                    <FolderClock width={15} />
                    Revision history
                </MenubarItem>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Version history</DialogTitle>
                    <Table className="mt-5">
                        {store.presentations[presentationIndex].versions
                            .length === 0 ? (
                            <TableCaption data-cy="tableCaption">
                                No version history recorded yet.
                            </TableCaption>
                        ) : (
                            <TableCaption data-cy="tableCaption">
                                Click restore to rollback your presentation.
                            </TableCaption>
                        )}

                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[70%]">
                                    Snapshot taken
                                </TableHead>
                                <TableHead className="text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {store.presentations[
                                presentationIndex
                            ].versions.map((version, versionIdx) => {
                                return (
                                    <TableRow
                                        key={versionIdx}
                                        data-cy={`tableRow${versionIdx}`}
                                    >
                                        <TableCell
                                            className="text-left font-medium"
                                            data-cy={`timeAgo${versionIdx}`}
                                        >
                                            <TimeAgo
                                                date={version.created}
                                                live={false}
                                            />
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    restoreVersion(versionIdx);
                                                }}
                                                data-cy={`restore${versionIdx}`}
                                            >
                                                Restore
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    <div className="flex flex-col overflow-auto"></div>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};
