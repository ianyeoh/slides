import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import { useStoreUpdate } from "@/lib/StoreContext";
import { SlideElementSchema } from "@/lib/StoreTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { MenubarItem } from "@/components/ui/menubar";
import { useState } from "react";

const newImageElementSchema = z.object({
    width: z.coerce
        .number()
        .int()
        .gt(0)
        .lte(100, { message: "Please use a value between 0 and 100" }),
    height: z.coerce
        .number()
        .int()
        .gt(0)
        .lte(100, { message: "Please use a value between 0 and 100" }),
    src: z.string().min(1, { message: "Please enter a url or base64 image" }),
    alt: z
        .string()
        .min(1, { message: "Please provide a description of your image" }),
});

type TNewImageElementSchema = Zod.infer<typeof newImageElementSchema>;

export function CreateImageModal({
    presentationIndex,
    slideIndex,
}: {
    presentationIndex: number;
    slideIndex: number;
}) {
    const token = useAuth();
    const storeAction = useStoreUpdate();
    const [open, setOpen] = useState(false);

    const form = useForm<TNewImageElementSchema>({
        resolver: zodResolver(newImageElementSchema),
        defaultValues: {
            width: 10,
            height: 10,
            src: "",
            alt: "",
        },
    });

    const onSubmit = ({ width, height, src, alt }: TNewImageElementSchema) => {
        const element: SlideElementSchema = {
            type: "image",
            src,
            alt,
            pos: {
                width: width / 100,
                height: height / 100,
                x: 0,
                y: 0,
            },
        };

        storeAction({
            type: "createSlideElement",
            element: element,
            presentationIndex,
            slideIndex,
        });

        storeAction({
            type: "saveStore",
            token,
            callback: (request) => {
                if (!request.success) {
                    toast.error("We failed to create your element", {
                        description: `${request.error.message} - #${request.error.code}`,
                    });
                }
            },
        });
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <MenubarItem
                    className="gap-2"
                    onSelect={(e) => e.preventDefault()}
                    data-cy="createImageElement"
                >
                    <Image width={15} />
                    Image
                </MenubarItem>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Image Element</DialogTitle>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-8"
                        >
                            <FormField
                                control={form.control}
                                name="width"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Width %</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter width"
                                                {...field}
                                                type="number"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="height"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Height %</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter height"
                                                {...field}
                                                type="number"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="src"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            URL / Base64 Image
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter image as an image URL, or base64 data URI"
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
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter image description"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex">
                                <Button
                                    type="submit"
                                    className="ml-auto"
                                    disabled={form.formState.isSubmitting}
                                >
                                    {form.formState.isSubmitting ? (
                                        <Loader2 />
                                    ) : (
                                        "Create"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
