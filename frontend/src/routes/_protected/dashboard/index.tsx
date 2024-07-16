import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/dashboard/")({
    component: () => <DashboardPage />,
});

import { NewPresentationAction } from "@/components/NewPresentationBtn";
import { PresentationCardList } from "@/components/PresentationCardList";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { USER_LS_KEY } from "@/lib/AuthContext";
import { useStoreUpdate } from "@/lib/StoreContext";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { CircleUserRound } from "lucide-react";

function DashboardPage() {
    document.title = "Presto - Dashboard";
    return (
        <div>
            <DashboardNavBar />
            <div className="px-10 py-5">
                <PresentationCardList />
            </div>
        </div>
    );
}

export function DashboardNavBar() {
    const router = useRouterState();
    const navigate = useNavigate({ from: router.location.pathname });
    const storeAction = useStoreUpdate();

    function handleLogout() {
        localStorage.removeItem(USER_LS_KEY);

        navigate({
            to: "/login",
        });

        storeAction({
            type: "resetStore",
        });
    }

    return (
        <div className="flex gap-4 px-8 py-3 items-center">
            <Link className="mr-auto font-light" to="/dashboard">
                Presto
            </Link>
            <NewPresentationAction />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="rounded-full p-2"
                        data-cy="accountMenuBtn"
                    >
                        <CircleUserRound />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={handleLogout}
                        data-cy="logoutBtn"
                    >
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
