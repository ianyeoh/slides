import {
    createFileRoute,
    Link,
    useNavigate,
    useRouterState,
} from "@tanstack/react-router";

const redirectSearchSchema = z.object({
    redirect: z.string().min(1).optional(),
});

export const Route = createFileRoute("/_auth/register")({
    component: () => (
        <div className="flex justify-center items-center h-screen">
            <RegisterForm />
        </div>
    ),
    validateSearch: (search) => redirectSearchSchema.parse(search),
});

/* The login form */
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import { putStore, register } from "@/lib/api";
import { USER_LS_KEY } from "@/lib/AuthContext";
import { Loader2 } from "lucide-react";
import { defaultStore } from "@/lib/StoreReducer";

const registerFormSchema = z
    .object({
        name: z.string().min(1),
        email: z.string().email().min(1),
        password: z.string().min(1),
        confirmPassword: z.string().min(1),
    })
    .refine(
        ({ password, confirmPassword }) => {
            return password === confirmPassword;
        },
        {
            message: "Passwords do not match",
            path: ["confirmPassword"],
        }
    );

function RegisterForm() {
    document.title = "Presto - Register";
    const { redirect } = Route.useSearch();
    const router = useRouterState();
    const navigate = useNavigate({ from: router.location.pathname });

    const form = useForm<z.infer<typeof registerFormSchema>>({
        resolver: zodResolver(registerFormSchema),
        defaultValues: {
            email: "",
            password: "",
            name: "",
            confirmPassword: "",
        },
    });

    async function onSubmit(values: z.infer<typeof registerFormSchema>) {
        const { email, password, name } = values;

        const request = await register(email, password, name);
        if (request.success) {
            const { token } = request.response.data;
            localStorage.setItem(USER_LS_KEY, token);
            await putStore(token, defaultStore); // init a default store
            navigate({
                to: redirect ?? "/dashboard",
            });
        } else {
            toast.error("We failed to create a your new account", {
                description: `${request.error.message} - #${request.error.code}`,
            });
        }
    }

    return (
        <Card className="w-[500px]">
            <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription>
                    Sign up as a new user, or{" "}
                    <Link
                        to="/login"
                        search={{ redirect }}
                        className="underline"
                    >
                        sign in
                    </Link>{" "}
                    instead
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="user@email.com"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Hayden Smith"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your password"
                                            type="password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm password</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your password again"
                                            type="password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="ml-auto"
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? (
                                <Loader2 />
                            ) : (
                                "Register"
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
