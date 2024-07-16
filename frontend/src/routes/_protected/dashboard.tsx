import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";

import { defaultStore } from "@/lib/StoreReducer";
import { USER_LS_KEY } from "@/lib/AuthContext";
import { getStore } from "@/lib/api";
import { StoreProvider } from "@/lib/StoreContext";
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { storeSchema } from "@/lib/StoreTypes";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_protected/dashboard")({
    // Load the store on dashboard load
    loader: async function useLoadData() {
        const token = localStorage.getItem(USER_LS_KEY) ?? "";

        const request = await getStore(token);

        if (!request.success) {
            throw request.error;
        }

        const { store } = request.response.data;
        const result = storeSchema.safeParse(store);

        if (!result.success) {
            console.log("Failed to parse store from backend.");
            console.log("Invalid store:", JSON.stringify(store, null, 4));
            console.log("Parse error:", result.error.message);
            return defaultStore;
        }
        return result.data;
    },
    errorComponent: function ErrorComponent({ reset }) {
        const router = useRouter();

        return (
            <div className="flex justify-center items-center h-screen">
                <Card className="w-[400px]">
                    <CardHeader>
                        <CardTitle>Something went wrong</CardTitle>
                        <CardDescription>
                            We failed to fetch your profile from the backend.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-between">
                        <Button
                            variant="outline"
                            onClick={() => {
                                localStorage.removeItem(USER_LS_KEY);
                                router.navigate({ to: "/login" });
                            }}
                        >
                            Log out
                        </Button>
                        <Button
                            onClick={() => {
                                // Reset the router error boundary
                                reset();
                                // Invalidate the route to reload the loader
                                router.invalidate();
                            }}
                        >
                            Retry
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    },
    component: () => <Dashboard />,
});

function Dashboard() {
    const store = Route.useLoaderData();

    return (
        <StoreProvider initialStore={store}>
            <Outlet />
        </StoreProvider>
    );
}
