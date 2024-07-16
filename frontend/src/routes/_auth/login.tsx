import {
    createFileRoute,
    Link,
    useNavigate,
    useRouterState,
} from "@tanstack/react-router";

const redirectSearchSchema = z.object({
    redirect: z.string().min(1).optional(),
});

/* Page routing */
export const Route = createFileRoute("/_auth/login")({
    component: () => (
        <div className="flex justify-center items-center h-screen">
            <LoginForm />
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
import { login } from "@/lib/api";
import { USER_LS_KEY } from "@/lib/AuthContext";
import { Loader2 } from "lucide-react";

const loginFormSchema = z.object({
    email: z.string().email().min(1),
    password: z.string().min(1),
});

function LoginForm() {
    document.title = "Presto - Log in";
    const { redirect } = Route.useSearch();
    const router = useRouterState();
    const navigate = useNavigate({ from: router.location.pathname });

    const form = useForm<z.infer<typeof loginFormSchema>>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof loginFormSchema>) {
        const { email, password } = values;

        const request = await login(email, password);

        if (request.success) {
            const { token } = request.response.data;
            localStorage.setItem(USER_LS_KEY, token);
            navigate({
                to: redirect ?? "/dashboard",
            });
        } else {
            toast.error("We failed to log you in", {
                description: `${request.error.message} - #${request.error.code}`,
            });
        }
    }

    return (
        <Card className="w-[500px]">
            <CardHeader>
                <CardTitle>Log in</CardTitle>
                <CardDescription>
                    Sign in with your email and password, or{" "}
                    <Link
                        to="/register"
                        search={{ redirect }}
                        className="underline"
                    >
                        register
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
                        <Button
                            type="submit"
                            className="ml-auto"
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? (
                                <Loader2 />
                            ) : (
                                "Log in"
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
