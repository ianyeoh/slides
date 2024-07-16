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
} from "@/components/ui/form";
import { MenubarItem } from "@/components/ui/menubar";
import { useAuth } from "@/lib/AuthContext";
import { useStore, useStoreUpdate } from "@/lib/StoreContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Palette } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import ColorPicker, { useColorPicker } from "react-best-gradient-color-picker";
import { getPresentation, getSlide } from "@/lib/StoreHelpers";
import { Checkbox } from "@/components/ui/checkbox";

const themeSchema = z.object({
    setDefault: z.boolean(),
});

type TThemeSchema = Zod.infer<typeof themeSchema>;

export function ThemeModal({
    presentationIndex,
    slideIndex,
}: {
    presentationIndex: number;
    slideIndex: number;
}) {
    const token = useAuth();
    const store = useStore();
    const storeAction = useStoreUpdate();

    const presentation = getPresentation(store, presentationIndex);
    if (!presentation) {
        throw new Error("Invalid presentation");
    }

    const slide = getSlide(store, presentationIndex, slideIndex);
    if (!slide) {
        throw new Error("Invalid slide.");
    }

    const [open, setOpen] = useState(false);
    const [color, setColor] = useState(
        slide.theme.color || presentation.data.theme.color
    );
    const { isGradient } = useColorPicker(color, setColor);

    const form = useForm<TThemeSchema>({
        resolver: zodResolver(themeSchema),
        defaultValues: {
            setDefault: false,
        },
    });

    const onSubmit = async ({ setDefault }: TThemeSchema) => {
        if (setDefault) {
            storeAction({
                type: "updateDefaultTheme",
                presentationIndex,
                theme: {
                    isGradient,
                    color,
                },
            });
        }

        storeAction({
            type: "updateSlideTheme",
            presentationIndex,
            slideIndex,
            theme: {
                isGradient,
                color,
            },
        });

        storeAction({
            type: "saveStore",
            token,
            callback: (request) => {
                if (!request.success) {
                    toast.error("We failed to update your theme", {
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
                >
                    <Palette width={15} />
                    Theme
                </MenubarItem>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Set slide theme</DialogTitle>
                    <div className="flex flex-col justify-around">
                        <div className="overflow-auto">
                            <ColorPicker
                                value={color}
                                onChange={setColor}
                                hideEyeDrop={true}
                                hideAdvancedSliders={true}
                                hideColorGuide={true}
                                hideInputType={true}
                                hideGradientStop={true}
                            />
                        </div>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-8 mt-4"
                            >
                                <FormField
                                    control={form.control}
                                    name="setDefault"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    Set as default theme
                                                </FormLabel>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <div className="flex">
                                    <Button
                                        type="submit"
                                        disabled={form.formState.isSubmitting}
                                    >
                                        {form.formState.isSubmitting ? (
                                            <Loader2 />
                                        ) : (
                                            "Set Theme"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
