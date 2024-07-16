import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";

const newPresentationFormSchema = z.object({
    title: z.string().min(1),
});

export function NewPresentationAction() {
    const token = useAuth();
    const storeAction = useStoreUpdate();

    const [dialogOpen, setDialogOpen] = useState<boolean>(false);

    const form = useForm<z.infer<typeof newPresentationFormSchema>>({
        resolver: zodResolver(newPresentationFormSchema),
        defaultValues: {
            title: "",
        },
    });

    async function onSubmit({
        title,
    }: z.infer<typeof newPresentationFormSchema>) {
        storeAction({
            type: "createPresentation",
            title,
        });

        storeAction({
            type: "saveStore",
            token,
            callback: (request) => {
                if (request.success) {
                    toast.success(
                        `Your presentation ${title} has been created`
                    );
                } else {
                    toast.error("We failed to log you in", {
                        description: `${request.error.message} - #${request.error.code}`,
                    });
                }

                setDialogOpen(false);
                form.reset();
            },
        });
    }

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" data-cy="createPresentationBtn">New presentation</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create a new presentation</DialogTitle>
                    <DialogDescription>
                        Enter the title of your new presentation. Click create
                        when you are done.
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
            </DialogContent>
        </Dialog>
    );
}
