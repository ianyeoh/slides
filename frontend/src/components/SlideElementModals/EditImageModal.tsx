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

const editImageSchema = z.object({
    src: z.string().min(1, { message: "Please enter a url or base64 image" }),
    alt: z
        .string()
        .min(1, { message: "Please provide a description of your image" }),
});

type EditImageSchemaType = Zod.infer<typeof editImageSchema>;

export function EditImageModal({
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

    if (element.type !== "image") {
        throw new Error(
            "This shouldn't happen, are you designating element types correctly?"
        );
    }

    const form = useForm<EditImageSchemaType>({
        resolver: zodResolver(editImageSchema),
        defaultValues: {
            src: element.src,
            alt: element.alt,
        },
    });

    const onSubmit = ({ src, alt }: EditImageSchemaType) => {
        const editedElement = {
            ...element,
            src,
            alt,
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
                    <DialogTitle>Edit image element</DialogTitle>
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
                                    <FormLabel>URL / Base64 Image</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="url/base64"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="alt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input placeholder="" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
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
