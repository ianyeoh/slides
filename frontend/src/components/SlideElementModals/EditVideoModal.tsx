import { Dispatch, SetStateAction } from "react";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/AuthContext";
import { useStore, useStoreUpdate } from "@/lib/StoreContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getSlideElement } from "@/lib/StoreHelpers";
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
import { toast } from "sonner";
import { Checkbox } from "../ui/checkbox";

const editVideoSchema = z.object({
    src: z.string(),
    auto: z.boolean(),
});

type EditVideoSchemaType = Zod.infer<typeof editVideoSchema>;

export function EditVideoModal({
    presentationIndex,
    slideIndex,
    slideElementIndex,
    open,
    onOpenChange,
}: {
    presentationIndex: number;
    slideIndex: number;
    slideElementIndex: number;
    open: boolean;
    onOpenChange: Dispatch<SetStateAction<boolean>>;
}) {
    const token = useAuth();
    const store = useStore();
    const storeAction = useStoreUpdate();

    const element = getSlideElement(
        store,
        presentationIndex,
        slideIndex,
        slideElementIndex
    );

    if (!element) {
        throw new Error("Invalid slide element.");
    }

    if (element.type !== "video") {
        throw new Error(
            "This shouldn't happen, are you designating element types correctly?"
        );
    }

    const form = useForm<EditVideoSchemaType>({
        resolver: zodResolver(editVideoSchema),
        defaultValues: {
            src: `https://www.youtube.com/embed/${element.id}`,
            auto: element.auto,
        },
    });

    const onSubmit = ({ src, auto }: EditVideoSchemaType) => {
        const videoId = src.split("/").pop();
        if (!videoId) {
            throw new Error("Somehow, youtube url was invalid!");
        }

        const editedElement = {
            ...element,
            id: videoId,
            auto,
        };

        storeAction({
            type: "updateSlideElement",
            presentationIndex,
            slideIndex,
            elementIndex: slideElementIndex,
            element: editedElement,
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

        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit video element</DialogTitle>
                    <DialogDescription>
                        Click save once you are finished with your changes.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                    >
                        <FormField
                            control={form.control}
                            name="src"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Youtube URL</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter new URL"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="auto"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Autoplay video</FormLabel>
                                    </div>
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
