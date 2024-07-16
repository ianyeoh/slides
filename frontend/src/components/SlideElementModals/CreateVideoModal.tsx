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
import { Loader2, Video } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";

import { MenubarItem } from "@/components/ui/menubar";
import { useState } from "react";

const newVideoElementSchema = z.object({
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
    src: z.string(),
    auto: z.boolean(),
});

type TNewVideoElementSchema = Zod.infer<typeof newVideoElementSchema>;

export function CreateVideoModal({
    presentationIndex,
    slideIndex,
}: {
    presentationIndex: number;
    slideIndex: number;
}) {
    const token = useAuth();
    const storeAction = useStoreUpdate();
    const [open, setOpen] = useState(false);

    const form = useForm<TNewVideoElementSchema>({
        resolver: zodResolver(newVideoElementSchema),
        defaultValues: {
            width: 10,
            height: 10,
            src: "",
            auto: false,
        },
    });

    const onSubmit = ({ width, height, src, auto }: TNewVideoElementSchema) => {
        // Doing in this way because we originally accepted all youtube links but changed to embed links only
        // based on forum posts. So we extract the id here instead of changing any dependent code...
        const videoId = src.split('/')[4].split('?')[0] 

        if (!videoId) {
            throw new Error("Somehow, youtube url was invalid!");
        }

        const element: SlideElementSchema = {
            type: "video",
            id: videoId,
            auto,
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
                    data-cy="createVideoElement"
                >
                    <Video width={15} />
                    Video
                </MenubarItem>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Video Element</DialogTitle>
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
                                        <FormLabel>Youtube URL</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter Youtube URL"
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
                                            <FormLabel>
                                                Autoplay video
                                            </FormLabel>
                                        </div>
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
