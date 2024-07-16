import { createRootRoute, Outlet } from "@tanstack/react-router";
// import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Toaster } from "@/components/ui/sonner";
import { NotFoundPage } from "@/components/NotFoundPage";

export const Route = createRootRoute({
    component: () => (
        <>
            <Outlet />
            <Toaster closeButton />
            {/* <TanStackRouterDevtools /> */}
        </>
    ),
    notFoundComponent: () => <NotFoundPage />,
});
