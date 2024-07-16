import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute(
    "/_protected/dashboard/presentation/$pIndex"
)({
    component: () => <SlideRedirect />,
});

// Just redirect to first slide
function SlideRedirect() {
    const { pIndex } = Route.useParams();

    return (
        <>
            <Navigate
                to="/dashboard/presentation/$pIndex/slide/$sIndex"
                params={{ pIndex, sIndex: "0" }}
            />
        </>
    );
}
