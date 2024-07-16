import { AuthProvider, USER_LS_KEY } from "@/lib/AuthContext";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected")({
    beforeLoad: async ({ location }) => {
        if (!localStorage.getItem(USER_LS_KEY)) {
            throw redirect({
                to: "/login",
                search: {
                    redirect: location.href,
                },
            });
        }
    },
    loader: () => {
        return localStorage.getItem(USER_LS_KEY) ?? ""; // shouldn't ever be null though
    },
    component: () => <AuthenticatedPages />,
});

function AuthenticatedPages() {
    const token = Route.useLoaderData();
    return (
        <AuthProvider token={token}>
            <Outlet />
        </AuthProvider>
    );
}
