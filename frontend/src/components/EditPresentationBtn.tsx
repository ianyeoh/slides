import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/AuthContext";
import { useStore, useStoreUpdate } from "@/lib/StoreContext";
import { getPresentation } from "@/lib/StoreHelpers";
import { toast } from "sonner";
import { APIReturn } from "@/lib/api";
import { useState } from "react";
import { fileToDataUrl } from "@/lib/utils";

const changeTitleFormSchema = z.object({
    title: z.string().min(1),
    thumbnail: z.string().optional(),
});

export function EditPresentationTitleBtn({
    presentationIndex,
}: {
    presentationIndex: number;
}) {
    const token = useAuth();
    const store = useStore();
    const storeAction = useStoreUpdate();
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [file, setFile] = useState<File | null>(null);

    if (!getPresentation(store, presentationIndex)) {
        throw new Error("Invalid presentation index");
    }

    const form = useForm<z.infer<typeof changeTitleFormSchema>>({
        resolver: zodResolver(changeTitleFormSchema),
        defaultValues: {
            title: store.presentations[presentationIndex].data.title,
            thumbnail: "",
        },
    });

    async function onSubmit({
        title,
        thumbnail,
    }: z.infer<typeof changeTitleFormSchema>) {
        setDialogOpen(false);

        const editedPresentation = {
            ...store.presentations[presentationIndex],
        };

        editedPresentation.data.title = title;

        if (thumbnail !== "" && file !== null) {
            editedPresentation.data.thumbnail = await fileToDataUrl(file);
        }

        toast.promise(
            new Promise((resolve, reject) => {
                storeAction({
                    type: "editPresentation",
                    presentationIndex,
                    presentation: editedPresentation,
                });

                storeAction({
                    type: "saveStore",
                    token,
                    callback: (request) => {
                        if (request.success) {
                            resolve(request);
                        } else {
                            reject(request);
                        }
                    },
                });
            }),
            {
                loading: "Saving...",
                success: () => {
                    return "Presentation edited successfully";
                },
                error: (request: APIReturn) => {
                    if (request.success) return; // satisfy typescript

                    return `We failed to edit your presentation: ${request.error.message} - #${request.error.code}`;
                },
            }
        );
    }

    return (
        <Dialog
            open={dialogOpen}
            onOpenChange={(change) => {
                form.reset();
                setDialogOpen(change);
            }}
        >
            <DialogTrigger>
                <Pencil width={15} data-cy="editPresentationBtn"/>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit presentation title</DialogTitle>
                    <DialogDescription>
                        Click save once you are satisfied with your changes.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                    >
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter presentation title"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="thumbnail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Thumbnail</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Upload thumbnail"
                                            type="file"
                                            accept="image/jpeg, image/jpg, image/png"
                                            value={field.value ?? ""}
                                            onChange={(e) => {
                                                const files = Array.from(
                                                    e.target.files ?? []
                                                );

                                                if (files.length > 0) {
                                                    setFile(files[0]);
                                                }
                                                field.onChange(e.target.value);
                                            }}
                                            className="cursor-pointer"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex">
                            <Button type="submit" className="ml-auto">
                                Save
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
