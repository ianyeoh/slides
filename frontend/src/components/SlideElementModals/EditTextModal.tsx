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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { fonts } from "@/lib/fonts";

const editTextSchema = z.object({
    fontSize: z.coerce.number().gt(0),
    textColour: z.string().regex(new RegExp(/^#[0-9a-fA-F]{6}$/), {
        message: "Hex value expected",
    }),
    fontFamily: z.string(),
});

type EditTextSchemaType = Zod.infer<typeof editTextSchema>;

export function EditTextModal({
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

    if (element.type !== "text") {
        throw new Error(
            "This shouldn't happen, are you designating element types correctly?"
        );
    }

    const form = useForm<EditTextSchemaType>({
        resolver: zodResolver(editTextSchema),
        defaultValues: {
            fontSize: element.fontSize,
            textColour: element.textColour,
            fontFamily: element.fontFamily,
        },
    });

    const onSubmit = ({
        fontSize,
        textColour,
        fontFamily,
    }: EditTextSchemaType) => {
        const editedElement = {
            ...element,
            fontFamily,
            fontSize,
            textColour,
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
                    <DialogTitle>Edit text element</DialogTitle>
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
                                            placeholder="Enter new font size"
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
                                    <FormLabel>Text colour</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter new text colour"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        This must be a HEX value.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="fontFamily"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Font family</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "w-[200px] justify-between",
                                                        !field.value &&
                                                            "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value
                                                        ? fonts.find(
                                                              (font) =>
                                                                  font.value ===
                                                                  field.value
                                                          )?.label
                                                        : "Select font"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[200px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search font..." />
                                                <CommandEmpty>
                                                    No fonts found.
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    <CommandList>
                                                        {fonts.map((font) => (
                                                            <CommandItem
                                                                value={
                                                                    font.label
                                                                }
                                                                key={font.value}
                                                                onSelect={() => {
                                                                    form.setValue(
                                                                        "fontFamily",
                                                                        font.value
                                                                    );
                                                                }}
                                                                style={{
                                                                    fontFamily:
                                                                        font.value,
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        font.value ===
                                                                            field.value
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                {font.label}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandList>
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
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
