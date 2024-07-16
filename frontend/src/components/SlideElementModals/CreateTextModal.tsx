import {
    Dialog,
    DialogContent,
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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/AuthContext";
import { useStoreUpdate } from "@/lib/StoreContext";
import { SlideElementSchema } from "@/lib/StoreTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Text } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { MenubarItem } from "@/components/ui/menubar";
import { useState } from "react";
import { defaultFont } from "@/lib/fonts";

const newTextElementSchema = z.object({
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
    text: z.string(),
    fontSize: z.coerce.number().gt(0),
    textColour: z.string().regex(new RegExp(/^#[0-9a-fA-F]{6}$/), {
        message: "Hex value expected",
    }),
});

type TNewTextElementSchema = Zod.infer<typeof newTextElementSchema>;

export function CreateTextModal({
    presentationIndex,
    slideIndex,
}: {
    presentationIndex: number;
    slideIndex: number;
}) {
    const token = useAuth();
    const storeAction = useStoreUpdate();
    const [open, setOpen] = useState(false);

    const form = useForm<TNewTextElementSchema>({
        resolver: zodResolver(newTextElementSchema),
        defaultValues: {
            width: 10,
            height: 10,
            text: "",
            fontSize: 1,
            textColour: "#000000",
        },
    });

    const onSubmit = ({
        width,
        height,
        text,
        fontSize,
        textColour,
    }: TNewTextElementSchema) => {
        const element: SlideElementSchema = {
            type: "text",
            fontSize,
            fontFamily: defaultFont,
            text,
            textColour,
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
                    data-cy="createTextElement"
                >
                    <Text width={15} />
                    Text
                </MenubarItem>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Text Element</DialogTitle>
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
                                name="text"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Text</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter text"
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="fontSize"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Font Size (em)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter font size"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="textColour"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Text Colour (HEX)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter text colour"
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
