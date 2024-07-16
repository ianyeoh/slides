import { USER_LS_KEY } from "@/lib/AuthContext";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
    beforeLoad: async () => {
        if (localStorage.getItem(USER_LS_KEY)) {
            throw redirect({
                to: "/dashboard",
            });
        }
    },

    component: () => <Outlet />,
});
