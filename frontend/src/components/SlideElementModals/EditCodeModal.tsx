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

const editCodeSchema = z.object({
    fontSize: z.coerce.number().gt(0),
});

type EditCodeSchemaType = Zod.infer<typeof editCodeSchema>;

export function EditCodeModal({
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

    if (element.type !== "code") {
        throw new Error(
            "This shouldn't happen, are you designating element types correctly?"
        );
    }

    const form = useForm<EditCodeSchemaType>({
        resolver: zodResolver(editCodeSchema),
        defaultValues: {
            fontSize: element.fontSize,
        },
    });

    const onSubmit = ({ fontSize }: EditCodeSchemaType) => {
        const editedElement = {
            ...element,
            fontSize,
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
                    <DialogTitle>Edit code element</DialogTitle>
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
                            name="fontSize"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Font size (em)</FormLabel>
                                    <FormControl>
                                        <Input
                                            data-cy="fontSize"
                                            placeholder="Enter new font size"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage data-cy="error" />
                                </FormItem>
                            )}
                        />

                        <div className="flex">
                            <Button
                                type="submit"
                                className="ml-auto"
                                data-cy="submit"
                            >
                                Save
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
