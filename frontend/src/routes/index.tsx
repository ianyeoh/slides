import { createFileRoute, Navigate } from "@tanstack/react-router";

// Just redirect the base url to dashboard. Let the protected route handler
// take care of the auth state.
export const Route = createFileRoute("/")({
    component: () => <Navigate to="/dashboard" />,
});
